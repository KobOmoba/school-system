import React from 'react';

const DataComparison = ({ ledgerData, formData }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">📊 Data Comparison</h3>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Form Submission</th>
              <th>Ledger OCR</th>
              <th>Match</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-medium">Students Count</td>
              <td>{formData?.numberofStudents || 'N/A'}</td>
              <td>{ledgerData?.students?.length || 0}</td>
              <td>
                {Math.abs((formData?.numberofStudents || 0) - (ledgerData?.students?.length || 0)) <= 5
                  ? '✓ Close'
                  : '⚠ Mismatch'}
              </td>
            </tr>
            <tr>
              <td className="font-medium">Class</td>
              <td>{formData?.class || 'N/A'}</td>
              <td>{ledgerData?.class || 'Not detected'}</td>
              <td>
                {formData?.class === ledgerData?.class ? '✓ Match' : '⚠ Different'}
              </td>
            </tr>
            <tr>
              <td className="font-medium">Year</td>
              <td>{formData?.year || 'N/A'}</td>
              <td>{ledgerData?.year || 'Not detected'}</td>
              <td>
                {formData?.year === ledgerData?.year ? '✓ Match' : '⚠ Different'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {ledgerData?.students && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3">👥 Student List from Ledger</h4>
          <div className="max-h-64 overflow-y-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {ledgerData.students.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.serialNo}</td>
                    <td className="font-medium">{student.fullName}</td>
                    <td>{student.firstName}</td>
                    <td>{student.lastName}</td>
                    <td>
                      {student.requiresReview ? (
                        <span className="badge badge-pending">Review</span>
                      ) : (
                        <span className="badge badge-approved">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataComparison;