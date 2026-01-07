
import React, { useState, useMemo } from 'react';
import { UserPlus, Plus, TrendingUp, DollarSign, Trash2, Edit3, Save, X, BarChart3, Globe, PhoneCall, Calendar, Search, ArrowRightCircle, ShieldAlert, Users, Wallet, MessageSquare } from 'lucide-react';
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
  const [showDeleteAgentModal, setShowDeleteAgentModal] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [agentEditId, setAgentEditId] = useState<string | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  
  const [newAgent, setNewAgent] = useState({ name: '', avatar: '👨‍💼', color: '#ef4444' });
  const [bulkInputs, setBulkInputs] = useState<Record<string, { amount: string, adCost: string }>>({});
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [saleFormData, setSaleFormData] = useState({
    amount: '',
    adCost: '',
    date: new Date().toISOString().split('T')[0],
    type: 'website' as 'website' | 'call' | 'hand_cash',
    agentId: '',
    comment: ''
  });

  const saveSale = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(saleFormData.amount);
    const adCost = parseInt(saleFormData.adCost) || 0;
    
    if (amount > 0) {
      if (editId) {
        setSales(prev => prev.map(s => s.id === editId ? { 
          ...s, 
          amount, 
          adCost, 
          comment: saleFormData.comment,
          createdAt: saleFormData.date + "T12:00:00Z",
          type: saleFormData.type,
          agentId: (saleFormData.type === 'call' || saleFormData.type === 'hand_cash') ? saleFormData.agentId : undefined
        } : s));
      } else {
        const newSale: Sale = {
          id: Math.random().toString(36).substr(2, 9),
          type: saleFormData.type,
          amount,
          adCost,
          comment: saleFormData.comment,
          agentId: (saleFormData.type === 'call' || saleFormData.type === 'hand_cash') ? saleFormData.agentId : undefined,
          createdAt: saleFormData.date + "T12:00:00Z"
        };
        setSales(prev => [newSale, ...prev]);
      }
      setShowSaleModal(false);
      setEditId(null);
      setSaleFormData({ amount: '', adCost: '', date: new Date().toISOString().split('T')[0], type: 'website', agentId: '', comment: '' });
    }
  };

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.name.trim()) return;

    if (agentEditId) {
      setAgents(prev => prev.map(a => a.id === agentEditId ? { ...a, ...newAgent } : a));
    } else {
      const agent: Agent = {
        id: newAgent.name.toLowerCase().replace(/\s/g, '_') + '_' + Date.now(),
        name: newAgent.name,
        avatar: newAgent.avatar,
        color: newAgent.color
      };
      setAgents(prev => [...prev, agent]);
    }

    setNewAgent({ name: '', avatar: '👨‍💼', color: '#ef4444' });
    setAgentEditId(null);
    setShowAgentModal(false);
  };

  const openAgentEdit = (agent: Agent) => {
    setAgentEditId(agent.id);
    setNewAgent({ name: agent.name, avatar: agent.avatar, color: agent.color });
    setShowAgentModal(true);
  };

  const confirmDeleteAgent = () => {
    if (!agentToDelete) return;
    setAgents(prev => prev.filter(a => a.id !== agentToDelete.id));
    setShowDeleteAgentModal(false);
    setAgentToDelete(null);
  };

  const deleteSale = (id: string) => {
    if (window.confirm('Delete this financial entry?')) {
      setSales(prev => prev.filter(s => s.id !== id));
    }
  };

  const openEdit = (sale: Sale) => {
    setEditId(sale.id);
    setSaleFormData({
      amount: sale.amount.toString(),
      adCost: sale.adCost.toString(),
      date: sale.createdAt.split('T')[0],
      type: sale.type,
      agentId: sale.agentId || '',
      comment: sale.comment || ''
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
    setSales(prev => [...newBatch, ...prev]);
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
        (s.comment?.toLowerCase().includes(search)) ||
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
           <button onClick={() => { setAgentEditId(null); setNewAgent({ name: '', avatar: '👨‍💼', color: '#ef4444' }); setShowAgentModal(true); }} className="flex items-center gap-3 bg-blue-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <UserPlus className="w-5 h-5" /> Recruit Agent
           </button>
           <button onClick={() => { setEditId(null); setShowSaleModal(true); }} className="flex items-center gap-3 bg-orange-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <Plus className="w-5 h-5" /> Individual Sale
           </button>
           <button onClick={() => setShowBulkSale(true)} className="flex items-center gap-3 bg-green-600 px-6 py-4 rounded-2xl font-bold text-white shadow-xl transition-transform hover:scale-[1.02] text-xs uppercase tracking-widest">
             <TrendingUp className="w-5 h-5" /> Call Ops Log
           </button>
        </div>
      </div>

      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2rem] p-8 shadow-2xl`}>
         <div className="flex items-center justify-between mb-8">
            <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
               <Users className="w-6 h-6 text-blue-500" />
               Sales Force Roster
            </h3>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
            {agents.map(agent => (
               <div key={agent.id} className={`p-6 rounded-[2rem] ${theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-50'} border border-slate-800/20 group hover:border-blue-500/30 transition-all relative overflow-hidden`}>
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-lg border-2 border-slate-800/20 transition-transform group-hover:scale-110" style={{ backgroundColor: `${agent.color}15`, borderColor: agent.color }}>
                        {agent.avatar}
                     </div>
                     <div className="text-center">
                        <p className={`text-sm font-black uppercase italic ${textColor}`}>{agent.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Specialist</p>
                     </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-6">
                     <button onClick={() => openAgentEdit(agent)} className="p-2 text-slate-500 hover:text-blue-500 bg-slate-800/30 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                     <button onClick={() => { setAgentToDelete(agent); setShowDeleteAgentModal(true); }} className="p-2 text-slate-500 hover:text-red-500 bg-slate-800/30 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
            ))}
         </div>
      </section>

      <section className={`${cardBg} border-2 border-slate-800/10 rounded-[2rem] shadow-2xl overflow-hidden`}>
         <div className="p-8 border-b border-slate-800/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className={`text-xl font-bold ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
               <BarChart3 className="w-6 h-6 text-red-600" />
               Commercial Ledger
            </h3>
            <div className="relative w-full md:w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               <input 
                placeholder="Search entries or comments..." 
                className={`w-full ${inputBg} rounded-2xl py-4 pl-12 pr-6 border-none outline-none text-xs font-semibold ${textColor} focus:ring-1 focus:ring-red-500`}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className={theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-100'}>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Channel</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Agent</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Comment</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (৳)</th>
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
                           <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                             sale.type === 'website' ? 'bg-orange-500/10 text-orange-500' : 
                             sale.type === 'hand_cash' ? 'bg-green-500/10 text-green-500' : 
                             'bg-blue-500/10 text-blue-500'
                           }`}>
                              {sale.type.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <span className="text-xl">{agent?.avatar || '🌐'}</span>
                              <p className={`text-xs font-bold uppercase ${textColor}`}>{agent?.name || 'Direct Order'}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6 max-w-xs truncate">
                           <p className={`text-xs italic text-slate-500`}>{sale.comment || '---'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-bold text-green-500 tabular-nums">৳{sale.amount.toLocaleString()}</p>
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

      {showAgentModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-between items-center mb-8">
                 <h3 className={`text-2xl font-bold ${textColor} uppercase tracking-tight`}>{agentEditId ? 'Modify Agent' : 'Recruit New Agent'}</h3>
                 <button onClick={() => { setShowAgentModal(false); setAgentEditId(null); }} className="text-slate-500 hover:text-red-500"><X className="w-7 h-7" /></button>
              </div>
              <form onSubmit={handleSaveAgent} className="space-y-6">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Agent Full Name</label>
                   <input 
                    placeholder="e.g. Afrin Sultana" 
                    className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none focus:ring-2 focus:ring-blue-600 font-bold`}
                    value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value})}
                    required
                    autoFocus
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Avatar / Emoji</label>
                      <input 
                        className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold text-center`}
                        value={newAgent.avatar} onChange={e => setNewAgent({...newAgent, avatar: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Color</label>
                      <input 
                        type="color"
                        className={`w-full h-[58px] ${inputBg} border-none rounded-2xl p-1 outline-none cursor-pointer`}
                        value={newAgent.color} onChange={e => setNewAgent({...newAgent, color: e.target.value})}
                      />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-900/40 uppercase tracking-widest italic mt-4">
                    {agentEditId ? 'Commit Update' : 'Authorize Recruitment'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {showDeleteAgentModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-red-500/30 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95`}>
              <div className="flex justify-center mb-6"><div className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center"><ShieldAlert className="w-8 h-8 text-red-600" /></div></div>
              <h3 className={`text-xl font-black ${textColor} text-center uppercase tracking-tight`}>Terminate Agent Service?</h3>
              <p className="text-slate-500 text-center text-sm mt-4 leading-relaxed font-medium">Are you sure you want to remove "<span className="text-red-500 font-bold">{agentToDelete?.name}</span>" from the active roster?</p>
              <div className="flex flex-col gap-3 mt-8">
                 <button onClick={confirmDeleteAgent} className="w-full py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl shadow-red-900/30">Terminate Record</button>
                 <button onClick={() => { setShowDeleteAgentModal(false); setAgentToDelete(null); }} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px] tracking-widest">Keep Agent</button>
              </div>
           </div>
        </div>
      )}

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
                         <option value="hand_cash">💵 Hand Cash</option>
                      </select>
                    </div>
                    {(saleFormData.type === 'call' || saleFormData.type === 'hand_cash') && (
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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comment / Reference</label>
                    <textarea 
                      className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-semibold text-xs`}
                      rows={2}
                      placeholder="Enter sale details or customer reference..."
                      value={saleFormData.comment} onChange={e => setSaleFormData({...saleFormData, comment: e.target.value})}
                    />
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
