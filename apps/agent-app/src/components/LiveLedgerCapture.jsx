import React, { useState, useEffect, useRef } from 'react';

const LiveLedgerCapture = ({ onSessionStart, schoolId }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      setError(`Camera error: ${err.message}`);
    }
  };

  const captureAndStream = async () => {
    if (!videoRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasRef.current.toBlob(async (blob) => {
        const file = new File([blob], `ledger-page-${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Start OCR session
        const newSessionId = await onSessionStart({
          schoolId,
          file,
          timestamp: new Date().toISOString()
        });

        setSessionId(newSessionId);
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setError(`Capture error: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">📸 Photograph Ledger Page</h3>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <div className="relative">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-2 border-blue-300 mb-4"
              style={{ maxHeight: '500px', objectFit: 'cover' }}
            />
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
              🔴 RECORDING
            </div>
          </>
        ) : (
          <div className="bg-gray-200 rounded-lg w-full h-96 flex items-center justify-center mb-4">
            <p className="text-gray-600">Camera will appear here</p>
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {!isCameraActive ? (
          <button
            onClick={startCamera}
            className="btn btn-primary w-full"
          >
            🎥 Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={captureAndStream}
              disabled={isProcessing}
              className="btn btn-success w-full"
            >
              {isProcessing ? '⏳ Processing...' : '📷 Capture Page'}
            </button>
            <button
              onClick={stopCamera}
              className="btn btn-secondary w-full"
            >
              ✕ Stop Camera
            </button>
          </>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width="1280"
        height="720"
        className="hidden"
      />
    </div>
  );
};

export default LiveLedgerCapture;