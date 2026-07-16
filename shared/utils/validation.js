/**
 * Validate school data
 */
export const validateSchoolData = (schoolData) => {
  const errors = [];

  if (!schoolData.name || schoolData.name.trim().length < 2) {
    errors.push('School name is required and must be at least 2 characters');
  }

  if (!schoolData.email || !schoolData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!schoolData.address || schoolData.address.trim().length < 5) {
    errors.push('School address is required');
  }

  if (!schoolData.principalName || schoolData.principalName.trim().length < 2) {
    errors.push('Principal name is required');
  }

  if (!schoolData.phoneNumber || !schoolData.phoneNumber.match(/^[+]?[0-9]{10,}$/)) {
    errors.push('Valid phone number is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate student data
 */
export const validateStudentData = (studentData) => {
  const errors = [];

  if (!studentData.fullName || studentData.fullName.trim().length < 2) {
    errors.push('Student name is required');
  }

  if (!studentData.studentId || studentData.studentId.trim().length < 2) {
    errors.push('Student ID is required');
  }

  if (studentData.fees && typeof studentData.fees.totalOwed !== 'number') {
    errors.push('Valid total fee amount is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate fee amounts
 */
export const validateFeeAmount = (amount) => {
  if (typeof amount !== 'number' || amount < 0) {
    return { isValid: false, error: 'Fee must be a positive number' };
  }
  if (amount > 10000000) {
    return { isValid: false, error: 'Fee amount seems too large' };
  }
  return { isValid: true };
};