import React from 'react';

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Students', value: '245', icon: '👥', color: 'blue' },
    { label: 'Fees Paid', value: '₦2.4M', icon: '💰', color: 'green' },
    { label: 'Present Today', value: '98%', icon: '✓', color: 'purple' },
    { label: 'Pending Payments', value: '32', icon: '⏳', color: 'orange' },
  ];

  return (
    <div className="container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">📊 School Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Auto-populated from ledger scan</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className={`stat-card stat-card-${stat.color}`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-sm opacity-90">{stat.label}</p>
            <p className="text-2xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="dashboard-card mb-8">
        <h2 className="text-2xl font-bold mb-4">📚 Students</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Class</th>
                <th>Fees Owed</th>
                <th>Status</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td className="font-medium">OGUNDETI SALAM</td>
                <td>Basic 4</td>
                <td>₦0</td>
                <td><span className="badge badge-paid">Fully Paid</span></td>
                <td>Present</td>
              </tr>
              <tr>
                <td>2</td>
                <td className="font-medium">OYERINDE OYEDEPO</td>
                <td>Basic 4</td>
                <td>₦5,000</td>
                <td><span className="badge badge-partial">Partial</span></td>
                <td>Present</td>
              </tr>
              <tr>
                <td>3</td>
                <td className="font-medium">CECILIA</td>
                <td>Basic 3</td>
                <td>₦0</td>
                <td><span className="badge badge-paid">Fully Paid</span></td>
                <td>Absent</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Fees Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="dashboard-card">
          <h2 className="text-xl font-bold mb-4">💰 Fees Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Total Fees</span>
              <span className="font-bold">₦5.8M</span>
            </div>
            <div className="flex justify-between pb-3 border-b">
              <span className="text-gray-600">Collected</span>
              <span className="font-bold text-green-600">₦2.4M</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-bold">Outstanding</span>
              <span className="font-bold text-red-600">₦3.4M</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="text-xl font-bold mb-4">📈 Attendance</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Present</span>
              <span className="font-bold">240</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Absent</span>
              <span className="font-bold">5</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold">Attendance Rate</span>
              <span className="font-bold text-green-600">98%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;