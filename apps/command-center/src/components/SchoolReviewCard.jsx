import React, { useState } from 'react';
import { updateSchoolStatus } from '@firebase/firestore';

const SchoolReviewCard = ({ school, onStatusUpdate }) => {
  const [isDeciding, setIsDeciding] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [error, setError] = useState(null);

  const handleApprove = async () => {
    setIsDeciding(true);
    setError(null);

    try {
      await updateSchoolStatus(school.id, 'approved', school.ledgerData);
      onStatusUpdate(school.id, 'approved');
    } catch (err) {
      setError(`Approval failed: ${err.message}`);
    } finally {
      setIsDeciding(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setIsDeciding(true);
    setError(null);

    try {
      await updateSchoolStatus(school.id, 'rejected', {
        rejectionReason,
        rejectedAt: new Date().toISOString()
      });
      onStatusUpdate(school.id, 'rejected');
    } catch (err) {
      setError(`Rejection failed: ${err.message}`);
    } finally {
      setIsDeciding(false);
      setShowRejectionForm(false);
    }
  };

  return (
    <div className="card mb-4 border-l-4 border-yellow-400">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{school.name}</h3>
          <p className="text-sm text-gray-600">📧 {school.email}</p>
          <p className="text-sm text-gray-600">📱 {school.phoneNumber}</p>
          <p className="text-sm text-gray-600">📍 {school.address}</p>
        </div>
        <span className="badge badge-pending">{school.status}</span>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h4 className="font-semibold mb-2">📋 Principal Info</h4>
        <p className="text-sm">Name: {school.principalName}</p>
        <p className="text-sm">Phone: {school.principalPhone}</p>
      </div>

      {school.ledgerData && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">📊 Ledger Data</h4>
          <p className="text-sm">Class: {school.ledgerData.class}</p>
          <p className="text-sm">Term: {school.ledgerData.term}</p>
          <p className="text-sm">Year: {school.ledgerData.year}</p>
          <p className="text-sm">Students: {school.ledgerData.students?.length || 0}</p>
        </div>
      )}

      {showRejectionForm ? (
        <div className="mb-4">
          <textarea
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full p-3 border border-gray-300 rounded-lg mb-2"
            rows="3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isDeciding}
              className="btn btn-danger flex-1"
            >
              {isDeciding ? '⏳ Rejecting...' : '✗ Confirm Rejection'}
            </button>
            <button
              onClick={() => {
                setShowRejectionForm(false);
                setRejectionReason('');
              }}
              className="btn bg-gray-400 text-white flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isDeciding}
            className="btn btn-success flex-1"
          >
            {isDeciding ? '⏳ Approving...' : '✓ Approve'}
          </button>
          <button
            onClick={() => setShowRejectionForm(true)}
            disabled={isDeciding}
            className="btn btn-danger flex-1"
          >
            ✗ Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default SchoolReviewCard;