import React, { useState, useEffect } from 'react';
import { getPendingSchools } from '@firebase/firestore';
import SchoolReviewCard from '../components/SchoolReviewCard';
import DataComparison from '../components/DataComparison';

const VerificationDashboard = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchSchools();
  }, [filter]);

  const fetchSchools = async () => {
    setLoading(true);
    setError(null);

    try {
      const pendingSchools = await getPendingSchools();
      setSchools(pendingSchools);
    } catch (err) {
      setError(`Failed to fetch schools: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (schoolId, newStatus) => {
    setSchools(schools.map(s => 
      s.id === schoolId ? { ...s, status: newStatus } : s
    ));
    setSelectedSchool(null);
  };

  const filterSchools = schools.filter(s => {
    if (filter === 'pending') return s.status === 'pending';
    if (filter === 'approved') return s.status === 'approved';
    if (filter === 'rejected') return s.status === 'rejected';
    return true;
  });

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">⚡ Command Center</h1>
        <p className="text-gray-600">School Verification & Approval</p>
      </div>

      {error && (
        <div className="card bg-red-50 border-l-4 border-red-400 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchSchools}
            className="btn btn-primary mt-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {f === 'all' ? '📋 All' : f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✓ Approved' : '✗ Rejected'}
            <span className="ml-2">({filterSchools.length})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      ) : filterSchools.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg">No schools to display</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schools List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="font-semibold mb-4">📍 Schools ({filterSchools.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filterSchools.map(school => (
                  <button
                    key={school.id}
                    onClick={() => setSelectedSchool(school)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedSchool?.id === school.id
                        ? 'bg-blue-100 border-l-4 border-blue-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-l-4 border-transparent'
                    }`}
                  >
                    <p className="font-medium text-sm">{school.name}</p>
                    <p className="text-xs text-gray-600">{school.email}</p>
                    <span className={`inline-block mt-2 badge ${
                      school.status === 'pending' ? 'badge-pending' :
                      school.status === 'approved' ? 'badge-approved' :
                      'badge-rejected'
                    }`}>
                      {school.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {selectedSchool ? (
              <>
                <SchoolReviewCard
                  school={selectedSchool}
                  onStatusUpdate={handleStatusUpdate}
                />
                <div className="mt-4">
                  <DataComparison
                    ledgerData={selectedSchool.ledgerData}
                    formData={selectedSchool}
                  />
                </div>
              </>
            ) : (
              <div className="card text-center py-12">
                <p className="text-gray-600">👈 Select a school to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDashboard;