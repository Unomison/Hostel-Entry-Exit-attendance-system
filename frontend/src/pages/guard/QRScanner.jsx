import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isStartedRef = useRef(false); // ✅ FIX: track real scanner state

  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState('');
  const [cameraPermission, setCameraPermission] = useState('pending');

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('qr-reader');

    return () => {
      // ✅ SAFE CLEANUP (no crash)
      if (scannerRef.current && isStartedRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      isProcessingRef.current = false;

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 5, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;

          // ✅ SAFE STOP
          try {
            if (isStartedRef.current) {
              await scannerRef.current.stop();
              isStartedRef.current = false;
              setIsStarted(false);
            }
          } catch (e) {}

          onScanSuccess(decodedText);
        },
        () => {}
      );

      setIsStarted(true);
      isStartedRef.current = true; // ✅ IMPORTANT
      setCameraPermission('granted');
    } catch (err) {
      if (err.toString().includes('Permission')) {
        setCameraPermission('denied');
        setError('Camera permission denied. Please allow camera access.');
      } else {
        setError('Failed to start camera: ' + err.toString());
      }
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && isStartedRef.current) {
        await scannerRef.current.stop();
        isStartedRef.current = false; // ✅ IMPORTANT
        setIsStarted(false);
      }
    } catch (err) {}
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        id="qr-reader"
        className="w-full max-w-sm rounded-xl overflow-hidden border-2 border-slate-600"
        style={{ minHeight: isStarted ? 'auto' : '0px' }}
      />

      {cameraPermission === 'denied' && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm text-center w-full">
          <p className="font-semibold">📷 Camera Access Denied</p>
          <p className="mt-1">Allow camera in browser settings then refresh</p>
        </div>
      )}

      {error && cameraPermission !== 'denied' && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 text-red-300 text-sm text-center w-full">
          {error}
        </div>
      )}

      {!isStarted ? (
        <button
          onClick={startScanner}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
        >
          📷 Start Scanner
        </button>
      ) : (
        <div className="w-full space-y-3">
          <div className="bg-green-900/30 border border-green-700 rounded-xl p-3 text-green-300 text-sm text-center">
            🟢 Scanner active — point at student's QR code
          </div>
          <button
            onClick={stopScanner}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-colors"
          >
            ⏹ Stop Scanner
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;