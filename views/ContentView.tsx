
import React, { useState } from 'react';
import { Film, Plus, Link as LinkIcon, Edit2, Check, X, MessageSquare, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ContentItem, Comment } from '../types';

interface ContentViewProps {
  content: ContentItem[];
  setContent: React.Dispatch<React.SetStateAction<ContentItem[]>>;
  theme: 'dark' | 'light';
}

const ContentView: React.FC<ContentViewProps> = ({ content, setContent, theme }) => {
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', type: 'video' as any });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<{itemId: string, commentId: string, text: string} | null>(null);

  const addComment = (itemId: string, text: string, link?: string) => {
    const comment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      link,
      timestamp: new Date().toISOString(),
      author: 'Admin'
    };
    setContent(content.map(c => c.id === itemId ? { ...c, comments: [...c.comments, comment] } : c));
  };

  const updateComment = () => {
    if(!editingComment) return;
    setContent(content.map(c => c.id === editingComment.itemId ? {
      ...c,
      comments: c.comments.map(com => com.id === editingComment.commentId ? { ...com, text: editingComment.text } : com)
    } : c));
    setEditingComment(null);
  };

  const deleteComment = (itemId: string, commentId: string) => {
    setContent(content.map(c => c.id === itemId ? {
      ...c,
      comments: c.comments.filter(com => com.id !== commentId)
    } : c));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title) return;
    const item: ContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newItem.title,
      type: newItem.type,
      status: 'creation',
      comments: [],
      createdAt: new Date().toISOString()
    };
    setContent([...content, item]);
    setShowModal(false);
    setNewItem({ title: '', type: 'video' });
  };

  const isOverdue = (createdAt: string, status: string) => {
    if (status === 'ads') return false;
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 3;
  };

  const stages = [
    { id: 'creation', label: 'CREATION', icon: '📝' },
    { id: 'editing', label: 'EDITING', icon: '✂️' },
    { id: 'ready', label: 'READY', icon: '✅' },
    { id: 'ads', label: 'ADS', icon: '📢' },
  ];

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <style>{`
        @keyframes pulsate {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        .animate-pulsate {
          animation: pulsate 2s infinite ease-in-out;
        }
      `}</style>
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-3xl font-black ${textColor} italic uppercase`}>CONTENT FACTORY</h2>
          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Project Life-Cycle Hub</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-orange-600 px-6 py-3 rounded-2xl font-black text-white shadow-lg shadow-orange-900/30 hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> NEW PRODUCTION
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stages.map(stage => (
          <div key={stage.id} className="space-y-4">
             <div className={`${cardBg} flex items-center justify-between px-5 py-3 border-l-4 border-l-orange-500 rounded-r-2xl shadow-md`}>
               <span className={`text-[10px] font-black ${textColor} italic uppercase tracking-widest`}>{stage.icon} {stage.label}</span>
               <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-slate-500 bg-slate-800' : 'text-gray-500 bg-gray-100'} px-2.5 py-0.5 rounded-full`}>{content.filter(c => c.status === stage.id).length}</span>
             </div>
             
             <div className="space-y-4">
                {content.filter(c => c.status === stage.id).map(item => {
                  const overdue = isOverdue(item.createdAt, item.status);
                  const isExpanded = expandedId === item.id;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`${cardBg} border p-5 rounded-3xl shadow-lg relative group transition-all duration-300 ${overdue ? 'border-red-500/50' : ''}`}
                    >
                      {overdue && (
                        <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg animate-pulsate z-10 uppercase tracking-tighter">
                          STALLED
                        </div>
                      )}
                      
                      <div 
                        className="cursor-pointer" 
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-full">{item.type}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </div>
                        <h4 className={`text-sm font-black ${textColor} italic truncate uppercase tracking-tighter`}>{item.title}</h4>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-800/10 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                             {item.comments.map(comment => (
                               <div key={comment.id} className={`${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'} p-3 rounded-xl border group/comment shadow-sm`}>
                                  {editingComment?.commentId === comment.id ? (
                                     <div className="flex gap-2">
                                        <input 
                                          className={`flex-1 ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'} text-xs px-3 py-1.5 rounded-lg outline-none border border-slate-700`}
                                          value={editingComment.text}
                                          onChange={e => setEditingComment({...editingComment, text: e.target.value})}
                                        />
                                        <button onClick={updateComment} className="text-green-500 hover:scale-110 transition-transform"><Check className="w-5 h-5" /></button>
                                        <button onClick={() => setEditingComment(null)} className="text-red-500 hover:scale-110 transition-transform"><X className="w-5 h-5" /></button>
                                     </div>
                                  ) : (
                                     <div>
                                        <div className="flex justify-between items-start">
                                           <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'} italic break-words w-full pr-4 leading-relaxed`}>{comment.text}</p>
                                           <div className="flex gap-1.5 opacity-0 group-hover/comment:opacity-100 transition-all">
                                              <button onClick={() => setEditingComment({itemId: item.id, commentId: comment.id, text: comment.text})} className="text-slate-500 hover:text-orange-500 transition-colors"><Edit2 className="w-3 h-3" /></button>
                                              <button onClick={() => deleteComment(item.id, comment.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                           </div>
                                        </div>
                                        {comment.link && (
                                          <a href={comment.link} target="_blank" className="flex items-center gap-1.5 text-[9px] text-blue-500 font-black uppercase mt-2.5 hover:underline tracking-widest">
                                            <LinkIcon className="w-3 h-3" /> External Tracking Vector
                                          </a>
                                        )}
                                     </div>
                                  )}
                               </div>
                             ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <input 
                              placeholder="Insert link or feedback..."
                              className={`flex-1 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} text-[10px] font-bold px-4 py-2 rounded-xl outline-none border border-slate-800/10 focus:ring-1 focus:ring-orange-500`}
                              onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                  const val = (e.target as HTMLInputElement).value;
                                  if(val) {
                                    addComment(item.id, val, val.startsWith('http') ? val : undefined);
                                    (e.target as HTMLInputElement).value = '';
                                  }
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-1">
                             <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Status Map</label>
                             <select 
                               className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} text-[10px] font-black ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} border-none outline-none appearance-none px-3 py-2 rounded-xl cursor-pointer`}
                               value={item.status}
                               onChange={(e) => setContent(content.map(c => c.id === item.id ? { ...c, status: e.target.value as any } : c))}
                             >
                               {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                             </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
           <div className={`${cardBg} border rounded-[3rem] p-12 w-full max-w-md shadow-2xl`}>
              <h3 className={`text-2xl font-black ${textColor} italic mb-8 uppercase tracking-tighter`}>Initialize Content Production</h3>
              <form onSubmit={addItem} className="space-y-6">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                   <input 
                    placeholder="Enter production name..." 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 ${textColor} outline-none focus:ring-2 focus:ring-orange-600 font-bold`}
                    value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})}
                    required
                   />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Media Format</label>
                   <select 
                    className={`w-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-100'} border-none rounded-2xl px-6 py-4 ${textColor} outline-none font-bold`}
                    value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value as any})}
                   >
                     <option value="video">🎥 4K CINEMATIC VIDEO</option>
                     <option value="image">🖼️ STATIC VISUAL ASSET</option>
                     <option value="article">📝 EDITORIAL COPY</option>
                   </select>
                 </div>
                 <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-4 ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'} ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'} font-black rounded-2xl uppercase tracking-tighter`}>Abort</button>
                    <button type="submit" className="flex-1 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-900/40 uppercase tracking-tighter">Commence</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ContentView;
