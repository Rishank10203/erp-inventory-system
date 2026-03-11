import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import API from "../api/axios";

const Billing = () => {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [items, setItems] = useState([{ product: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [viewData, setViewData] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);

  const fetchData = async () => {
    try {
      const [custRes, prodRes, invRes] = await Promise.all([
        API.get("customers/"),
        API.get("products/"),
        API.get("billing/invoices/")
      ]);
      setCustomers(custRes.data.results || custRes.data || []);
      setProducts(prodRes.data.results || prodRes.data || []);
      setInvoices(invRes.data.results || invRes.data || []);
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => setItems([...items, { product: "", quantity: 1 }]);

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === parseInt(item.product));
      if (!product) return total;
      const subtotal = parseFloat(product.price) * item.quantity;
      const gst = subtotal * (parseFloat(product.gst_percent || 0) / 100);
      return total + subtotal + gst;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedCustomer) return alert("Select Customer");
    if (items.some(i => !i.product)) return alert("Select Product for all items");

    setLoading(true);
    try {
      const payload = {
        customer: parseInt(selectedCustomer),
        items: items.map(i => ({
          product: parseInt(i.product),
          quantity: parseInt(i.quantity)
        }))
      };

      await API.post("billing/create/", payload);
      alert("Invoice Synchronized!");
      setSelectedCustomer("");
      setItems([{ product: "", quantity: 1 }]);
      setInvoiceModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Void this invoice? Inventory stock will be restored.")) {
      try {
        await API.delete(`invoices/${id}/`);
        fetchData();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleDownloadPDF = (id) => {
    const url = `${API.defaults.baseURL}billing/download-pdf/${id}/`;
    window.open(url, "_blank");
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter italic">Billing & Invoices</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Manage sales and inventory updates</p>
        </div>

        <button
          onClick={() => setInvoiceModal(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center gap-2"
        >
          + Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Doc #</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Amount</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => setViewData(inv)}>
                  <td className="p-6 font-black text-blue-600">#{inv.invoice_number}</td>
                  <td className="p-6">
                    <p className="font-bold text-slate-700">{inv.customer_name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">GST: {inv.customer_gst || 'N/A'}</p>
                  </td>
                  <td className="p-6 text-xs font-bold text-slate-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-6 font-black text-slate-800 italic">₹{inv.final_amount}</td>
                  <td className="p-6 text-right space-x-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleDownloadPDF(inv.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs font-bold">PDF</button>
                    <button onClick={() => handleDelete(inv.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">🗑️</button>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 font-bold italic">No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Creation Modal */}
      <Modal isOpen={invoiceModal} onClose={() => setInvoiceModal(false)}>
        <div className="p-4 space-y-6">
          <div className="flex justify-between items-center bg-slate-50 -m-4 p-8 rounded-t-[2rem] border-b border-slate-100 mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">New Invoice</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select client and items below</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Customer</label>
              <select
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-blue-500/50 outline-none transition-all font-semibold"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Choose Customer...</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.gst_number ? `(${c.gst_number})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Item List</h4>
                <button onClick={addItem} className="text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-all">+ Add Item</button>
              </div>

              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 bg-slate-50 p-4 rounded-2xl relative group">
                    <div className="col-span-8 space-y-1">
                      <select
                        className="w-full bg-white p-3 rounded-xl font-bold text-xs outline-none shadow-sm"
                        value={item.product}
                        onChange={(e) => updateItem(index, "product", e.target.value)}
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3 space-y-1">
                      <input
                        type="number"
                        className="w-full bg-white p-3 rounded-xl font-bold text-xs outline-none shadow-sm"
                        value={item.quantity}
                        min="1"
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 transition-all font-bold"
                        disabled={items.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
              <h4 className="text-2xl font-black italic">₹{calculateTotal().toLocaleString()}</h4>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
            >
              {loading ? "Saving..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      {viewData && (
        <Modal isOpen={!!viewData} onClose={() => setViewData(null)}>
          <div className="bg-white overflow-hidden relative">
            <div className="p-8 bg-slate-900 text-white">
              <h2 className="text-2xl font-black italic">Invoice #{viewData.invoice_number}</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">{new Date(viewData.created_at).toLocaleString()}</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex justify-between items-end border-b border-slate-50 pb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-xl font-black text-slate-800">{viewData.customer_name}</p>
                  {viewData.customer_gst && <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">GSTIN: {viewData.customer_gst}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-3xl font-black text-slate-900 italic">₹{viewData.final_amount}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Detail</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                  {viewData.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item.product_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{item.quantity} x ₹{item.price}</p>
                      </div>
                      <p className="font-black text-slate-800">₹{item.subtotal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => handleDownloadPDF(viewData.id)} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <span>📄</span> Download PDF
                </button>
                <button
                  onClick={() => setViewData(null)}
                  className="px-6 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Billing;