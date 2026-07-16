import React, { useState } from 'react';

const QuickNameCorrection = ({ student, onConfirm, onSkip }) => {
  const [editedName, setEditedName] = useState(student.fullName);
  const [isEditing, setIsEditing] = useState(false);

  const handleConfirm = () => {
    onConfirm({
      ...student,
      fullName: editedName.toUpperCase(),
      requiresReview: false
    });
  };

  return (
    <div className="card border-l-4 border-orange-400 bg-orange-50">
      <h4 className="font-semibold mb-3">⚠️ Review Student Name</h4>

      <div className="mb-4 p-3 bg-white rounded border-2 border-orange-200">
        <p className="text-sm text-gray-600">OCR detected:</p>
        <p className="text-lg font-bold text-orange-700">{student.fullName}</p>
        <p className="text-xs text-gray-500 mt-1">Confidence: {Math.round(student.confidence * 100)}%</p>
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            value={editedName}
            onChange={e => setEditedName(e.target.value)}
            className="form-input mb-3"
            placeholder="Enter correct name"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="btn btn-success flex-1"
            >
              ✓ Confirm
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditedName(student.fullName);
              }}
              className="btn btn-secondary flex-1"
            >
              ✕ Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-primary w-full mb-2"
          >
            ✏️ Edit Name
          </button>
          <button
            onClick={onSkip}
            className="btn bg-gray-400 text-white w-full"
          >
            ⏭️ Skip
          </button>
        </>
      )}
    </div>
  );
};

export default QuickNameCorrection;