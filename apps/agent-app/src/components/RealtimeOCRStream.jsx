import React, { useState, useEffect } from 'react';
import { db } from '@firebase/config';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const RealtimeOCRStream = ({ schoolId, sessionId }) => {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [totalExpected, setTotalExpected] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!schoolId || !sessionId) return;

    // Subscribe to real-time OCR results
    const resultsQuery = query(
      collection(db, 'schools', schoolId, 'ocrSessions', sessionId, 'results'),
      orderBy('index', 'asc')
    );

    const unsubscribe = onSnapshot(resultsQuery, (snapshot) => {
      const newStudents = [];
      let processedCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        newStudents.push({
          ...data.student,
          index: data.index,
          confidence: data.student.confidence,
          requiresReview: data.student.confidence < 0.85
        });
        processedCount = data.index;
        setTotalExpected(data.total);
      });

      setStudents(newStudents);
      setProgress(Math.round((processedCount / totalExpected) * 100));

      if (processedCount >= totalExpected) {
        setIsComplete(true);
      }
    });

    return () => unsubscribe();
  }, [schoolId, sessionId, totalExpected]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">✨ Real-Time OCR Results</h3>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">
            {students.length} / {totalExpected} students
          </span>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Students List - Live Streaming */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {students.map((student, idx) => (
          <StudentRow
            key={idx}
            student={student}
            index={idx + 1}
            isNew={idx === students.length - 1}
          />
        ))}

        {/* Loading indicator while streaming */}
        {!isComplete && students.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <span className="text-sm text-blue-700 font-medium">
              🔄 Scanning more students...
            </span>
          </div>
        )}
      </div>

      {isComplete && students.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-800 font-semibold">✅ Scanning Complete!</p>
          <p className="text-sm text-green-700">{students.length} students captured</p>
        </div>
      )}
    </div>
  );
};

const StudentRow = ({ student, index, isNew }) => {
  const confidencePercent = Math.round(student.confidence * 100);
  const isHighConfidence = confidencePercent >= 85;
  const needsReview = student.requiresReview;

  return (
    <div
      className={`p-3 rounded-lg border-l-4 transition-all ${
        isNew ? 'animate-pulse' : ''
      } ${
        needsReview
          ? 'border-orange-400 bg-orange-50'
          : 'border-green-400 bg-green-50'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-semibold text-gray-800">
            {index}. {student.fullName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            💰 ₦{student.totalFee?.toLocaleString() || 'N/A'}
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="ml-4 text-right">
          <div className="w-20 h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isHighConfidence ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <p className="text-xs font-bold mt-1 text-gray-700">
            {confidencePercent}%
          </p>
        </div>
      </div>

      {/* Status Badge */}
      {needsReview && (
        <div className="mt-2 inline-block text-xs font-semibold px-2 py-1 bg-orange-200 text-orange-800 rounded">
          ⚠️ Tap to Review
        </div>
      )}
    </div>
  );
};

export default RealtimeOCRStream;