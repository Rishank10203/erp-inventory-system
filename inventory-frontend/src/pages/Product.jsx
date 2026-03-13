import { useEffect, useState, useCallback } from "react";
import Table from "../components/Table";
import Modal from "../components/Modal";
import API from "../api/axios";
import { debounce } from "lodash";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});


  const fetchProducts = async (currentPage, currentSearch) => {
    setLoading(true);
    try {
      const res = await API.get(`products/?page=${currentPage}&search=${currentSearch}`);
      setProducts(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 10));
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(
    debounce((p, s) => fetchProducts(p, s), 500),
    []
  );

  useEffect(() => {
    debouncedFetch(page, search);
  }, [page, search, debouncedFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const payload = {
        name: form.name?.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        gst_percent: parseFloat(form.gst_percent || 0),
        low_stock_limit: parseInt(form.low_stock_limit || 5)
      };

      if (form.id) {
        await API.put(`products/${form.id}/`, payload);
      } else {
        await API.post("products/", payload);
      }

      setModal(false);
      fetchProducts(page, search);
      setForm({});
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      }
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      await API.delete(`products/${item.id}/`);
      fetchProducts(page, search);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic">Product Vault</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Inventory Management & Suppliers</p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-80">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-30">🔍</span>
            <input
              type="text"
              placeholder="Filter by name..."
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold shadow-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button
            onClick={() => { setForm({}); setErrors({}); setModal(true); }}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider"
          >
            + New Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Table
          columns={["name", "price", "stock", "gst_percent"]}
          data={products}
          onEdit={(item) => { setForm(item); setErrors({}); setModal(true); }}
          onDelete={handleDelete}
          onView={(item) => { setSelectedProduct(item); setViewModal(true); }}
        />
      </div>

      <div className="flex justify-between items-center py-4 px-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          Showing Page {page} <span className="mx-2 opacity-20">|</span> Total {totalPages || 1}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all font-bold"
          >
            ←
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="w-12 h-12 flex items-center justify-center rounded-2xl border-2 border-slate-100 disabled:opacity-30 hover:bg-slate-50 transition-all font-bold"
          >
            →
          </button>
        </div>
      </div>

      {/* Entry Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">
              {form.id ? "Edit SKU" : "Register SKU"}
            </h2>
            <button onClick={() => setModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 text-xl font-bold transition-all">✕</button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Designation</label>
                <input
                  type="text"
                  placeholder="Official Name"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 px-1">{errors.name[0]}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inv. Count</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold"
                  value={form.stock || ""}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GST %</label>
                <input
                  type="number"
                  className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold"
                  value={form.gst_percent || ""}
                  onChange={(e) => setForm({ ...form, gst_percent: e.target.value })}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl hover:bg-slate-800 transition-all active:scale-95 mt-4 uppercase tracking-widest"
            >
              Commit Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      {viewModal && selectedProduct && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative border border-white/20">
            <div className="h-32 bg-linear-to-r from-blue-600 to-indigo-700 p-8 flex justify-between items-start">
              <div>
                <h2 className="text-white text-3xl font-black italic">{selectedProduct.name}</h2>
                <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-80">Product Specification Card</p>
              </div>
              <button onClick={() => setViewModal(false)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center font-bold backdrop-blur-md transition-all">✕</button>
            </div>

            <div className="p-10 -mt-10 bg-white rounded-t-[3rem] relative z-10 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pricing</p>
                  <p className="text-2xl font-black text-blue-600 italic">₹{selectedProduct.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="p-6 bg-slate-50 rounded-3xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Stock</p>
                  <p className={`text-xl font-black ${selectedProduct.stock <= selectedProduct.low_stock_limit ? 'text-red-500' : 'text-slate-800'}`}>{selectedProduct.stock}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-2">GST</p>
                  <p className="text-xl font-black text-slate-800">{selectedProduct.gst_percent}%</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl text-center">
                  <p className="text-[9px] font-black text-blue-400 uppercase mb-2">Alert At</p>
                  <p className="text-xl font-black text-blue-600">{selectedProduct.low_stock_limit}</p>
                </div>
              </div>

              <button
                onClick={() => setViewModal(false)}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Dismiss Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
