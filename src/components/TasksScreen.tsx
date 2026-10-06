import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, CheckSquare, Plus, Bell, Calendar, Clock, 
  AlertTriangle, CheckCircle2, X, Filter, ChevronRight, User
} from 'lucide-react';
import { ViewState, Task } from '../types';
import { getTasks, addTask, updateTaskStatus, deleteTask, generateSmartReminders } from '../services/tasks';
import { getCustomers } from '../services/storage';
import { useLanguage } from '../context/LanguageContext';

interface TasksScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function TasksScreen({ onNavigate }: TasksScreenProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>(() => getTasks());
  const [activeTab, setActiveTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'OVERDUE' | 'COMPLETED'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const customers = useMemo(() => getCustomers(), []);
  const smartReminders = useMemo(() => generateSmartReminders(), []);

  const todayStr = new Date().toISOString().split('T')[0];

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM');
  const [notes, setNotes] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeTab === 'ALL') return true;
      if (activeTab === 'COMPLETED') return task.status === 'COMPLETED';
      if (task.status === 'COMPLETED') return false;

      if (activeTab === 'TODAY') return task.dueDate === todayStr;
      if (activeTab === 'UPCOMING') return task.dueDate > todayStr;
      if (activeTab === 'OVERDUE') return task.dueDate < todayStr;
      return true;
    });
  }, [tasks, activeTab, todayStr]);

  const handleToggleStatus = (taskId: string, currentStatus: Task['status']) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    updateTaskStatus(taskId, nextStatus);
    setTasks(getTasks());
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const cust = customers.find(c => c.id === selectedCustomerId);

    addTask({
      title: newTaskTitle.trim(),
      customerId: cust?.id,
      customerName: cust?.name,
      owner: 'representative',
      dueDate,
      priority,
      status: 'PENDING',
      notes: notes.trim()
    });

    setTasks(getTasks());
    setIsAddModalOpen(false);
    setNewTaskTitle('');
    setNotes('');
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'URGENT': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MEDIUM': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('dashboard')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              {t("Tasks & Follow-up Matrix")}
            </h1>
            <p className="text-xs text-slate-400">{t("Commercial Reminders & Operator Action Items")}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t("New Task")}
        </button>
      </div>

      {/* Smart Reminders Telemetry Banner */}
      {smartReminders.length > 0 && (
        <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-4 space-y-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
              {t("Intelligent Business Reminders")} ({smartReminders.length})
            </span>
            <span className="text-[10px] font-mono text-slate-400">{t("Derived from Live Telemetry")}</span>
          </div>

          <div className="space-y-2">
            {smartReminders.map((rem) => (
              <div
                key={rem.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs group"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-white group-hover:text-indigo-300 flex items-center gap-1.5">
                    {rem.severity === 'WARNING' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {rem.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{rem.description}</p>
                </div>

                {rem.actionView && (
                  <button
                    onClick={() => onNavigate(rem.actionView!)}
                    className="px-2.5 py-1 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-lg whitespace-nowrap cursor-pointer transition-all self-center"
                  >
                    View
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-mono">
        {[
          { key: 'ALL', label: t('All Tasks') },
          { key: 'TODAY', label: t('Due Today') },
          { key: 'UPCOMING', label: t('Upcoming') },
          { key: 'OVERDUE', label: t('Overdue') },
          { key: 'COMPLETED', label: t('Completed') }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-8 text-center text-slate-500 font-mono text-xs">
            {t("No tasks found matching filter.")}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-slate-950/60 border rounded-2xl p-4 shadow-lg transition-all flex items-start justify-between gap-4 ${
                task.status === 'COMPLETED'
                  ? 'border-white/5 opacity-60'
                  : 'border-white/10 hover:border-indigo-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleStatus(task.id, task.status)}
                  className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-white/20 hover:border-emerald-400 bg-slate-900'
                  }`}
                >
                  {task.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <h4 className={`text-xs font-bold leading-snug ${
                    task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-white'
                  }`}>
                    {task.title}
                  </h4>

                  {task.customerName && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {task.customerName}
                    </p>
                  )}

                  {task.notes && (
                    <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" /> {task.owner}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority badge & Delete */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    setTasks(getTasks());
                  }}
                  className="text-slate-600 hover:text-rose-400 text-xs p-1 cursor-pointer transition-colors"
                  title={t("Delete Task")}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                {t("Assign New Field Task")}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Task Description")} *</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Collect overdue payment or check display shelf"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Related Customer")}</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  >
                    <option value="">-- General Task --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Due Date")}</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Priority Level")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 rounded-xl font-mono text-[10px] font-bold border cursor-pointer transition-all ${
                        priority === p
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                          : 'bg-slate-950 border-white/10 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Additional Notes")}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white font-bold rounded-xl cursor-pointer shadow-md"
                >
                  {t("Create Task")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
