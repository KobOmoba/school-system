import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { normalizeNigerianName, parseLedgerText } from '@shared/utils/ocrParser';

const LedgerScanner = ({ imageFile, onOCRComplete, onSkip }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const processImage = async () => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: m => {
          setProgress(Math.round(m.progress * 100));
        }
      });

      const rawText = result.data.text;
      const confidence = result.data.confidence / 100;

      // Parse the ledger data
      const parsedData = parseLedgerText(rawText);

      // Normalize Nigerian names
      const normalizedStudents = parsedData.students.map(student => ({
        ...student,
        fullName: normalizeNigerianName(student.fullName),
        firstName: normalizeNigerianName(student.firstName),
        lastName: normalizeNigerianName(student.lastName),
        requiresReview: confidence < 0.85,
        confidence
      }));

      const ocrData = {
        rawText,
        confidence,
        parsedData: {
          ...parsedData,
          students: normalizedStudents
        },
        timestamp: new Date().toISOString()
      };

      setOcrResult(ocrData);
    } catch (err) {
      setError(`OCR Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">🔍 OCR Processing</h3>

      {error && <div className="alert alert-error">{error}</div>}

      {!ocrResult ? (
        <>
          <div className="mb-4">
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Ledger preview"
              className="w-full rounded-lg border-2 border-gray-300"
              style={{ maxHeight: '300px', objectFit: 'contain' }}
            />
          </div>

          <button
            onClick={processImage}
            disabled={isProcessing}
            className="btn btn-primary w-full mb-2"
          >
            {isProcessing ? `Processing... ${progress}%` : '🚀 Start OCR'}
          </button>

          {isProcessing && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </>
      ) : (
        <OCRReview ocrResult={ocrResult} onConfirm={() => onOCRComplete(ocrResult)} />
      )}

      <button
        onClick={onSkip}
        className="btn btn-secondary w-full mt-4"
      >
        Skip
      </button>
    </div>
  );
};

const OCRReview = ({ ocrResult, onConfirm }) => {
  const [students, setStudents] = useState(ocrResult.parsedData.students);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEditName = (index, newName) => {
    const updated = [...students];
    updated[index].fullName = newName.toUpperCase();
    updated[index].requiresReview = false;
    setStudents(updated);
    setEditingIndex(null);
  };

  return (
    <div>
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm font-medium">📊 Ledger Info</p>
        <p className="text-xs text-gray-600">Class: {ocrResult.parsedData.class} | Term: {ocrResult.parsedData.term} | Year: {ocrResult.parsedData.year}</p>
        <p className="text-xs text-gray-600">Confidence: {Math.round(ocrResult.confidence * 100)}%</p>
      </div>

      <div className="mb-4">
        <h4 className="font-semibold mb-2">Students ({students.length})</h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {students.map((student, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border-2 ${
                student.requiresReview
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-green-300 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium">{student.fullName}</p>
                  <p className="text-xs text-gray-600">#{student.serialNo}</p>
                </div>
                {student.requiresReview && (
                  <button
                    onClick={() => {
                      setEditingIndex(idx);
                      setEditName(student.fullName);
                    }}
                    className="text-orange-600 text-sm font-medium"
                  >
                    ✎ Edit
                  </button>
                )}
              </div>

              {editingIndex === idx && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="form-input flex-1 text-sm"
                    placeholder="Correct name"
                  />
                  <button
                    onClick={() => handleEditName(idx, editName)}
                    className="btn btn-primary text-sm"
                  >
                    ✓
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="btn btn-primary w-full"
      >
        ✓ Confirm & Continue
      </button>
    </div>
  );
};

export default LedgerScanner;