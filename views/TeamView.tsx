
import React, { useState } from 'react';
import { Target, Star, UserPlus, Trash2, Edit3, X } from 'lucide-react';
import { Task, TeamMember } from '../types';

interface TeamViewProps {
  tasks: Task[];
  teamMembers: TeamMember[];
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  theme: 'dark' | 'light';
}

const TeamView: React.FC<TeamViewProps> = ({ tasks, teamMembers, setTeamMembers, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', role: '', avatar: '👤', color: '#6366f1' });

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  const saveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setTeamMembers(teamMembers.map(m => m.id === editId ? { ...m, ...formData } : m));
    } else {
      const id = formData.name.toLowerCase().replace(/\s/g, '_') + '_' + Date.now();
      setTeamMembers([...teamMembers, { id, ...formData }]);
    }
    closeModal();
  };

  const deleteMember = (id: string) => {
    if (confirm('Delete this team specialist? All task associations will remain but show as unassigned.')) {
      setTeamMembers(teamMembers.filter(m => m.id !== id));
    }
  };

  const openEdit = (member: TeamMember) => {
    setEditId(member.id);
    setFormData({ name: member.name, role: member.role, avatar: member.avatar, color: member.color });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ name: '', role: '', avatar: '👤', color: '#6366f1' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl font-black ${textColor} tracking-tight italic`}>STAFFING COMMAND</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Specialist Deployment & Performance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl font-black text-white shadow-lg shadow-indigo-900/30 hover:scale-105 transition-transform">
          <UserPlus className="w-5 h-5" /> RECRUIT SPECIALIST
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {teamMembers.map((member) => {
          const memberTasks = tasks.filter(t => t.assignee === member.id);
          const completedCount = memberTasks.filter(t => t.status === 'completed').length;
          const pendingCount = memberTasks.length - completedCount;
          const totalPoints = completedCount * 10;
          
          return (
            <div key={member.id} className={`group ${cardBg} border rounded-[2rem] p-8 hover:border-red-500/50 transition-all duration-300 shadow-xl relative`}>
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={() => openEdit(member)} className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}><Edit3 className="w-4 h-4" /></button>
                 <button onClick={() => deleteMember(member.id)} className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-red-500' : 'bg-gray-100 text-gray-500 hover:text-red-600'}`}><Trash2 className="w-4 h-4" /></button>
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                <div className="relative">
                  <div 
                    className="w-28 h-28 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl border-2 transition-transform group-hover:rotate-6" 
                    style={{ backgroundColor: `${member.color}15`, borderColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'} p-2 rounded-full border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-black text-white animate-pulse shadow-green-500/50 shadow-lg">
                       ACTIVE
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className={`text-2xl font-black ${textColor} leading-none mb-1 italic uppercase`}>{member.name}</h3>
                    <p className="text-sm font-bold text-red-500 uppercase tracking-[0.2em]">{member.role}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Backlog</p>
                      <p className={`text-2xl font-black ${textColor} italic`}>{pendingCount}</p>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">XP Points</p>
                      <p className="text-2xl font-black text-yellow-500 italic">{totalPoints}</p>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-4 rounded-2xl border ${theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'}`}>
                      <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Level</p>
                      <div className="flex gap-1 mt-1.5 text-red-500">
                         <Star className="w-3.5 h-3.5 fill-current" />
                         <Star className="w-3.5 h-3.5 fill-current" />
                         <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                       <span>Quota Efficiency</span>
                       <span className={textColor}>94%</span>
                    </div>
                    <div className={`${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} h-2 w-full rounded-full overflow-hidden`}>
                       <div className="h-full bg-gradient-to-r from-red-600 to-indigo-600 rounded-full w-[94%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in zoom-in duration-300">
          <div className={`${cardBg} border rounded-[3rem] p-10 w-full max-w-md shadow-2xl`}>
             <div className="flex justify-between items-center mb-8">
                <h3 className={`text-2xl font-black ${textColor} italic uppercase tracking-tighter`}>{editId ? 'Modify Specialist' : 'Recruit New Staff'}</h3>
                <button onClick={closeModal}><X className="w-6 h-6 text-slate-500" /></button>
             </div>
             <form onSubmit={saveMember} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    placeholder="e.g. John Wick" 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 ${textColor} outline-none focus:ring-2 focus:ring-indigo-600 font-bold`}
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designated Role</label>
                  <input 
                    placeholder="e.g. Ops Specialist" 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 ${textColor} outline-none focus:ring-2 focus:ring-indigo-600 font-bold`}
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Avatar</label>
                    <input 
                      placeholder="e.g. 👤" 
                      className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 ${textColor} outline-none focus:ring-2 focus:ring-indigo-600 font-bold text-center`}
                      value={formData.avatar} onChange={e => setFormData({...formData, avatar: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Color</label>
                    <input 
                      type="color"
                      className={`w-full h-[60px] ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl p-1 outline-none`}
                      value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-900/30 uppercase tracking-[0.2em] italic mt-4">
                   Commit Changes
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamView;
