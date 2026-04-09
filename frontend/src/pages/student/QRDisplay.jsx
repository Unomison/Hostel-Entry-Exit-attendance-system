import { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const QRDisplay = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [qrPayload, setQrPayload] = useState(null);
  const [tokenId, setTokenId] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wasScanned, setWasScanned] = useState(false);

  // Generate a new QR token from backend
  const generateNewQR = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setWasScanned(false);

      const response = await api.post('/qr/generate');
      const { qrPayload, expiresAt, tokenId } = response.data;

      setQrPayload(qrPayload);
      setTokenId(tokenId);
      setExpiresAt(new Date(expiresAt));
      setSecondsLeft(30);
      setLoading(false);
    } catch (err) {
      setError('Failed to generate QR. Retrying...');
      setLoading(false);
      // Retry after 3 seconds on failure
      setTimeout(generateNewQR, 3000);
    }
  }, []);

  // Generate QR on first load
  useEffect(() => {
    generateNewQR();
  }, [generateNewQR]);

  // Countdown timer — refreshes QR every 30 seconds
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.ceil((expiresAt - now) / 1000);

      if (diff <= 0) {
        // Time's up — generate new QR
        clearInterval(interval);
        generateNewQR();
      } else {
        setSecondsLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, generateNewQR]);

  // Poll to detect if QR was scanned by guard
  // Checks every 3 seconds
  useEffect(() => {
    if (!tokenId || wasScanned) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/qr/status/${tokenId}`);
        if (response.data.isUsed) {
          setWasScanned(true);
          clearInterval(pollInterval);
          // Notify parent dashboard to refresh student status
          if (onStatusChange) onStatusChange();
          // Generate new QR after 2 seconds
          setTimeout(generateNewQR, 2000);
        }
      } catch (err) {
        // Silently ignore polling errors
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [tokenId, wasScanned, generateNewQR, onStatusChange]);

  // Color of countdown ring changes based on seconds left
  const getCountdownColor = () => {
    if (secondsLeft > 15) return '#22c55e'; // green
    if (secondsLeft > 8) return '#f59e0b';  // yellow
    return '#ef4444';                         // red
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 text-sm">Generating your QR code...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (wasScanned) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-3">
        <div className="text-5xl animate-bounce">✅</div>
        <p className="text-green-400 font-semibold text-lg">QR Scanned Successfully!</p>
        <p className="text-slate-400 text-sm">Generating new QR code...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">

      {/* QR Code */}
      <div className="bg-white p-4 rounded-2xl shadow-lg">
        {qrPayload && (
         <QRCodeSVG
  value={qrPayload}
  size={220}
  level="L"
  includeMargin={true}
/>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="flex flex-col items-center space-y-1">
        <div
          className="text-4xl font-bold tabular-nums"
          style={{ color: getCountdownColor() }}
        >
          {secondsLeft}s
        </div>
        <p className="text-slate-400 text-xs">seconds until refresh</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-700 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-1000"
          style={{
            width: `${(secondsLeft / 30) * 100}%`,
            backgroundColor: getCountdownColor(),
          }}
        />
      </div>

      <p className="text-slate-500 text-xs text-center">
        Show this QR to the security guard at the gate
      </p>
    </div>
  );
};

export default QRDisplay;