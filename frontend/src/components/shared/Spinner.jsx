const Spinner = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
};

export default Spinner;