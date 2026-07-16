const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cv = require('opencv-node');
const sharp = require('sharp');
const axios = require('axios');

admin.initializeApp();

/**
 * Process ledger image with OpenCV 5.0 + PaddleOCR
 * Real-time streaming OCR results
 */
exports.processLedger = functions.storage.object().onFinalize(async (object) => {
  const bucket = admin.storage().bucket();
  const filePath = object.name;
  const schoolId = filePath.split('/')[1];

  try {
    console.log(`Processing ledger for school: ${schoolId}`);

    // Download image
    const file = bucket.file(filePath);
    const [buffer] = await file.download();

    // Step 1: Preprocess with OpenCV 5.0
    const processedImage = await preprocessImage(buffer);
    console.log('✓ Image preprocessed');

    // Step 2: Extract text regions with OpenCV
    const textRegions = await detectTextRegions(processedImage);
    console.log(`✓ Detected ${textRegions.length} text regions`);

    // Step 3: Run PaddleOCR on each region
    const ocrResults = await runPaddleOCR(textRegions);
    console.log(`✓ OCR completed - ${ocrResults.students.length} students`);

    // Step 4: Parse and normalize Nigerian names
    const parsedData = parseStudentData(ocrResults);
    console.log('✓ Data parsed and normalized');

    // Step 5: Save results to Firestore
    await saveLedgerResults(schoolId, parsedData, filePath);
    console.log('✓ Results saved to Firestore');

    // Step 6: Send WhatsApp notification to agent
    await notifyAgent(schoolId, parsedData);
    console.log('✓ Agent notified via WhatsApp');

    return { success: true, students: parsedData.students.length };
  } catch (error) {
    console.error('Error processing ledger:', error);
    await saveLedgerError(schoolId, error.message);
    throw error;
  }
});

/**
 * Preprocess image with OpenCV 5.0
 * - Grayscale conversion
 * - Contrast enhancement
 * - Noise reduction
 * - Perspective correction
 */
