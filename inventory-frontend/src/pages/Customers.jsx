import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import API from "../api/axios";
import { debounce } from "lodash";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchCustomers = async (currentSearch) => {
    setLoading(true);
    try {
      const res = await API.get(`customers/?search=${currentSearch}`);
      setCustomers(res.data.results || res.data || []);
    } catch (error) {
      console.error("Fetch customers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((s) => fetchCustomers(s), 500),
    []
  );

  useEffect(() => {
    debouncedFetch(search);
  }, [search, debouncedFetch]);

  const validateGST = (gst) => {
    if (!gst) return true; // Optional in form, but validated if present
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let clientErrors = {};
    if (form.gst_number && !validateGST(form.gst_number)) {
      clientErrors.gst_number = ["Invalid 15-digit GSTIN format"];
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      const payload = {
        name: form.name?.trim(),
        email: form.email?.trim(),
        phone: form.phone?.trim(),
        address: (form.address || "").trim(),
        gst_number: form.gst_number?.toUpperCase().trim() || null
      };

      if (form.id) {
        await API.put(`customers/${form.id}/`, payload);
      } else {
        await API.post("customers/", payload);
      }
      setModal(false);
      fetchCustomers(search);
      setForm({});
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete customer ${item.name}? All linked invoices will be removed.`)) {
      await API.delete(`customers/${item.id}/`);
      fetchCustomers(search);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic text-linear-to-r from-slate-900 to-slate-500 bg-clip-text">Client Network</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Relationship & GST Management</p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
            <input
              type="text"
              placeholder="Filter clients..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setForm({}); setErrors({}); setModal(true); }}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            + New Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Table
          columns={["name", "email", "phone", "gst_number"]}
          data={customers}
          onEdit={(item) => { setForm(item); setErrors({}); setModal(true); }}
          onDelete={handleDelete}
          onView={(item) => { setSelectedCustomer(item); setViewModal(true); }}
        />
      </div>

      {/* Entry Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">
              {form.id ? "Update Profile" : "Onboard Client"}
            </h2>
            <button onClick={() => setModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 text-xl font-bold transition-all">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Identity</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-semibold"
                placeholder="Client Name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.name[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GST Identification Number</label>
              <input
                type="text"
                className={`w-full bg-slate-50 border-2 ${errors.gst_number ? 'border-red-100' : 'border-slate-50'} p-4 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-semibold uppercase`}
                placeholder="27AAAAA0000A1Z5"
                value={form.gst_number || ""}
                onChange={(e) => setForm({ ...form, gst_number: e.target.value })}
              />
              {errors.gst_number && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.gst_number[0]}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
              <input
                type="email"
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-semibold"
                placeholder="client@mail.com"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.email[0]}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone</label>
              <input
                type="text"
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-semibold"
                placeholder="+91..."
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.phone[0]}</p>}
            </div>
          </div>

          <div className="space-y-1.5 mb-8">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Address</label>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500/50 outline-none transition-all font-semibold h-24 resize-none"
              placeholder="Full mailing address..."
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-95 uppercase tracking-widest"
          >
            Synchronize Data
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      {viewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative border border-white/20">
            <div className="h-40 bg-linear-to-br from-indigo-600 to-purple-700 p-8 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl text-white">👤</div>
                <div>
                  <h2 className="text-white text-3xl font-black italic">{selectedCustomer.name}</h2>
                  <p className="text-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Verified Client Account</p>
                </div>
              </div>
              <button onClick={() => setViewModal(false)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center font-bold backdrop-blur-md transition-all">✕</button>
            </div>

            <div className="p-10 -mt-10 bg-white rounded-t-[3rem] relative z-10 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100 hover:ring-1 hover:ring-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">GSTIN</p>
                  <p className="text-xl font-black text-indigo-600 tracking-tighter">{selectedCustomer.gst_number || 'UNREGISTERED'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-700 break-all">{selectedCustomer.email}</p>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-700">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Billing Address</p>
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed">{selectedCustomer.address || 'No address provided'}</p>
                </div>
              </div>

              <button
                onClick={() => setViewModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close Identity Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;