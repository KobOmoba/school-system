/**
 * Real-time OCR streaming service
 * Sends OCR results to Agent App as they're detected
 */

const admin = require('firebase-admin');

class RealtimeOCRStream {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Stream OCR results in real-time
   * Called as each student is detected
   */
  async streamOCRResult(schoolId, sessionId, student, index, total) {
    try {
      // Save to realtime collection for live updates
      await this.db
        .collection('schools')
        .doc(schoolId)
        .collection('ocrSessions')
        .doc(sessionId)
        .collection('results')
        .doc(`student_${index}`)
        .set({
          index,
          total,
          student,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          progress: Math.round((index / total) * 100)
        });

      // Update session progress
      await this.db
        .collection('schools')
        .doc(schoolId)
        .collection('ocrSessions')
        .doc(sessionId)
        .update({
          processedCount: index,
          totalCount: total,
          progress: Math.round((index / total) * 100),
          lastUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

      return { success: true, progress: Math.round((index / total) * 100) };
    } catch (error) {
      console.error('Stream error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start new OCR session
   */
  async startSession(schoolId, agentId, ledgerImagePath) {
    try {
      const sessionRef = await this.db
        .collection('schools')
        .doc(schoolId)
        .collection('ocrSessions')
        .add({
          status: 'processing',
          agentId,
          ledgerImagePath,
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          processedCount: 0,
          totalCount: 0,
          progress: 0
        });

      return sessionRef.id;
    } catch (error) {
      console.error('Session start error:', error);
      throw error;
    }
  }

  /**
   * Complete OCR session
   */
  async completeSession(schoolId, sessionId, finalData) {
    try {
      await this.db
        .collection('schools')
        .doc(schoolId)
        .collection('ocrSessions')
        .doc(sessionId)
        .update({
          status: 'completed',
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
          finalData,
          progress: 100
        });

      return { success: true };
    } catch (error) {
      console.error('Session complete error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = RealtimeOCRStream;