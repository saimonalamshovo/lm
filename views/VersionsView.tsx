
import React from 'react';
import { History, RotateCcw, Trash2, Calendar, Database, ArrowRight } from 'lucide-react';
import { Version } from '../types';

interface VersionsViewProps {
  versions: Version[];
  setVersions: React.Dispatch<React.SetStateAction<Version[]>>;
  onRestore: (version: Version) => void;
  theme: 'dark' | 'light';
}

const VersionsView: React.FC<VersionsViewProps> = ({ versions, setVersions, onRestore, theme }) => {
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const deleteVersion = (id: string) => {
    if (confirm('Delete this historical record permanently?')) {
      setVersions(prev => prev.filter(v => v.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h2 className={`text-4xl font-black ${textColor} italic uppercase tracking-tighter`}>Saved Progress</h2>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Manage and restore old dashboard states</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {versions.length === 0 ? (
          <div className="lg:col-span-3 text-center py-40 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[3rem] opacity-30">
             <History className="w-20 h-20 mx-auto mb-6 text-slate-500" />
             <p className="text-xl font-black uppercase italic tracking-[0.2em]">No history records found</p>
             <p className="text-xs font-bold uppercase mt-2">Use "Save & Start New" to create your first record</p>
          </div>
        ) : (
          versions.map((version) => (
            <div key={version.id} className={`${cardBg} border-2 border-slate-800/10 rounded-[3rem] p-10 shadow-2xl group hover:border-blue-500/30 transition-all hover:scale-[1.02]`}>
               <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} flex items-center justify-center border border-slate-700 shadow-lg`}>
                     <Database className="w-7 h-7 text-blue-500" />
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => onRestore(version)} className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-2xl transition-all shadow-sm" title="Restore Data"><RotateCcw className="w-5 h-5" /></button>
                     <button onClick={() => deleteVersion(version.id)} className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm" title="Delete Record"><Trash2 className="w-5 h-5" /></button>
                  </div>
               </div>
               
               <h3 className={`text-2xl font-black ${textColor} truncate mb-2 uppercase italic tracking-tighter`}>{version.name}</h3>
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 pb-6 border-b border-slate-800/10">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(version.timestamp).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <StatSnippet label="Transactions" value={version.data.sales?.length || 0} theme={theme} />
                  <StatSnippet label="Goal Amount" value={`৳${((version.data.monthlyTarget || 0) / 1000).toFixed(0)}k`} theme={theme} />
                  <StatSnippet label="Mission Count" value={version.data.tasks?.length || 0} theme={theme} />
                  <StatSnippet label="Staff Size" value={version.data.teamMembers?.length || 0} theme={theme} />
               </div>
               
               <button 
                onClick={() => onRestore(version)}
                className="w-full mt-10 py-4 bg-slate-800/50 hover:bg-blue-600 text-slate-400 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.2em]"
               >
                 GO TO THIS VERSION <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StatSnippet = ({ label, value, theme }: { label: string, value: any, theme: 'dark' | 'light' }) => (
  <div className={`${theme === 'dark' ? 'bg-slate-950/50' : 'bg-gray-50'} p-5 rounded-[1.5rem] border border-slate-800/20 shadow-inner`}>
     <p className="text-[9px] font-black text-slate-500 uppercase mb-1 tracking-widest">{label}</p>
     <p className={`text-lg font-black italic ${theme === 'dark' ? 'text-slate-200' : 'text-gray-800'} tracking-tighter`}>{value}</p>
  </div>
);

export default VersionsView;
