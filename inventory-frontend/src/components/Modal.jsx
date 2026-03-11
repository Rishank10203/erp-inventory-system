const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative overflow-hidden animate-in zoom-in duration-300">
        <button
          className="absolute right-6 top-6 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold transition-all z-20 flex items-center justify-center"
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