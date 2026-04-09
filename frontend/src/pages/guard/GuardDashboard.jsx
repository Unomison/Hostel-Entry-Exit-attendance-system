import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import Navbar from '../../components/shared/Navbar';
import QRScanner from './QRScanner';
import ScanResult from './ScanResult';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// Live countdown timer component
const CooldownTimer = ({ seconds, onComplete }) => {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [seconds]);

  const percentage = (remaining / seconds) * 100;

  return (
    <div className="bg-slate-700 rounded-xl p-4 text-center space-y-3">
      <p className="text-slate-300 text-sm font-medium">
        ⏳ Student cooldown active
      </p>
      <div className="text-4xl font-bold text-yellow-400 tabular-nums">
        {remaining}s
      </div>
      <div className="w-full bg-slate-600 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-yellow-400 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-slate-400 text-xs">
        Student can be scanned again after this timer
      </p>
    </div>
  );
};

const GuardDashboard = () => {
  const [screen, setScreen] = useState('scanner');
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const handleScanSuccess = async (decodedText) => {
    if (processing) return;
    setProcessing(true);

    try {
      const response = await api.post('/scan/process', {
        qrPayload: decodedText,
      });

      setScanResult(response.data);
      setScanError('');
      setCooldownSeconds(0);
      setScreen('result');
      setScanCount(prev => prev + 1);

    } catch (error) {
      const errData = error.response?.data;
      const errorType = errData?.errorType || 'UNKNOWN';
      const message = errData?.message || 'Scan failed. Please try again.';

      setScanError(message);
      setCooldownSeconds(0);

      if (errorType === 'COOLDOWN_ACTIVE' && errData?.cooldownSeconds) {
        setCooldownSeconds(errData.cooldownSeconds);
      }

      setScreen('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    const action = scanResult?.action;
    toast.success(action === 'OUT' ? '🔴 Student marked OUT' : '🟢 Student marked IN');
    setScreen('scanner');
    setScanResult(null);
    setScanError('');
    setCooldownSeconds(0);
  };

  const handleScanAgain = () => {
    setScreen('scanner');
    setScanResult(null);
    setScanError('');
    setCooldownSeconds(0);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar title="Guard Scanner" />

      <div className="max-w-md mx-auto p-4 mt-4 space-y-4">

        {/* Session Stats */}
        <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex justify-between items-center">
          <span className="text-slate-400 text-sm">Scans this session</span>
          <span className="text-white font-bold text-lg">{scanCount}</span>
        </div>

        {/* Scanner Screen */}
        {screen === 'scanner' && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <h2 className="text-white font-semibold text-center mb-4">
              📷 Scan Student QR Code
            </h2>
            {processing ? (
              <div className="flex flex-col items-center py-8">
                <div className="w-10 h-10 border-4 border-slate-600 border-t-green-500 rounded-full animate-spin mb-3"></div>
                <p className="text-slate-400 text-sm">Processing scan...</p>
              </div>
            ) : (
              <QRScanner
                onScanSuccess={handleScanSuccess}
                onScanError={(err) => console.error(err)}
              />
            )}
          </div>
        )}

        {/* Result Screen */}
        {screen === 'result' && scanResult && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
            <ScanResult
              result={scanResult}
              onConfirm={handleConfirm}
              onScanAgain={handleScanAgain}
            />
          </div>
        )}

        {/* Error Screen */}
        {screen === 'error' && (
          <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-3">❌</div>
              <h3 className="text-white font-semibold text-lg">Scan Failed</h3>
              <p className="text-red-300 text-sm mt-2">{scanError}</p>
            </div>

            {cooldownSeconds > 0 && (
              <CooldownTimer
                seconds={cooldownSeconds}
                onComplete={() => setCooldownSeconds(0)}
              />
            )}
<div className="grid grid-cols-2 gap-3">
  {/* Scan Next — always available so guard can scan other students */}
  <button
    onClick={handleScanAgain}
    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
  >
    📷 Scan Next
  </button>

  {/* Retry same student — only available after cooldown */}
  <button
    onClick={handleScanAgain}
    disabled={cooldownSeconds > 0}
    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
  >
    {cooldownSeconds > 0 ? `⏳ ${cooldownSeconds}s` : '🔄 Retry'}
  </button>
</div>
          </div>
        )}

        {/* Outside List Link */}
        <Link
          to="/guard/outside-list"
          className="flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-4 text-white transition-colors"
        >
          <div>
            <span className="font-medium">📋 Students Currently Outside</span>
            <p className="text-slate-400 text-xs mt-0.5">View who is outside the hostel</p>
          </div>
          <span className="text-slate-400 text-xl">→</span>
        </Link>

      </div>
    </div>
  );
};

export default GuardDashboard;