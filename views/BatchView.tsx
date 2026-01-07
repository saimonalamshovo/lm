
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Calendar, 
  Link as LinkIcon, 
  Users, 
  Coins, 
  ArrowLeft, 
  ArrowRight,
  Save, 
  PlusCircle,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { BatchProject, Student, BatchAdCost, Agent } from '../types';

interface BatchViewProps {
  batchProjects: BatchProject[];
  setBatchProjects: React.Dispatch<React.SetStateAction<BatchProject[]>>;
  agents: Agent[];
  theme: 'dark' | 'light';
}

const BatchView: React.FC<BatchViewProps> = ({ batchProjects, setBatchProjects, agents, theme }) => {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAdCostModal, setShowAdCostModal] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState('');
  
  const [headerFormData, setHeaderFormData] = useState({ courseName: '', landingPage: '', startDate: '' });
  const [modalFormData, setModalFormData] = useState({ courseName: '', landingPage: '', startDate: new Date().toISOString().split('T')[0] });
  const [adCostFormData, setAdCostFormData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });

  const activeBatch = useMemo(() => batchProjects.find(b => b.id === selectedBatchId), [batchProjects, selectedBatchId]);

  useEffect(() => {
    if (activeBatch) {
      setHeaderFormData({ courseName: activeBatch.courseName, landingPage: activeBatch.landingPage, startDate: activeBatch.startDate });
    }
  }, [selectedBatchId, activeBatch?.id]);

  const filteredBatches = useMemo(() => batchProjects.filter(b => b.courseName.toLowerCase().includes(batchSearchTerm.toLowerCase())), [batchProjects, batchSearchTerm]);

  const saveBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    const newBatch: BatchProject = { id, courseName: modalFormData.courseName, landingPage: modalFormData.landingPage, startDate: modalFormData.startDate, students: [], adCosts: [], createdAt: new Date().toISOString() };
    setBatchProjects(prev => [newBatch, ...prev]);
    setShowBatchModal(false);
    setSelectedBatchId(id);
  };

  const updateBatchHeader = () => {
    if (!activeBatch) return;
    setBatchProjects(prev => prev.map(b => b.id === activeBatch.id ? { ...b, ...headerFormData } : b));
    alert("Project Synchronized.");
  };

  const addStudent = () => {
    if (!activeBatch) return;
    const newStudent: Student = { id: Math.random().toString(36).substr(2, 9), name: '', number: '', email: '', paid: 0, due: 0, access: false, advisor: '' };
    setBatchProjects(prev => prev.map(b => b.id === activeBatch.id ? { ...b, students: [...b.students, newStudent] } : b));
  };

  const updateStudent = (studentId: string, field: keyof Student, value: any) => {
    setBatchProjects(prev => prev.map(b => b.id === selectedBatchId ? { ...b, students: b.students.map(s => s.id === studentId ? { ...s, [field]: value } : s) } : b));
  };

  const removeStudent = (studentId: string) => {
    setBatchProjects(prev => prev.map(b => b.id === selectedBatchId ? { ...b, students: b.students.filter(s => s.id !== studentId) } : b));
  };

  const addAdCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;
    const newCost: BatchAdCost = {
      id: Math.random().toString(36).substr(2, 9),
      amount: parseInt(adCostFormData.amount) || 0,
      date: adCostFormData.date,
      description: adCostFormData.description
    };
    setBatchProjects(prev => prev.map(b => b.id === activeBatch.id ? { ...b, adCosts: [...b.adCosts, newCost] } : b));
    setShowAdCostModal(false);
    setAdCostFormData({ amount: '', date: new Date().toISOString().split('T')[0], description: '' });
  };

  const removeAdCost = (costId: string) => {
    setBatchProjects(prev => prev.map(b => b.id === selectedBatchId ? { ...b, adCosts: b.adCosts.filter(c => c.id !== costId) } : b));
  };

  const totals = useMemo(() => {
    if (!activeBatch) return { paid: 0, due: 0, ads: 0 };
    const paid = activeBatch.students.reduce((acc, s) => acc + (Number(s.paid) || 0), 0);
    const due = activeBatch.students.reduce((acc, s) => acc + (Number(s.due) || 0), 0);
    const ads = activeBatch.adCosts.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    return { paid, due, ads };
  }, [activeBatch]);

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const inputBg = theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100';

  if (activeBatch) {
    return (
      <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-20">
        <div className="flex items-center justify-between">
           <button onClick={() => setSelectedBatchId(null)} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest">
              <ArrowLeft className="w-4 h-4" /> Return Hub
           </button>
           <button onClick={() => updateBatchHeader()} className="flex items-center gap-2 bg-blue-600 px-6 py-3 rounded-2xl font-black text-white text-[10px] uppercase tracking-widest italic shadow-xl">
              <Save className="w-4 h-4" /> Sync Changes
           </button>
        </div>

        <section className={`${cardBg} border-2 border-slate-800/20 rounded-[2.5rem] p-10 shadow-2xl`}>
           <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Batch Course Title</label>
                 <input className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-black uppercase italic`} value={headerFormData.courseName} onChange={e => setHeaderFormData({...headerFormData, courseName: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Launch Date</label>
                 <input type="date" className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`} value={headerFormData.startDate} onChange={e => setHeaderFormData({...headerFormData, startDate: e.target.value})} />
              </div>
              <div className="bg-slate-800/30 p-4 rounded-3xl border border-slate-700/50 flex flex-col justify-center">
                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid (৳)</p>
                 <p className="text-2xl font-black text-green-500">৳{totals.paid.toLocaleString()}</p>
              </div>
              <div className="bg-red-500/10 p-4 rounded-3xl border border-red-500/20 flex flex-col justify-center">
                 <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">Total Due (৳)</p>
                 <p className="text-2xl font-black text-red-500">৳{totals.due.toLocaleString()}</p>
              </div>
           </div>
        </section>

        <section className={`${cardBg} border-2 border-slate-800/20 rounded-[2.5rem] shadow-2xl overflow-hidden`}>
           <div className="p-8 border-b border-slate-800/20 flex items-center justify-between">
              <h3 className={`text-xl font-black ${textColor} uppercase tracking-tight`}>Enrollment Roster</h3>
              <button onClick={addStudent} className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase">
                 <PlusCircle className="w-4 h-4" /> Append Student
              </button>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className={theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-100'}>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Paid (৳)</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-red-500">Due (৳)</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Advisor</th>
                       <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">X</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800">
                    {activeBatch.students.map(student => (
                      <tr key={student.id} className="hover:bg-slate-800/20">
                        <td className="px-4 py-2">
                           <input className="w-full bg-transparent border-none outline-none text-white text-xs font-bold" value={student.name} onChange={e => updateStudent(student.id, 'name', e.target.value)} placeholder="Full Name..." />
                        </td>
                        <td className="px-4 py-2">
                           <input type="number" className="w-24 bg-transparent border-none outline-none text-green-500 text-xs font-black" value={student.paid} onChange={e => updateStudent(student.id, 'paid', e.target.value)} />
                        </td>
                        <td className="px-4 py-2">
                           <input type="number" className="w-24 bg-transparent border-none outline-none text-red-500 text-xs font-black" value={student.due} onChange={e => updateStudent(student.id, 'due', e.target.value)} />
                        </td>
                        <td className="px-4 py-2">
                           <select className="w-full bg-transparent border-none outline-none text-white text-[10px] font-black uppercase" value={student.advisor} onChange={e => updateStudent(student.id, 'advisor', e.target.value)}>
                              <option value="">N/A</option>
                              {agents.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
                           </select>
                        </td>
                        <td className="px-4 py-2 text-center">
                           <button onClick={() => removeStudent(student.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </section>

        <section className={`${cardBg} border-2 border-slate-800/20 rounded-[2.5rem] p-10 shadow-2xl`}>
           <div className="flex items-center justify-between mb-8">
              <h3 className={`text-xl font-black ${textColor} flex items-center gap-3 uppercase tracking-tight`}>
                 <Zap className="w-6 h-6 text-red-500" />
                 Campaign Ad Spend
              </h3>
              <button onClick={() => setShowAdCostModal(true)} className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase">
                 <PlusCircle className="w-4 h-4" /> Add Expense
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {activeBatch.adCosts.map(cost => (
                <div key={cost.id} className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 relative group">
                   <button onClick={() => removeAdCost(cost.id)} className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                   <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{cost.date}</p>
                   <p className="text-2xl font-black text-white italic">৳{cost.amount.toLocaleString()}</p>
                </div>
              ))}
           </div>
        </section>

        {showAdCostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
             <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl`}>
                <h3 className="text-2xl font-black text-white uppercase italic mb-8">Add Ad Spend</h3>
                <form onSubmit={addAdCost} className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Amount (৳)</label>
                      <input type="number" className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`} value={adCostFormData.amount} onChange={e => setAdCostFormData({...adCostFormData, amount: e.target.value})} required autoFocus />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Date</label>
                      <input type="date" className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`} value={adCostFormData.date} onChange={e => setAdCostFormData({...adCostFormData, date: e.target.value})} required />
                   </div>
                   <button type="submit" className="w-full py-6 bg-red-600 text-white font-black rounded-3xl uppercase tracking-widest italic mt-4 shadow-xl">Commit Expense</button>
                   <button type="button" onClick={() => setShowAdCostModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px]">Cancel</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-4xl font-black ${textColor} uppercase tracking-tighter italic`}>Batch Hub</h2>
          <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Operational Projects</p>
        </div>
        <button onClick={() => setShowBatchModal(true)} className="flex items-center gap-3 bg-blue-600 px-8 py-4 rounded-2xl font-black text-white shadow-xl shadow-blue-900/40 transition-transform hover:scale-[1.02] uppercase text-xs tracking-widest italic">
          <Plus className="w-5 h-5" /> Initialize Batch
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {filteredBatches.map(batch => (
           <div key={batch.id} className={`${cardBg} border-2 border-slate-800/10 rounded-[3rem] p-10 shadow-2xl group hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden`} onClick={() => setSelectedBatchId(batch.id)}>
              <div className="flex justify-between items-start mb-8">
                 <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg"><Zap className="w-7 h-7 text-white" /></div>
                 <button onClick={(e) => { e.stopPropagation(); setBatchProjects(prev => prev.filter(b => b.id !== batch.id)); }} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
              <h3 className={`text-2xl font-black ${textColor} uppercase italic tracking-tighter mb-2 truncate`}>{batch.courseName}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">LAUNCH: {batch.startDate}</p>
              <div className="flex items-center justify-between pt-6 border-t border-slate-800/20">
                 <div className="flex flex-col">
                    <p className="text-[9px] font-black text-slate-500 uppercase">Paid/Due</p>
                    <p className="text-xs font-black text-blue-500 uppercase">৳{batch.students.reduce((a, s) => a + (Number(s.paid) || 0), 0).toLocaleString()} / <span className="text-red-500">৳{batch.students.reduce((a, s) => a + (Number(s.due) || 0), 0).toLocaleString()}</span></p>
                 </div>
                 <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-blue-500 transition-colors" />
              </div>
           </div>
         ))}
      </div>
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3rem] p-12 w-full max-w-md shadow-2xl`}>
              <h3 className="text-3xl font-black text-white uppercase italic mb-8">Initialize Batch</h3>
              <form onSubmit={saveBatch} className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Course Name</label>
                    <input className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold uppercase`} value={modalFormData.courseName} onChange={e => setModalFormData({...modalFormData, courseName: e.target.value})} required autoFocus />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Launch Date</label>
                    <input type="date" className={`w-full ${inputBg} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`} value={modalFormData.startDate} onChange={e => setModalFormData({...modalFormData, startDate: e.target.value})} required />
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl uppercase tracking-widest italic mt-4">Deploy Project</button>
                 <button type="button" onClick={() => setShowBatchModal(false)} className="w-full py-4 text-slate-500 font-bold uppercase text-[10px]">Cancel</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BatchView;
