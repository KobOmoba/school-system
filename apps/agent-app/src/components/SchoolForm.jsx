import React, { useState } from 'react';
import { validateSchoolData } from '@shared/utils/validation';

const SchoolForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    principalName: '',
    principalPhone: '',
    numberofStudents: '',
    established: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validateSchoolData(formData);
    if (!validation.isValid) {
      setErrors({
        form: validation.errors.join(', ')
      });
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-6">🏫 School Information</h3>

      {errors.form && <div className="alert alert-error mb-4">{errors.form}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">School Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter school name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            placeholder="school@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="form-input"
            placeholder="+234 800 000 0000"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">School Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            placeholder="123 Main Street, Lagos"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Principal Name *</label>
          <input
            type="text"
            name="principalName"
            value={formData.principalName}
            onChange={handleChange}
            className="form-input"
            placeholder="Principal's full name"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Principal Phone</label>
          <input
            type="tel"
            name="principalPhone"
            value={formData.principalPhone}
            onChange={handleChange}
            className="form-input"
            placeholder="+234 800 000 0000"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Number of Students</label>
          <input
            type="number"
            name="numberofStudents"
            value={formData.numberofStudents}
            onChange={handleChange}
            className="form-input"
            placeholder="500"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Year Established</label>
          <input
            type="number"
            name="established"
            value={formData.established}
            onChange={handleChange}
            className="form-input"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary w-full mt-6"
      >
        {isLoading ? 'Submitting...' : '📤 Submit for Review'}
      </button>
    </form>
  );
};

export default SchoolForm;