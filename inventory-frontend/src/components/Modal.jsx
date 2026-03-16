const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
        <button
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all z-20 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={onClose}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;