import { useState, useContext } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let tempErrors = {};
    if (!form.username) tempErrors.username = "Username is required";
    if (!form.password) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const res = await API.post("token/", form);
      login(res.data.user || { username: form.username }, res.data.access, res.data.refresh);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: "Incorrect username or password combination." });
      } else if (err.response?.data?.detail) {
        setErrors({ general: err.response.data.detail });
      } else {
        setErrors({ general: "Authentication system unreachable. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-5xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Login Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-800 tracking-tighter mb-2 italic">Welcome Back</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Secure Admin Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-bold text-center">
                {errors.general}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                className={`w-full border-2 ${errors.username ? 'border-red-500' : 'border-gray-100'} p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              {errors.username && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.username}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full border-2 ${errors.password ? 'border-red-500' : 'border-gray-100'} p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold text-gray-700 bg-gray-50/50`}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-blue-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="text-xl">🚀</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-gray-500 font-bold text-sm">
            Need an account?
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 cursor-pointer ml-1 hover:underline decoration-2 underline-offset-4"
            >
              Get Started
            </span>
          </p>
        </div>

        {/* Visual Icons Section */}
        <div className="hidden md:flex w-1/2 bg-blue-600 p-12 relative flex-col justify-center items-center overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-full h-full">
            <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-[100px] opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500 rounded-full blur-[100px] opacity-50"></div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8">
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300">
              <span className="text-6xl mb-4 drop-shadow-lg">📈</span>
              <span className="text-[12px] font-black text-white uppercase tracking-widest text-center">Revenue Control</span>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300 delay-75">
              <span className="text-6xl mb-4 drop-shadow-lg">📦</span>
              <span className="text-[12px] font-black text-white uppercase tracking-widest text-center">Inventory Hub</span>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300 delay-150">
              <span className="text-6xl mb-4 drop-shadow-lg">🧾</span>
              <span className="text-[12px] font-black text-white uppercase tracking-widest text-center">Instant Billing</span>
            </div>
            <div className="p-8 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg flex flex-col items-center group hover:-translate-y-2 transition-transform duration-300 delay-225">
              <span className="text-6xl mb-4 drop-shadow-lg">💼</span>
              <span className="text-[12px] font-black text-white uppercase tracking-widest text-center">Admin Suite</span>
            </div>
          </div>

          <div className="relative z-10 mt-12 text-center text-white px-8">
            <h3 className="text-3xl font-black mb-4 italic">Next-Gen ERP Experience.</h3>
            <p className="text-blue-100 font-bold opacity-80 text-sm max-w-xs mx-auto">
              Access your powerful administrative workspace and manage your business operations with zero friction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;