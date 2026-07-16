import React from 'react';
import { useRef, useState, useEffect } from 'react';

const CameraCapture = ({ onCapture, disabled = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
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
        video: { facingMode: 'environment' },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    canvasRef.current.toBlob((blob) => {
      const file = new File([blob], `ledger-${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">📷 Capture Ledger</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="mb-4">
        {isCameraActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg border-2 border-gray-300 mb-4"
              style={{ maxHeight: '400px', objectFit: 'cover' }}
            />
            <div className="flex gap-2">
              <button
                onClick={capturePhoto}
                className="btn btn-primary flex-1"
              >
                📸 Capture Photo
              </button>
              <button
                onClick={stopCamera}
                className="btn btn-secondary flex-1"
              >
                ✕ Cancel
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={startCamera}
            disabled={disabled}
            className="btn btn-primary w-full"
          >
            🎥 Start Camera
          </button>
        )}
      </div>

      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="hidden"
      />
    </div>
  );
};

export default CameraCapture;