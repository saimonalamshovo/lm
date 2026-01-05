
import React, { useState, useMemo } from 'react';
import { UserPlus, Plus, TrendingUp, DollarSign, Trash2, Edit3, Save, X, BarChart3, Globe, PhoneCall, Calendar, Search, ArrowRightCircle } from 'lucide-react';
import { Lead, Sale, Agent } from '../types';

interface SalesViewProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
  theme: 'dark' | 'light';
}

const SalesView: React.FC<SalesViewProps> = ({ leads, setLeads, sales, setSales, agents, setAgents, theme }) => {
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showBulkSale, setShowBulkSale] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [newAgent, setNewAgent] = useState({ name: '', avatar: '👨‍💼', color: '#ef4444' });
  const [bulkInputs, setBulkInputs] = useState<Record<string, { amount: string, adCost: string }>>({});
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [saleFormData, setSaleFormData] = useState({
    amount: '',
    adCost: '',
    date: new Date().toISOString().split('T')[0],
    type: 'website' as 'website' | 'call',
    agentId: ''
  });

  const saveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(saleFormData.amount);
    const adCost = parseInt(saleFormData.adCost) || 0;
    
    if (amount > 0) {
      if (editId) {
        setSales(sales.map(s => s.id === editId ? { 
          ...s, 
          amount, 
          adCost, 
          createdAt: saleFormData.date + "T12:00:00Z",
          type: saleFormData.type,
          agentId: saleFormData.type === 'call' ? saleFormData.agentId : undefined
        } : s));
      } else {
        const newSale: Sale = {
          id: Math.random().toString(36).substr(2, 9),
          type: saleFormData.type,
          amount,
          adCost,
          agentId: saleFormData.type === 'call' ? saleFormData.agentId : undefined,
          createdAt: saleFormData.date + "T12:00:00Z"
        };
        setSales([newSale, ...sales]);
      }
      setShowSaleModal(false);
      setEditId(null);
      setSaleFormData({ amount: '', adCost: '', date: new Date().toISOString().split('T')[0], type: 'website', agentId: '' });
    }
  };

  const deleteSale = (id: string) => {
    if (confirm('Delete this financial entry?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };

  const openEdit = (sale: Sale) => {
    setEditId(sale.id);
    setSaleFormData({
      amount: sale.amount.toString(),
      adCost: sale.adCost.toString(),
      date: sale.createdAt.split('T')[0],
      type: sale.type,
      agentId: sale.agentId || ''
    });
    setShowSaleModal(true);
  };

  const addBulkSales = () => {
    const newBatch: Sale[] = [];
    Object.keys(bulkInputs).forEach(agentId => {
      const data = bulkInputs[agentId];
      if (parseInt(data.amount) > 0) {
        newBatch.push({
          id: Math.random().toString(36).substr(2, 9),
          agentId,
          type: 'call',
          amount: parseInt(data.amount),
          adCost: parseInt(data.adCost) || 0,
          createdAt: bulkDate + "T12:00:00Z"
        });
      }
    });
    setSales([...newBatch, ...sales]);
    setShowBulkSale(false);
    setBulkInputs({});
  };

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const agent = agents.find(a => a.id === s.agentId);
      const search = searchTerm.toLowerCase();
      return (
        s.type.toLowerCase().includes(search) ||
        (agent?.name.toLowerCase().includes(search)) ||
        s.amount.toString().includes(search) ||
        s.createdAt.includes(search)
      );
    });
  }, [sales, searchTerm, agents]);

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelColor = theme === 'dark' ? 'text-slate-500' : 'text-gray-400';
  const inputBg = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100';

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h2 className={`text-3xl font-bold ${textColor} uppercase tracking-tight`}>Revenue Hub</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Operational Flow Management</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <button onClick={() => setShowAgentModal(true)} className="flex items-center gap-3 bg-blue-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <UserPlus className="w-5 h-5" /> Recruit Agent
           </button>
           <button onClick={() => { setEditId(null); setShowSaleModal(true); }} className="flex items-center gap-3 bg-orange-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <Globe className="w-5 h-5" /> Individual Sale
           </button>
           <button onClick={() => setShowBulkSale(true)} className="flex items-center gap-3 bg-green-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <TrendingUp className="w-5 h-5" /> Call Ops Log
           </button>
        </div>
      </div>

      {/* REVENUE LEDGER TABLE */}
      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2rem] shadow-2xl overflow-hidden`}>
         <div className="p-8 border-b border-slate-800/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
               <BarChart3 className="w-6 h-6 text-red-500" />
               Commercial Ledger
            </h3>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                placeholder="Search by agent, channel, or amount..." 
                className={`w-full ${inputBg} rounded-2xl py-4 pl-12 pr-6 border-none outline-none text-xs font-semibold ${textColor} focus:ring-1 focus:ring-red-500`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-50'}>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Channel</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (৳)</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ad Spend (৳)</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
               </thead>
               <tbody className={`divide-y ${theme === 'dark' ? 'divide-slate-800' : 'divide-gray-100'}`}>
                  {filteredSales.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-24 text-center opacity-30 font-bold uppercase text-xs">No records found</td></tr>
                  ) : filteredSales.slice(0, 40).map(sale => {
                    const agent = agents.find(a => a.id === sale.agentId);
                    return (
                      <tr key={sale.id} className="hover:bg-red-500/5 transition-colors group">
                        <td className="px-8 py-6">
                           <p className={`text-xs font-semibold ${textColor}`}>{new Date(sale.createdAt).toLocaleDateString()}</p>
                           <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${sale.type === 'website' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                              {sale.type}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <span className="text-xl">{agent?.avatar || '🌐'}</span>
                              <p className={`text-xs font-bold uppercase ${textColor}`}>{agent?.name || 'Direct Order'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-green-500 tabular-nums">৳{sale.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-red-500 tabular-nums">৳{(sale.adCost || 0).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => openEdit(sale)} className="p-2 text-slate-500 hover:text-blue-500"><Edit3 className="w-5 h-5" /></button>
                              <button onClick={() => deleteSale(sale.id)} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                           </div>
                        </td>
                      </tr>
                    )
                  })}
               </tbody>
            </table>
         </div>
      </section>

      {/* Sale Modal (Individual) */}
      {showSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95`}>
              <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight mb-8`}>
                 {editId ? 'Modify Record' : 'Log Individual Transaction'}
              </h3>
              <form onSubmit={saveSale} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Channel</label>
                      <select 
                        className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                        value={saleFormData.type}
                        onChange={e => setSaleFormData({...saleFormData, type: e.target.value as any})}
                      >
                         <option value="website">🌐 Website Sale</option>
                         <option value="call">📞 Call Center</option>
                      </select>
                    </div>
                    {saleFormData.type === 'call' && (
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assign Agent</label>
                          <select 
                            className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                            value={saleFormData.agentId}
                            onChange={e => setSaleFormData({...saleFormData, agentId: e.target.value})}
                          >
                             <option value="">Select...</option>
                             {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                       </div>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Revenue (৳)</label>
                      <input 
                        type="number"
                        className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                        value={saleFormData.amount} onChange={e => setSaleFormData({...saleFormData, amount: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ad Cost (৳)</label>
                      <input 
                        type="number"
                        className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                        value={saleFormData.adCost} onChange={e => setSaleFormData({...saleFormData, adCost: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local Date</label>
                    <input 
                      type="date"
                      className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                      value={saleFormData.date} onChange={e => setSaleFormData({...saleFormData, date: e.target.value})}
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowSaleModal(false)} className={`flex-1 py-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} font-bold rounded-2xl uppercase text-[10px]`}>Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl uppercase tracking-widest shadow-xl">Commit</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Bulk Entry Modal */}
      {showBulkSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in slide-in-from-bottom-5 duration-300`}>
              <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-800/10">
                 <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>Batch Operations Log</h3>
                 <button onClick={() => setShowBulkSale(false)}><X className="w-8 h-8 text-slate-500" /></button>
              </div>
              
              <div className="mb-10 p-8 bg-slate-800/20 rounded-[2rem] border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Shift Date (Dhaka Time)</p>
                    <input type="date" className="bg-slate-950 text-white font-bold text-xl rounded-xl px-4 py-2 border border-slate-700 outline-none" value={bulkDate} onChange={e => setBulkDate(e.target.value)} />
                 </div>
                 <Calendar className="w-10 h-10 text-slate-700" />
              </div>

              <div className="space-y-4 mb-10">
                 {agents.map(agent => (
                   <div key={agent.id} className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-6 rounded-[2rem] flex items-center gap-6 border border-slate-800/20 hover:border-blue-500/20 transition-all shadow-sm`}>
                      <span className="text-4xl">{agent.avatar}</span>
                      <p className={`flex-1 font-bold ${textColor} uppercase text-sm tracking-tight`}>{agent.name}</p>
                      <div className="flex gap-4">
                         <div className="flex flex-col">
                            <label className="text-[8px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Inflow ৳</label>
                            <input 
                              type="number"
                              className="w-32 bg-slate-950 text-green-500 rounded-xl px-4 py-3 text-xs font-bold outline-none border border-slate-800 focus:ring-1 focus:ring-green-500"
                              value={bulkInputs[agent.id]?.amount || ''}
                              placeholder="0"
                              onChange={(e) => setBulkInputs({ ...bulkInputs, [agent.id]: { ...(bulkInputs[agent.id] || { adCost: '' }), amount: e.target.value } })}
                            />
                         </div>
                         <div className="flex flex-col">
                            <label className="text-[8px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Burn ৳</label>
                            <input 
                              type="number"
                              className="w-32 bg-slate-950 text-red-500 rounded-xl px-4 py-3 text-xs font-bold outline-none border border-slate-800 focus:ring-1 focus:ring-red-500"
                              value={bulkInputs[agent.id]?.adCost || ''}
                              placeholder="0"
                              onChange={(e) => setBulkInputs({ ...bulkInputs, [agent.id]: { ...(bulkInputs[agent.id] || { amount: '' }), adCost: e.target.value } })}
                            />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
              <button onClick={addBulkSales} className="w-full py-7 bg-green-600 text-white font-bold rounded-[2rem] shadow-2xl uppercase tracking-[0.2em] transition-all text-xs">
                Submit Commercial Operations Log
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SalesView;
