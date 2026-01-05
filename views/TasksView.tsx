
import React, { useState, useMemo } from 'react';
import { Plus, GripVertical, CheckCircle2, Circle, Trash2, Calendar, User, Target as TargetIcon, FilterX, MessageSquare, Edit3, X, ChevronDown, ChevronUp, Link as LinkIcon, Send, Archive } from 'lucide-react';
import { Task, Priority, TeamMember, Comment } from '../types';

interface TasksViewProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  teamMembers: TeamMember[];
  theme: 'dark' | 'light';
}

const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks, teamMembers, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [personFilter, setPersonFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Task>>({
    title: '', assignee: '', priority: 'medium', dueDate: new Date().toISOString().split('T')[0], description: ''
  });

  const filteredTasks = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return tasks.filter(t => {
      const d = new Date(t.dueDate);
      let matchesDuration = true;
      if (filter === 'weekly') matchesDuration = d >= startOfWeek;
      else if (filter === 'monthly') matchesDuration = d >= startOfMonth;

      const matchesPerson = personFilter === 'all' || t.assignee === personFilter;
      const matchesSpecificDate = dateFilter === '' || t.dueDate === dateFilter;

      return matchesDuration && matchesPerson && matchesSpecificDate;
    }).sort((a, b) => a.order - b.order);
  }, [tasks, filter, personFilter, dateFilter]);

  const activeTasks = filteredTasks.filter(t => t.status === 'pending');
  const completedTasks = filteredTasks.filter(t => t.status === 'completed');

  const saveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editId) {
      setTasks(tasks.map(t => t.id === editId ? { 
        ...t, 
        title: formData.title || '', 
        assignee: formData.assignee || '', 
        priority: formData.priority as Priority || 'medium',
        dueDate: formData.dueDate || '',
        description: formData.description || ''
      } : t));
    } else {
      const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title || '',
        description: formData.description || '',
        assignee: formData.assignee || '',
        priority: formData.priority as Priority || 'medium',
        status: 'pending',
        dueDate: formData.dueDate || '',
        order: tasks.length,
        createdAt: new Date().toISOString(),
        comments: []
      };
      setTasks([newTask, ...tasks]);
    }
    closeModal();
  };

  const openEdit = (task: Task) => {
    setEditId(task.id);
    setFormData({
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      dueDate: task.dueDate,
      description: task.description
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ title: '', assignee: '', priority: 'medium', dueDate: new Date().toISOString().split('T')[0], description: '' });
  };

  const addComment = (taskId: string, text: string) => {
    if (!text.trim()) return;
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };
    setTasks(tasks.map(t => t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t));
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
  };

  const onDrop = (e: React.DragEvent, targetId: string) => {
    const draggedId = e.dataTransfer.getData('taskId');
    if (draggedId === targetId) return;

    const newTasks = [...tasks];
    const draggedIdx = newTasks.findIndex(t => t.id === draggedId);
    const targetIdx = newTasks.findIndex(t => t.id === targetId);
    
    const [draggedItem] = newTasks.splice(draggedIdx, 1);
    newTasks.splice(targetIdx, 0, draggedItem);
    
    setTasks(newTasks.map((t, i) => ({ ...t, order: i })));
  };

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const labelColor = theme === 'dark' ? 'text-slate-500' : 'text-gray-400';
  const inputBg = theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100';

  // Fix: Refactored TaskCard into renderTaskCard to avoid key prop typing issues in local sub-component definitions
  const renderTaskCard = (task: Task) => {
    const isExpanded = expandedId === task.id;
    const assignee = teamMembers.find(m => m.id === task.assignee);

    return (
      <div 
        key={task.id}
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, task.id)}
        className={`${cardBg} border rounded-[2rem] p-5 hover:border-red-500/30 transition-all group shadow-md flex flex-col gap-4 overflow-hidden`}
      >
        <div className="flex items-center gap-4">
          <GripVertical className="w-5 h-5 text-slate-700 cursor-move group-hover:text-red-500 transition-colors flex-shrink-0" />
          
          <button 
            onClick={() => {
              const now = new Date().toISOString();
              setTasks(tasks.map(t => t.id === task.id ? { 
                ...t, 
                status: t.status === 'completed' ? 'pending' : 'completed',
                completedDate: t.status === 'completed' ? undefined : now
              } : t));
            }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${task.status === 'completed' ? 'bg-green-500 text-white' : `${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'} text-slate-500 hover:bg-slate-800`}`}
          >
            {task.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
          </button>

          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : task.id)}>
             <h4 className={`text-base font-bold truncate ${task.status === 'completed' ? 'text-slate-500 line-through' : textColor}`}>{task.title}</h4>
             <div className="flex gap-3 mt-1 overflow-x-auto no-scrollbar">
                <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/20 px-2 py-0.5 rounded-full"><Calendar className="w-3 h-3" /> {task.dueDate}</span>
                <span className="flex items-center gap-1 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-800/20 px-2 py-0.5 rounded-full"><User className="w-3 h-3" /> {assignee?.name || 'Unassigned'}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest ${task.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' : task.priority === 'medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                  {task.priority}
                </span>
             </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
             <button onClick={() => openEdit(task)} className="p-2 text-slate-500 hover:text-blue-500"><Edit3 className="w-4 h-4" /></button>
             <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="p-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-2 pt-4 border-t border-slate-800/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
             {task.description && <p className="text-xs text-slate-400 italic leading-relaxed">{task.description}</p>}
             
             <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Mission Feedback ({task.comments?.length || 0})</p>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                   {(task.comments || []).map(comment => (
                     <div key={comment.id} className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-gray-50'} p-3 rounded-xl border border-slate-700/30`}>
                        <div className="flex justify-between items-start mb-1">
                           <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{comment.author}</span>
                           <span className="text-[8px] font-bold text-slate-600 uppercase">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{comment.text}</p>
                     </div>
                   ))}
                </div>
                
                <div className="flex gap-2">
                   <input 
                    placeholder="Add mission log or comment..." 
                    className={`flex-1 ${inputBg} border-none rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-red-500 ${textColor}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addComment(task.id, (e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                   />
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className={`text-3xl font-black ${textColor} uppercase tracking-tight`}>Mission Control</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Specialist Task Deployment</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-600 px-8 py-4 rounded-2xl font-black text-white shadow-xl shadow-red-900/40 transition-transform hover:scale-[1.02] active:scale-95 uppercase text-xs tracking-widest italic">
          <Plus className="w-5 h-5" /> Deploy New Mission
        </button>
      </div>

      <div className={`${cardBg} border rounded-3xl p-6 shadow-xl flex flex-wrap items-center gap-8`}>
         <div className={`flex p-1.5 gap-1.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-gray-100 border-gray-200 shadow-inner'}`}>
            {(['all', 'weekly', 'monthly'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${filter === f ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-500'}`}>
                {f} Cycle
              </button>
            ))}
         </div>

         <div className="flex items-center gap-4 flex-1">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Specialist</span>
               <select value={personFilter} onChange={(e) => setPersonFilter(e.target.value)} className={`bg-transparent text-xs font-bold uppercase outline-none border-b border-slate-800/40 py-1 ${textColor}`}>
                  <option value="all">Everyone</option>
                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
               </select>
            </div>
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Execution Date</span>
               <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={`bg-transparent text-xs font-bold uppercase outline-none border-b border-slate-800/40 py-1 ${textColor}`} />
            </div>
         </div>

         {(personFilter !== 'all' || dateFilter !== '' || filter !== 'all') && (
            <button onClick={() => {setPersonFilter('all'); setDateFilter(''); setFilter('all');}} className="text-[10px] font-black text-red-500 flex items-center gap-2 hover:underline uppercase">
              <FilterX className="w-4 h-4" /> Reset Filters
            </button>
         )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
         {/* Active Missions Section */}
         <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className={`text-xl font-black ${textColor} uppercase tracking-tighter italic flex items-center gap-3`}>
                  <TargetIcon className="w-6 h-6 text-red-600" />
                  Active Operations
               </h3>
               <span className="text-[10px] font-black bg-red-600/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">{activeTasks.length} MISSIONS</span>
            </div>
            <div className="space-y-4">
               {activeTasks.length === 0 ? (
                 <div className="py-20 text-center opacity-20 italic font-black uppercase text-xs">No active missions found</div>
               ) : activeTasks.map(task => renderTaskCard(task))}
            </div>
         </section>

         {/* Done / Archive Section */}
         <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className={`text-xl font-black ${textColor} uppercase tracking-tighter italic flex items-center gap-3`}>
                  <Archive className="w-6 h-6 text-green-500" />
                  Archive / Done
               </h3>
               <span className="text-[10px] font-black bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20">{completedTasks.length} COMPLETED</span>
            </div>
            <div className="space-y-4 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
               {completedTasks.length === 0 ? (
                 <div className="py-20 text-center opacity-20 italic font-black uppercase text-xs">Archive is empty</div>
               ) : completedTasks.map(task => renderTaskCard(task))}
            </div>
         </section>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in zoom-in-95 duration-200">
           <div className={`${cardBg} border-2 border-slate-800 rounded-[3.5rem] p-12 w-full max-w-lg shadow-2xl`}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className={`text-3xl font-black ${textColor} uppercase tracking-tight`}>{editId ? 'Recalibrate Mission' : 'Deploy Mission'}</h3>
                 <button onClick={closeModal}><X className="w-8 h-8 text-slate-500 hover:text-red-500" /></button>
              </div>
              <form onSubmit={saveTask} className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Codename / Title</label>
                   <input placeholder="Objective name..." className={`w-full ${inputBg} border-none rounded-2xl px-8 py-5 ${textColor} outline-none focus:ring-2 focus:ring-red-600 font-bold`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Specialist</label>
                       <select className={`w-full ${inputBg} border-none rounded-2xl px-8 py-5 ${textColor} outline-none font-bold`} value={formData.assignee} onChange={e => setFormData({...formData, assignee: e.target.value})} required>
                          <option value="">Select Staff...</option>
                          {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Priority Rank</label>
                       <select className={`w-full ${inputBg} border-none rounded-2xl px-8 py-5 ${textColor} outline-none font-bold`} value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})} required>
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Strategic</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Execution Date</label>
                    <input type="date" className={`w-full ${inputBg} border-none rounded-2xl px-8 py-5 ${textColor} outline-none font-bold`} value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Briefing Details</label>
                    <textarea placeholder="Mission objectives and context..." rows={3} className={`w-full ${inputBg} border-none rounded-2xl px-8 py-5 ${textColor} outline-none font-bold text-xs`} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>

                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={closeModal} className={`flex-1 py-5 bg-slate-800 text-slate-500 font-black rounded-3xl uppercase text-xs tracking-widest`}>Abort</button>
                    <button type="submit" className="flex-1 py-5 bg-red-600 text-white font-black rounded-3xl uppercase tracking-widest italic shadow-xl">Confirm Deployment</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default TasksView;
