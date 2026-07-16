import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload ledger image
export const uploadLedgerImage = async (schoolId, file) => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `ledger-images/${schoolId}/ledger-${timestamp}.jpg`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      path: snapshot.ref.fullPath,
      url: downloadURL,
      timestamp
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

// Upload school document
export const uploadSchoolDocument = async (schoolId, file, docType) => {
  try {
    const timestamp = Date.now();
    const storageRef = ref(storage, `school-documents/${schoolId}/${docType}-${timestamp}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      path: snapshot.ref.fullPath,
      url: downloadURL,
      timestamp
    };
  } catch (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }
};

// Delete storage file
export const deleteStorageFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};