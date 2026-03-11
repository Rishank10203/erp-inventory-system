const Navbar = () => {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-medium text-gray-400">Smart Invoice ERP</h1>
        <p className="text-lg font-bold text-gray-800">Operational Dashboard</p>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>
      </div>
    </div>
  );
};

export default Navbar;