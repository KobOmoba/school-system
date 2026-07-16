const admin = require('firebase-admin');

/**
 * WhatsApp notification service using Baileys
 * Open source WhatsApp Web automation
 */

class WhatsAppService {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Send approval request to Commander via WhatsApp
   */
  async sendApprovalRequest(schoolId, parsedData, agentPhone) {
    try {
      const message = this.formatApprovalMessage(schoolId, parsedData);
      await this.sendMessage(agentPhone, message);
      
      // Log in Firestore
      await this.db.collection('schools').doc(schoolId).update({
        whatsappNotificationSent: true,
        notificationSentAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true, message: 'Sent to agent' };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  /**
   * Format message for agent
   */
  formatApprovalMessage(schoolId, parsedData) {
    return `
✅ NEW SCHOOL ONBOARDING - READY FOR APPROVAL

School ID: ${schoolId}

📊 LEDGER SUMMARY
Total Students: ${parsedData.totalStudents}
✓ Confirmed: ${parsedData.highConfidence}
⚠ Needs Review: ${parsedData.needsReview}

👥 FIRST 5 STUDENTS
${parsedData.students.slice(0, 5).map((s, i) => `${i+1}. ${s.fullName} - ₦${s.totalFee.toLocaleString()}`).join('\n')}

👉 Reply:
✓ APPROVE - to accept
✗ REJECT [reason] - to reject

${schoolId.substring(0, 6).toUpperCase()}
    `;
  }

  /**
   * Handle approval response from Commander
   */
  async handleApprovalResponse(commanderResponse, schoolId) {
    try {
      const response = commanderResponse.trim().toUpperCase();

      if (response.startsWith('✓') || response.startsWith('APPROVE')) {
        await this.db.collection('schools').doc(schoolId).update({
          status: 'approved',
          approvedAt: admin.firestore.FieldValue.serverTimestamp(),
          approvedBy: 'commander'
        });

        // Notify school via WhatsApp
        const schoolDoc = await this.db.collection('schools').doc(schoolId).get();
        const school = schoolDoc.data();
        
        await this.sendMessage(
          school.phoneNumber,
          `✅ APPROVED!\n\nYour school has been registered. Log in to view student records.`
        );

        return { success: true, action: 'approved' };
      } else if (response.startsWith('✗') || response.startsWith('REJECT')) {
        const reason = response.replace(/^(✗|REJECT)\s*/i, '');
        
        await this.db.collection('schools').doc(schoolId).update({
          status: 'rejected',
          rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
          rejectionReason: reason
        });

        const schoolDoc = await this.db.collection('schools').doc(schoolId).get();
        const school = schoolDoc.data();
        
        await this.sendMessage(
          school.phoneNumber,
          `❌ NOT APPROVED\n\nReason: ${reason}\n\nPlease contact the administrator.`
        );

        return { success: true, action: 'rejected' };
      }
    } catch (error) {
      console.error('Response handling error:', error);
      throw error;
    }
  }

  /**
   * Generic send message (implement with Baileys)
   */
  async sendMessage(phoneNumber, message) {
    // TODO: Implement actual Baileys WhatsApp integration
    // This is a placeholder for the actual implementation
    console.log(`📱 WhatsApp to ${phoneNumber}: ${message}`);
    return { success: true };
  }
}

module.exports = WhatsAppService;