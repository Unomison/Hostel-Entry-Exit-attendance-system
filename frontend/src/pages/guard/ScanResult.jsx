const ScanResult = ({ result, onConfirm, onScanAgain }) => {
  if (!result) return null;

  const { student, action, isFlagged, flagReason } = result;

  return (
    <div className="space-y-4">

      {/* Flag Warning */}
      {isFlagged && (
        <div className="bg-yellow-900/40 border border-yellow-600 rounded-xl p-3 text-yellow-300 text-sm">
          ⚠️ <strong>Flagged:</strong> {flagReason}
        </div>
      )}

      {/* Action Banner */}
      <div className={`rounded-xl p-4 text-center font-bold text-lg ${
        action === 'OUT'
          ? 'bg-red-900/50 border border-red-600 text-red-300'
          : 'bg-green-900/50 border border-green-600 text-green-300'
      }`}>
        {action === 'OUT' ? '🔴 MARKING AS OUT (Exiting)' : '🟢 MARKING AS IN (Entering)'}
      </div>

      {/* Student Photo — LARGE for visual verification */}
      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <div className="flex flex-col items-center mb-4">
          {student.photoUrl ? (
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-500 shadow-lg"
            />
          ) : (
            <div className="w-36 h-36 rounded-full bg-slate-700 flex items-center justify-center text-5xl border-4 border-slate-500">
              👤
            </div>
          )}
          <p className="text-slate-400 text-xs mt-2 text-center">
            ↑ Verify this photo matches the person in front of you
          </p>
        </div>

        {/* Student Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400 text-sm">Name</span>
            <span className="text-white font-semibold">{student.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400 text-sm">Roll No</span>
            <span className="text-white font-mono">{student.rollNo}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400 text-sm">Phone</span>
            <span className="text-white">{student.phone}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-700">
            <span className="text-slate-400 text-sm">Hostel Block</span>
            <span className="text-white">Block {student.hostelBlock}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 text-sm">Room</span>
            <span className="text-white">{student.roomNo}</span>
          </div>
        </div>
      </div>

      {/* Status Change */}
      <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 text-center">
        <p className="text-slate-400 text-sm">
          Status: <span className="text-white font-semibold">{student.previousStatus}</span>
          {' → '}
          <span className={`font-bold ${action === 'OUT' ? 'text-red-400' : 'text-green-400'}`}>
            {student.newStatus}
          </span>
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onScanAgain}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          🔄 Scan Next
        </button>
        <button
          onClick={onConfirm}
          className={`font-semibold py-3 rounded-xl transition-colors text-white ${
            action === 'OUT'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          ✅ Confirm
        </button>
      </div>

      <p className="text-slate-500 text-xs text-center">
        Tap Confirm only after visually verifying the photo matches
      </p>
    </div>
  );
};

export default ScanResult;