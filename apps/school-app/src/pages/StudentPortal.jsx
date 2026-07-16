import React, { useState } from 'react';

const StudentPortal = ({ studentId }) => {
  const [student] = useState({
    name: 'OGUNDETI SALAM',
    class: 'Basic 4',
    studentId: 'STU-2024-001',
    email: 'ogundeti@school.com',
    parentPhone: '+234 800 000 0000'
  });

  const fees = [
    { term: '1st Term', amount: 24000, paid: 24000, status: 'Fully Paid' },
    { term: '2nd Term', amount: 24000, paid: 20000, status: 'Partial' },
    { term: '3rd Term', amount: 24000, paid: 0, status: 'Unpaid' },
  ];

  const grades = [
    { subject: 'Mathematics', score: 78, grade: 'A', term: '1st' },
    { subject: 'English', score: 85, grade: 'A', term: '1st' },
    { subject: 'Science', score: 72, grade: 'B', term: '1st' },
  ];

  const attendance = [
    { date: '2024-07-15', status: 'Present' },
    { date: '2024-07-14', status: 'Present' },
    { date: '2024-07-13', status: 'Absent' },
  ];

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">👋 Student Portal</h1>
        <p className="text-gray-600 mt-2">View your fees, grades, and attendance</p>
      </div>

      {/* Student Info */}
      <div className="dashboard-card mb-8">
        <h2 className="text-2xl font-bold mb-4">📋 Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-bold">{student.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Class</p>
            <p className="text-lg font-bold">{student.class}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Student ID</p>
            <p className="text-lg font-bold">{student.studentId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Parent Phone</p>
            <p className="text-lg font-bold">{student.parentPhone}</p>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="dashboard-card mb-8">
        <h2 className="text-2xl font-bold mb-4">💰 Fees Status</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, idx) => (
                <tr key={idx}>
                  <td className="font-medium">{fee.term}</td>
                  <td>₦{fee.amount.toLocaleString()}</td>
                  <td>₦{fee.paid.toLocaleString()}</td>
                  <td>₦{(fee.amount - fee.paid).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${fee.status === 'Fully Paid' ? 'paid' : fee.status === 'Partial' ? 'partial' : 'unpaid'}`}>
                      {fee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grades & Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card">
          <h2 className="text-xl font-bold mb-4">📚 Recent Grades</h2>
          <div className="table-container">
            <table className="table text-sm">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade, idx) => (
                  <tr key={idx}>
                    <td>{grade.subject}</td>
                    <td className="font-bold">{grade.score}</td>
                    <td className="font-bold text-green-600">{grade.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="text-xl font-bold mb-4">📍 Attendance</h2>
          <div className="space-y-2">
            {attendance.map((att, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{att.date}</span>
                <span className={`badge badge-${att.status === 'Present' ? 'present' : 'absent'}`}>
                  {att.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;