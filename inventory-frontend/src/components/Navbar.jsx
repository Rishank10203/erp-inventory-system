const Navbar = ({ setSidebarOpen }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-30 lg:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-700 p-2 -ml-2 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-medium text-gray-500 uppercase tracking-widest">Smart Invoice ERP</h1>
          <p className="text-xl font-bold text-gray-900 leading-tight">Operational Dashboard</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <button className="text-gray-400 hover:text-gray-700 transition-colors relative p-2 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;