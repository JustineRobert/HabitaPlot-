import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { initQRScanner, scanQRFromStream, parseListingQR, isHTTPSAvailable } from '../utils/qrCodeUtils';
import toast from 'react-hot-toast';

const QRScannerModal = ({ isOpen, onClose, onListingScanned }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && !isHTTPSAvailable()) {
      setError('Camera access requires HTTPS or localhost');
      return;
    }

    if (isOpen && scanning) {
      startScanning();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, scanning]);

  const startScanning = async () => {
    try {
      setError(null);
      const mediaStream = await initQRScanner();
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          // Start QR detection
          detectQRCode();
        };
      }
    } catch (error) {
      console.error('Scanner error:', error);
      setError(error.message || 'Failed to start camera');
      setScanning(false);
    }
  };

  const detectQRCode = async () => {
    if (!videoRef.current || !scanning) return;

    try {
      // For MVP, simulate QR code detection
      // In production, integrate jsQR library
      // await scanQRFromStream(videoRef.current);

      // Placeholder: Check for simulated QR data
      setTimeout(() => {
        detectQRCode();
      }, 500);
    } catch (error) {
      console.error('QR code detection error:', error);
      if (scanning) {
        detectQRCode();
      }
    }
  };

  const handleManualInput = async () => {
    const qrData = prompt('Enter QR code or listing ID:');
    if (qrData) {
      const listingInfo = parseListingQR(qrData);
      if (listingInfo) {
        handleListingScanned(listingInfo.listingId);
      } else {
        setError('Invalid QR code or listing ID format');
      }
    }
  };

  const handleListingScanned = (listingId) => {
    toast.success('Listing found!');
    if (onListingScanned) {
      onListingScanned(listingId);
    } else {
      navigate(`/listing/${listingId}`);
    }
    handleClose();
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setScanning(false);
    setError(null);
    setStream(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-screen overflow-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 bg-white border-b">
          <h2 className="text-2xl font-bold">Scan QR Code</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <FiAlertCircle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : scanning ? (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-lg overflow-hidden aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
              </div>
              <p className="text-center text-sm text-gray-600">
                Point camera at QR code or listing barcode
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FiCamera className="text-3xl text-blue-600" />
              </div>
              <p className="text-center text-gray-600">Ready to scan QR codes and barcodes</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {!scanning && !error && (
              <button
                onClick={() => setScanning(true)}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Start Camera
              </button>
            )}

            <button
              onClick={handleManualInput}
              className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200"
            >
              Enter Manually
            </button>

            {error && (
              <button
                onClick={() => {
                  setError(null);
                  setScanning(true);
                }}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-600">
          <p>💡 QR scanning works best in good lighting</p>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
