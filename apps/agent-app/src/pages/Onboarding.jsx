import React, { useState } from 'react';
import { useAuth } from '@shared/hooks/useAuth';
import { createSchool } from '@firebase/firestore';
import { uploadLedgerImage } from '@firebase/storage';
import CameraCapture from '../components/CameraCapture';
import LedgerScanner from '../components/LedgerScanner';
import SchoolForm from '../components/SchoolForm';

const Onboarding = () => {
  const [step, setStep] = useState(1); // 1: Camera, 2: OCR, 3: Form, 4: Review
  const [imageFile, setImageFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user, profile } = useAuth();

  const handleImageCapture = (file) => {
    setImageFile(file);
    setStep(2);
  };

  const handleOCRComplete = (ocrResult) => {
    setOcrData(ocrResult);
    setStep(3);
  };

  const handleSchoolFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create school record
      const schoolId = await createSchool({
        ...formData,
        agentId: user.uid,
        agentName: profile?.displayName,
        ledgerData: ocrData.parsedData,
        status: 'pending'
      });

      // Upload ledger image to Firebase
      const uploadResult = await uploadLedgerImage(schoolId, imageFile);

      setSchoolData({
        ...formData,
        schoolId,
        uploadResult
      });

      setSuccess('✓ School onboarding submitted successfully!');
      setStep(4);
    } catch (err) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setImageFile(null);
    setOcrData(null);
    setSchoolData(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🏫 School Onboarding</h1>
        <p className="text-gray-600 mb-8">Steps: Camera → OCR → Form → Review</p>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <CameraCapture
            onCapture={handleImageCapture}
            disabled={false}
          />
        )}

        {step === 2 && imageFile && (
          <LedgerScanner
            imageFile={imageFile}
            onOCRComplete={handleOCRComplete}
            onSkip={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <SchoolForm
            onSubmit={handleSchoolFormSubmit}
            isLoading={isSubmitting}
          />
        )}

        {step === 4 && schoolData && (
          <div className="card">
            <div className="alert alert-success mb-4">{success}</div>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">✓ Submission Complete</h3>
              <p className="text-sm text-gray-600">School: {schoolData.name}</p>
              <p className="text-sm text-gray-600">ID: {schoolData.schoolId}</p>
              <p className="text-sm text-gray-600">Status: Pending Review</p>
            </div>
            <button
              onClick={handleReset}
              className="btn btn-primary w-full"
            >
              + Register Another School
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-error mt-4">{error}</div>
        )}

        {/* Navigation */}
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className="btn btn-secondary w-full mt-4"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;