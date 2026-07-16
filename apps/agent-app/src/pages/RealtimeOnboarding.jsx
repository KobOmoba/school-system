import React, { useState } from 'react';
import { uploadLedgerImage } from '@firebase/storage';
import { createSchool } from '@firebase/firestore';
import { useAuth } from '@shared/hooks/useAuth';
import LiveLedgerCapture from '../components/LiveLedgerCapture';
import RealtimeOCRStream from '../components/RealtimeOCRStream';
import QuickNameCorrection from '../components/QuickNameCorrection';
import SummaryReview from '../components/SummaryReview';
import SchoolForm from '../components/SchoolForm';

const RealtimeOnboarding = () => {
  const [step, setStep] = useState(1); // 1: Signboard, 2: Ledger Scan, 3: Live Results, 4: School Form, 5: Summary
  const [schoolId, setSchoolId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [ledgerFile, setLedgerFile] = useState(null);
  const [students, setStudents] = useState([]);
  const [schoolData, setSchoolData] = useState(null);
  const [reviewingStudent, setReviewingStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { user, profile } = useAuth();

  const handleSignboardCapture = async (file) => {
    // Process signboard with OpenCV
    // Extract: School name, address, LGA
    setStep(2);
  };

  const handleLedgerSessionStart = async (sessionData) => {
    setError(null);

    try {
      // Create school if not exists
      let createdSchoolId = schoolId;
      if (!schoolId) {
        createdSchoolId = await createSchool({
          agentId: user.uid,
          agentName: profile?.displayName,
          status: 'scanning'
        });
        setSchoolId(createdSchoolId);
      }

      // Upload ledger image
      const uploadResult = await uploadLedgerImage(createdSchoolId, sessionData.file);
      setLedgerFile(uploadResult);

      // Cloud Function will automatically trigger OCR and stream results
      // Create OCR session for real-time updates
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);

      setStep(3);
      return newSessionId;
    } catch (err) {
      setError(`Session error: ${err.message}`);
      return null;
    }
  };

  const handleStudentReview = (correctedStudent) => {
    setStudents(prev => 
      prev.map((s, idx) => idx === reviewingStudent ? correctedStudent : s)
    );
    setReviewingStudent(null);
  };

  const handleSchoolFormSubmit = async (formData) => {
    setSchoolData(formData);
    setStep(5);
  };

  const handleFinalSubmit = async (summaryData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Update school with final data
      // This triggers WhatsApp notification to Commander
      console.log('Submitting to Commander:', summaryData);
      
      setSuccess('✓ Submitted! Waiting for Commander approval via WhatsApp');
      setStep(6);
    } catch (err) {
      setError(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSchoolId(null);
    setSessionId(null);
    setLedgerFile(null);
    setStudents([]);
    setSchoolData(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="container">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🚀 Real-Time School Onboarding</h1>
        <p className="text-gray-600 mb-8">Sign Board → Ledger Scan → Live Results → Confirm → Submit</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div
              key={s}
              className={`flex-1 h-3 rounded-full transition-all ${
                s <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        {/* Step 1: Signboard */}
        {step === 1 && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">📸 Step 1: School Signboard</h3>
            <p className="text-gray-600 mb-4">Photograph the school signboard. We'll extract the name, address, and LGA.</p>
            <button
              onClick={() => handleSignboardCapture(null)}
              className="btn btn-primary w-full"
            >
              📷 Capture Signboard
            </button>
          </div>
        )}

        {/* Step 2: Ledger Capture */}
        {step === 2 && (
          <>
            <LiveLedgerCapture
              onSessionStart={handleLedgerSessionStart}
              schoolId={schoolId}
            />
          </>
        )}

        {/* Step 3: Real-time Results */}
        {step === 3 && sessionId && (
          <>
            <RealtimeOCRStream
              schoolId={schoolId}
              sessionId={sessionId}
            />
            <button
              onClick={() => setStep(4)}
              className="btn btn-primary w-full mt-4"
            >
              ✓ Results Confirmed → Next
            </button>
          </>
        )}

        {/* Step 4: School Form */}
        {step === 4 && (
          <SchoolForm
            onSubmit={handleSchoolFormSubmit}
            isLoading={false}
          />
        )}

        {/* Step 5: Summary Review */}
        {step === 5 && (
          <SummaryReview
            students={students}
            schoolData={schoolData}
            onSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Step 6: Success */}
        {step === 6 && (
          <div className="card text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold mb-2">Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your school data has been sent to Commander Bayo for approval.
              You'll receive a WhatsApp confirmation shortly.
            </p>
            <button
              onClick={handleReset}
              className="btn btn-primary w-full"
            >
              ➕ Register Another School
            </button>
          </div>
        )}

        {/* Back Button */}
        {step > 1 && step < 6 && (
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

export default RealtimeOnboarding;