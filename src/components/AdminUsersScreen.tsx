import React, { useState } from 'react';
import { 
  ArrowLeft, Shield, Users, UserPlus, Key, MapPin, 
  CheckCircle2, X, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { ViewState, UserAccount, UserRole } from '../types';
import { getUserAccounts, addUserAccount, updateUserRole, toggleUserStatus } from '../services/admin';
import { ENTERPRISE_TERRITORIES } from '../services/config';
import { useLanguage } from '../context/LanguageContext';

interface AdminUsersScreenProps {
  onNavigate: (view: ViewState) => void;
}

export default function AdminUsersScreen({ onNavigate }: AdminUsersScreenProps) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserAccount[]>(() => getUserAccounts());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [message, setMessage] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('salesperson');
  const [newTerritory, setNewTerritory] = useState('Riyadh North');

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUserRole(userId, role);
    setUsers(getUserAccounts());
    setMessage(t("User role updated successfully."));
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStatusToggle = (userId: string) => {
    toggleUserStatus(userId);
    setUsers(getUserAccounts());
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) return;

    addUserAccount({
      username: newUsername.trim().toLowerCase(),
      fullName: newFullName.trim(),
      role: newRole,
      territory: newTerritory,
      status: 'ACTIVE'
    });

    setUsers(getUserAccounts());
    setIsAddModalOpen(false);
    setNewUsername('');
    setNewFullName('');
    setMessage(t("New operator account created."));
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6 pb-24 text-left font-sans relative z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 bg-slate-900 border border-white/10 hover:border-indigo-500/40 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              {t("User Management & RBAC Governance")}
            </h1>
            <p className="text-xs text-slate-400">{t("Operator Access Control, Role Assignments & Territories")}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold font-mono uppercase tracking-wide rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          {t("Add Operator")}
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-950/60 border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            {t("Authorized Operator Accounts")}
          </h3>
          <span className="text-[10px] font-mono text-slate-400">{users.length} accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-white/10">
            <thead className="bg-slate-900/60 font-mono text-[10px] uppercase text-slate-400">
              <tr>
                <th className="p-3.5">{t("Operator")}</th>
                <th className="p-3.5">{t("Role Assignment")}</th>
                <th className="p-3.5">{t("Assigned Territory")}</th>
                <th className="p-3.5">{t("Status")}</th>
                <th className="p-3.5 text-right">{t("Manage")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5">
                    <strong className="text-white block">{u.fullName}</strong>
                    <span className="text-[10px] font-mono text-slate-500">{u.username} • {u.id}</span>
                  </td>
                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-indigo-300 cursor-pointer"
                    >
                      <option value="salesperson">Sales Representative</option>
                      <option value="manager">Sales Manager</option>
                      <option value="warehouse">Warehouse Lead</option>
                      <option value="finance">Finance Controller</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{u.territory}</td>
                  <td className="p-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleStatusToggle(u.id)}
                      className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-white/10 hover:border-white/30 text-slate-300 cursor-pointer transition-colors"
                    >
                      {u.status === 'ACTIVE' ? t('Deactivate') : t('Activate')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Operator Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/15 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                {t("Provision New Operator Account")}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Full Name")} *</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Username / Operator Key")} *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Role")}</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  >
                    <option value="salesperson">Salesperson</option>
                    <option value="manager">Manager</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="finance">Finance</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("Territory")}</label>
                  <select
                    value={newTerritory}
                    onChange={(e) => setNewTerritory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-indigo-500"
                  >
                    {ENTERPRISE_TERRITORIES.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
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
                  {t("Provision Account")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
