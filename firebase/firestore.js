import { db } from './config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';

// Create school record
export const createSchool = async (schoolData) => {
  try {
    const docRef = await addDoc(collection(db, 'schools'), {
      ...schoolData,
      status: 'pending',
      createdAt: serverTimestamp(),
      verifiedAt: null
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to create school: ${error.message}`);
  }
};

// Update school status
export const updateSchoolStatus = async (schoolId, status, verifiedData = null) => {
  try {
    const updateData = {
      status,
      updatedAt: serverTimestamp()
    };
    if (verifiedData) updateData.verifiedData = verifiedData;
    if (status === 'approved') updateData.verifiedAt = serverTimestamp();
    
    await updateDoc(doc(db, 'schools', schoolId), updateData);
  } catch (error) {
    throw new Error(`Failed to update school: ${error.message}`);
  }
};

// Get pending schools
export const getPendingSchools = async () => {
  try {
    const q = query(collection(db, 'schools'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error(`Failed to fetch schools: ${error.message}`);
  }
};

// Create student record
export const createStudent = async (studentData) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to create student: ${error.message}`);
  }
};

// Update student fees
export const updateStudentFees = async (studentId, feeData) => {
  try {
    await updateDoc(doc(db, 'students', studentId), {
      fees: feeData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    throw new Error(`Failed to update fees: ${error.message}`);
  }
};

// Create attendance record
export const createAttendanceRecord = async (attendanceData) => {
  try {
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...attendanceData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to create attendance: ${error.message}`);
  }
};