import React, { useState } from 'react';
import { uploadLedgerImage } from '@firebase/storage';
import { db } from '@firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const UploadProgress = ({ onUploadComplete, schoolId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Upload to Firebase Storage
      const uploadResult = await uploadLedgerImage(schoolId, file);
      setProgress(50);

      // Save to Firestore
      await addDoc(collection(db, 'schools', schoolId, 'ledgerScans'), {
        imageUrl: uploadResult.url,
        storagePath: uploadResult.path,
        uploadedAt: serverTimestamp(),
        status: 'pending_ocr',
        fileName: file.name
      });
      setProgress(100);

      setTimeout(() => {
        onUploadComplete(uploadResult);
      }, 500);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">☁️ Upload to Firebase</h3>
      
      {error && <div className="alert alert-error">{error}</div>}

      {isUploading && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress}% uploaded</p>
        </div>
      )}

      <button
        onClick={() => handleUpload(null)}
        disabled={isUploading}
        className="btn btn-primary w-full"
      >
        {isUploading ? '⏳ Uploading...' : '✓ Complete Upload'}
      </button>
    </div>
  );
};

export default UploadProgress;