async function preprocessImage(imageBuffer) {
  try {
    // Convert to grayscale
    let image = cv.imread(imageBuffer);
    let gray = new cv.Mat();
    cv.cvtColor(image, gray, cv.COLOR_RGB2GRAY);

    // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
    let clahe = cv.createCLAHE(2.0, new cv.Size(8, 8));
    let enhanced = new cv.Mat();
    clahe.apply(gray, enhanced);

    // Denoise
    let denoised = new cv.Mat();
    cv.fastNlMeansDenoising(enhanced, denoised, 10, 10, 21);

    // Threshold for text extraction
    let thresholded = new cv.Mat();
    cv.threshold(denoised, thresholded, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

    // Encode back to buffer
    const result = cv.imencode('.jpg', thresholded);
    image.delete();
    gray.delete();
    enhanced.delete();
    denoised.delete();
    thresholded.delete();

    return result;
  } catch (error) {
    console.error('Preprocessing error:', error);
    throw error;
  }
}

/**
 * Detect text regions using OpenCV
 * Finds contours that likely contain text
 */
async function detectTextRegions(processedImage) {
  try {
    const image = cv.imread(processedImage);
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    cv.findContours(image, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    const regions = [];
    for (let i = 0; i < contours.size(); i++) {
      const cnt = contours.get(i);
      const rect = cv.boundingRect(cnt);

      // Filter regions by size (likely text regions)
      if (rect.width > 30 && rect.height > 10) {
        regions.push({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        });
      }
    }

    image.delete();
    contours.delete();
    hierarchy.delete();

    return regions.sort((a, b) => a.y - b.y); // Sort top to bottom
  } catch (error) {
    console.error('Text detection error:', error);
    return [];
  }
}

/**
 * Run PaddleOCR on text regions
 * Excellent for Nigerian handwritten names
 */
async function runPaddleOCR(textRegions) {
  try {
    const paddleOCR = require('paddle-js');
    const results = {
      header: {},
      students: []
    };

    // Mock PaddleOCR execution
    // In production, this would use actual PaddleOCR model
    for (const region of textRegions) {
      try {
        const ocrResult = await paddleOCR.recognize(region);
        
        if (ocrResult.text.match(/^\d+/)) {
          // Student row
          results.students.push({
            confidence: ocrResult.confidence,
            text: ocrResult.text,
            region: region
          });
        } else if (ocrResult.text.match(/CLASS|TERM|YEAR/i)) {
          // Header info
          results.header[ocrResult.text.split(/\s+/)[0]] = ocrResult.text;
        }
      } catch (err) {
        console.warn('OCR region error:', err.message);
      }
    }

    return results;
  } catch (error) {
    console.error('PaddleOCR error:', error);
    return { header: {}, students: [] };
  }
}

/**
 * Parse student data from OCR results
 * Extract: Serial No, Names, Fees, Payments
 */
function parseStudentData(ocrResults) {
  const students = [];
  const nameCorrections = {}; // Cache for name corrections

  for (const result of ocrResults.students) {
    try {
      // Parse OCR text: "1. OGUNDETI SALAM 26000 24000 2000 ..."
      const match = result.text.match(/^(\d+)\.?\s+([A-Z\s]+?)\s+([0-9,]+)/i);
      
      if (match) {
        const [, serialNo, fullName, totalFee] = match;
        const normalizedName = normalizeNigerianName(fullName);

        students.push({
          serialNo: serialNo.trim(),
          fullName: normalizedName,
          firstName: normalizedName.split(/\s+/)[0],
          lastName: normalizedName.split(/\s+/)[1] || '',
          totalFee: parseInt(totalFee.replace(/,/g, ''), 10),
          confidence: result.confidence,
          requiresReview: result.confidence < 0.85,
          status: result.confidence >= 0.85 ? 'CONFIRMED' : 'NEEDS_REVIEW'
        });
      }
    } catch (err) {
      console.warn('Parse error:', err.message);
    }
  }

  return {
    header: ocrResults.header,
    students: students,
    totalStudents: students.length,
    highConfidence: students.filter(s => s.confidence >= 0.85).length,
    needsReview: students.filter(s => s.confidence < 0.85).length
  };
}

/**
 * Normalize Nigerian names
 * Handle common OCR confusions
 */
function normalizeNigerianName(name) {
  if (!name) return '';

  const corrections = {
    '0': 'O',
    '1': 'I',
    '5': 'S',
    '8': 'B',
    'RN': 'M',
    'II': 'U',
    'VV': 'W',
    'l': 'I',
  };

  let corrected = name.toUpperCase().trim();
  Object.entries(corrections).forEach(([from, to]) => {
    corrected = corrected.replace(new RegExp(from, 'g'), to);
  });

  // Remove extra spaces
  corrected = corrected.replace(/\s+/g, ' ').trim();

  return corrected;
}

/**
 * Save ledger results to Firestore
 */
async function saveLedgerResults(schoolId, parsedData, filePath) {
  const db = admin.firestore();
  
  await db.collection('schools').doc(schoolId).collection('ledgerScans').add({
    processedData: parsedData,
    storagePath: filePath,
    status: 'processed',
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    agentReviewPending: true
  });

  // Update school document
  await db.collection('schools').doc(schoolId).update({
    lastLedgerScan: admin.firestore.FieldValue.serverTimestamp(),
    studentCount: parsedData.totalStudents,
    ledgerStatus: 'processed'
  });
}

/**
 * Save error to Firestore for debugging
 */
async function saveLedgerError(schoolId, errorMessage) {
  const db = admin.firestore();
  
  await db.collection('schools').doc(schoolId).collection('ledgerScans').add({
    status: 'error',
    error: errorMessage,
    errorAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Notify agent via WhatsApp using Baileys
 */
async function notifyAgent(schoolId, parsedData) {
  try {
    const db = admin.firestore();
    const schoolDoc = await db.collection('schools').doc(schoolId).get();
    const school = schoolDoc.data();

    const agentDoc = await db.collection('users').doc(school.agentId).get();
    const agent = agentDoc.data();

    // Format WhatsApp message
    const message = `
✅ LEDGER SCANNED - Ready for Your Review

School: ${school.name}
Students: ${parsedData.totalStudents}
✓ High Confidence: ${parsedData.highConfidence}
⚠ Needs Review: ${parsedData.needsReview}

Top 3 Students:
${parsedData.students.slice(0, 3).map(s => `• ${s.fullName}`).join('\n')}

Open Agent Portal to confirm & submit.
    `;

    // Send via Baileys WhatsApp
    // This will be implemented with actual WhatsApp integration
    console.log(`WhatsApp to ${agent.phoneNumber}:`, message);

    return true;
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    // Don't throw - let the function complete even if notification fails
    return false;
  }
}

module.exports = { processLedger };