const admin = require('firebase-admin');

/**
 * Baileys WhatsApp Integration
 * Pure open-source WhatsApp Web automation
 */

const Baileys = require('@whiskeysockets/baileys');
const { useMultiFileAuthState } = Baileys;

class BaileysWhatsApp {
  constructor() {
    this.client = null;
    this.db = admin.firestore();
  }

  /**
   * Initialize WhatsApp connection
   * Scans QR code once, stores credentials
   */
  async initialize() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
      
      this.client = Baileys.default({
        auth: state,
        printQRInTerminal: true,
        browser: Baileys.Browsers.ubuntu('Chrome')
      });

      this.client.ev.on('creds.update', saveCreds);

      this.client.ev.on('messages.upsert', async (m) => {
        for (const msg of m.messages) {
          if (!msg.key.fromMe && msg.message) {
            await this.handleIncomingMessage(msg);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Baileys initialization error:', error);
      return false;
    }
  }

  /**
   * Send WhatsApp message
   */
  async send(phoneNumber, message) {
    try {
      const jid = phoneNumber + '@s.whatsapp.net';
      await this.client.sendMessage(jid, { text: message });
      return { success: true };
    } catch (error) {
      console.error('Send error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming approval/rejection messages
   */
  async handleIncomingMessage(msg) {
    try {
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const senderNumber = msg.key.remoteJid.replace('@s.whatsapp.net', '');

      // Find commander who sent this
      const commanderDoc = await this.db.collection('users')
        .where('phoneNumber', '==', senderNumber)
        .where('role', '==', 'commander')
        .limit(1)
        .get();

      if (commanderDoc.empty) return;

      // Parse response and update school status
      if (text.toUpperCase().includes('✓') || text.toUpperCase().includes('APPROVE')) {
        // Extract school ID from message
        const schoolId = this.extractSchoolId(text);
        if (schoolId) {
          await this.db.collection('schools').doc(schoolId).update({
            status: 'approved',
            approvedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      } else if (text.toUpperCase().includes('✗') || text.toUpperCase().includes('REJECT')) {
        const schoolId = this.extractSchoolId(text);
        if (schoolId) {
          await this.db.collection('schools').doc(schoolId).update({
            status: 'rejected',
            rejectedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  /**
   * Extract school ID from message
   */
  extractSchoolId(text) {
    const match = text.match(/([A-F0-9]{8})/i);
    return match ? match[1] : null;
  }
}

module.exports = BaileysWhatsApp;