import { useState, useCallback } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDocument = useCallback(async (collectionName, docId) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCollection = useCallback(async (collectionName, conditions = []) => {
    setLoading(true);
    try {
      let q = collection(db, collectionName);
      if (conditions.length > 0) {
        const whereConditions = conditions.map(c => where(c.field, c.operator, c.value));
        q = query(q, ...whereConditions);
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (collectionName, docId, data) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDocument = useCallback(async (collectionName, data) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, fetchDocument, fetchCollection, updateDocument, addDocument };
};