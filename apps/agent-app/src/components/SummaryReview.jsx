import React, { useState } from 'react';

const SummaryReview = ({ students, schoolData, onSubmit, isSubmitting }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editName, setEditName] = useState('');

  const handleEditName = (index, newName) => {
    students[index].fullName = newName.toUpperCase();
    setEditingIndex(null);
  };

  const handleSubmit = async () => {
    await onSubmit({
      students,
      schoolData
    });
  };

  const highConfidenceCount = students.filter(s => s.confidence >= 0.85).length;
  const needsReviewCount = students.filter(s => s.confidence < 0.85).length;
  const totalFees = students.reduce((sum, s) => sum + (s.totalFee || 0), 0);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">📋 Summary Review</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-blue-50 p-3 rounded text-center">
          <p className="text-2xl font-bold text-blue-600">{students.length}</p>
          <p className="text-xs text-gray-600">Students</p>
        </div>
        <div className="bg-green-50 p-3 rounded text-center">
          <p className="text-2xl font-bold text-green-600">✓ {highConfidenceCount}</p>
          <p className="text-xs text-gray-600">Confirmed</p>
        </div>
        <div className="bg-orange-50 p-3 rounded text-center">
          <p className="text-2xl font-bold text-orange-600">⚠ {needsReviewCount}</p>
          <p className="text-xs text-gray-600">Review</p>
        </div>
      </div>

      {/* Total Fees */}
      <div className="bg-purple-50 p-4 rounded-lg mb-6 border-l-4 border-purple-500">
        <p className="text-sm text-gray-600">Total Fees Collected</p>
        <p className="text-2xl font-bold text-purple-700">₦{totalFees.toLocaleString()}</p>
      </div>

      {/* Students Table */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Student Details</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Fee</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-gray-50"
                  onDoubleClick={() => {
                    setEditingIndex(idx);
                    setEditName(student.fullName);
                  }}
                >
                  <td className="p-2 font-medium">{idx + 1}</td>
                  <td className="p-2">
                    {editingIndex === idx ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="form-input text-sm flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            handleEditName(idx, editName);
                          }}
                          className="btn btn-primary text-xs px-2"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      student.fullName
                    )}
                  </td>
                  <td className="p-2">₦{(student.totalFee || 0).toLocaleString()}</td>
                  <td className="p-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        student.confidence >= 0.85
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {Math.round(student.confidence * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* School Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
        <h4 className="font-semibold mb-2">School Information</h4>
        <p className="text-sm"><span className="font-medium">Name:</span> {schoolData.name}</p>
        <p className="text-sm"><span className="font-medium">Principal:</span> {schoolData.principalName}</p>
        <p className="text-sm"><span className="font-medium">Email:</span> {schoolData.email}</p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="btn btn-success w-full text-lg py-3 font-semibold"
      >
        {isSubmitting ? '⏳ Submitting...' : '✓ Submit to Commander'}
      </button>

      <p className="text-xs text-gray-600 text-center mt-3">
        Once submitted, Commander (Bayo) will review via WhatsApp
      </p>
    </div>
  );
};

export default SummaryReview;