/**
 * Parse school fees ledger OCR text
 * Handles Nigerian handwritten ledger format
 */

export const parseLedgerText = (ocrText) => {
  const lines = ocrText.split('\n').filter(line => line.trim());
  const ledgerData = {
    students: [],
    totalCollection: 0,
    class: null,
    term: null,
    year: null,
    errors: []
  };

  // Extract header info
  const classMatch = ocrText.match(/CLASS[\s:]*([K\d\w]+)/i);
  const termMatch = ocrText.match(/TERM[\s:]*([\d\w]+)/i);
  const yearMatch = ocrText.match(/YEAR[\s:]*([\d]+)/i);

  if (classMatch) ledgerData.class = classMatch[1].trim();
  if (termMatch) ledgerData.term = termMatch[1].trim();
  if (yearMatch) ledgerData.year = yearMatch[1].trim();

  // Parse student records
  let currentStudent = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip header lines
    if (line.match(/NAMES|BALANCE|PAYMENT/i)) continue;
    
    // Try to parse student record
    const studentMatch = line.match(/^([\d]+)\.?\s+([A-Z][A-Z\s]+?)\s+([A-Z][A-Z\s]+?)/);
    
    if (studentMatch) {
      if (currentStudent) {
        ledgerData.students.push(currentStudent);
      }
      
      currentStudent = {
        serialNo: studentMatch[1].trim(),
        firstName: studentMatch[2].trim(),
        lastName: studentMatch[3].trim(),
        fullName: `${studentMatch[2].trim()} ${studentMatch[3].trim()}`,
        fees: {},
        requiresReview: false
      };
    }
  }

  if (currentStudent) {
    ledgerData.students.push(currentStudent);
  }

  return ledgerData;
};

/**
 * Validate and correct Nigerian names
 * Uses fuzzy matching for common OCR errors
 */
export const normalizeNigerianName = (name) => {
  if (!name) return '';
  
  // Common OCR confusions with Nigerian names
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

  return corrected;
};

/**
 * Extract numerical data (fees, balances) from OCR
 */
export const extractNumbers = (text) => {
  const numberPattern = /[0-9,]+/g;
  const matches = text.match(numberPattern) || [];
  
  return matches.map(match => {
    const cleaned = match.replace(/,/g, '');
    return parseInt(cleaned, 10);
  }).filter(num => !isNaN(num));
};

/**
 * Calculate confidence score for OCR result
 */
export const calculateOCRConfidence = (ocrResult) => {
  let score = 1.0;
  
  // Reduce score if names contain numbers
  if (ocrResult.fullName.match(/[0-9]/)) score -= 0.3;
  
  // Reduce score if unusual character patterns
  if (ocrResult.fullName.match(/[^A-Z\s]/)) score -= 0.2;
  
  return Math.max(0, score);
};