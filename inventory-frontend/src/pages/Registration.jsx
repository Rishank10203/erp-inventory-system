import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!form.username) tempErrors.username = "Username is required";
    if (!form.email) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!form.password) {
      tempErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    if (!form.phone) {
      tempErrors.phone = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(form.phone)) {
      tempErrors.phone = "Phone must be 10-15 digits";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      await API.post("accounts/register/", form);
      alert("Registration Successful! You are now an Admin.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data) {
        // Flatten array errors if needed, but and pass to state
        setErrors(err.response.data);
      } else {
        setErrors({ general: "Network connection lost. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[600px]">

        {/* Registration Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-4xl font-black text-gray-800 tracking-tighter mb-2 italic">Get Started</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Create your Admin account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold text-center">
                {errors.general}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <input
                  type="text"
                  placeholder="admin_id"
                  className={`w-full border-2 ${errors.username ? 'border-red-500' : 'border-gray-100'} p-3.5 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
                {errors.username && (
                  <p className="text-red-500 text-[10px] font-bold ml-1">
                    {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                <input
                  type="text"
                  placeholder="9876543210"
                  className={`w-full border-2 ${errors.phone ? 'border-red-500' : 'border-gray-100'} p-3.5 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] font-bold ml-1">
                    {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <input
                type="email"
                placeholder="your@email.com"
                className={`w-full border-2 ${errors.email ? 'border-red-500' : 'border-gray-100'} p-3.5 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold ml-1">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full border-2 ${errors.password ? 'border-red-500' : 'border-gray-100'} p-3.5 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && (
                <p className="text-red-500 text-[10px] font-bold ml-1">
                  {Array.isArray(errors.password) ? errors.password[0] : errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Create Admin Account →"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-500 font-bold text-sm">
            Already registered?
            <span
              onClick={() => navigate("/login")}
              className="text-blue-600 cursor-pointer ml-1 hover:underline decoration-2 underline-offset-4"
            >
              Log In
            </span>
          </p>
        </div>

        {/* Branding Area */}
        <div className="hidden md:flex w-1/2 bg-slate-900 p-12 relative flex-col justify-center items-center text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-40">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-blue-600 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10 text-white space-y-12">
            <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto">
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">Reports</span>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛡️</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Security</span>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">⚡</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-purple-400">Velocity</span>
              </div>
              <div className="p-6 bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl flex flex-col items-center group hover:bg-white/10 transition-all">
                <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">🌍</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-teal-400">Global</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-4xl font-black leading-tight">Master Your Business.</h3>
              <p className="text-slate-400 font-bold leading-relaxed max-w-xs mx-auto text-sm">
                Unlock full control over your billing and inventory with our advanced Admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registration;