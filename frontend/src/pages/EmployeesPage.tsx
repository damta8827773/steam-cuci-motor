import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Pencil, Check, X, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Employee } from '@/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/employees')
      .then(({ data }) => setEmployees(data.employees))
      .finally(() => setIsLoading(false));
  }, []);

  function startEdit(emp: Employee) {
    setEditingId(emp.id);
    setEditValue(emp.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditValue('');
  }

  async function saveEdit(id: number) {
    if (!editValue.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await api.put(`/employees/${id}`, { name: editValue.trim() });
      setEmployees(prev => prev.map(e => e.id === id ? data.employee : e));
      setEditingId(null);
      toast.success('Nama karyawan diperbarui!');
    } catch {
      toast.error('Gagal menyimpan nama');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Users size={24} className="text-blue-400" />
          Manajemen Karyawan
        </h1>
        <p className="text-slate-500 text-sm mt-1">Kelola nama 7 karyawan cuci motor</p>
      </div>

      <div className="glass-card p-4 flex items-center gap-3">
        <UserCheck size={16} className="text-emerald-400 flex-shrink-0" />
        <p className="text-slate-400 text-sm">
          Klik ikon pensil untuk mengubah nama karyawan. Nama tampil di halaman kasir.
        </p>
      </div>

      <div className="space-y-3">
        {employees.map((emp, i) => (
          <motion.div
            key={emp.id}
            className="glass-card p-4 flex items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center">
              <span className="text-blue-300 font-bold text-sm">{emp.slot}</span>
            </div>

            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                {editingId === emp.id ? (
                  <motion.input
                    key="edit"
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(emp.id);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="input-field py-2 text-sm"
                    autoFocus
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-slate-100 font-medium">{emp.name}</p>
                    <p className="text-slate-600 text-xs">Karyawan slot {emp.slot}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {editingId === emp.id ? (
                <>
                  <motion.button
                    onClick={() => saveEdit(emp.id)}
                    disabled={isSaving}
                    className="w-8 h-8 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg flex items-center justify-center text-emerald-400 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSaving ? (
                      <div className="w-3 h-3 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={cancelEdit}
                    className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 transition-colors"
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={14} />
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => startEdit(emp)}
                  className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Pencil size={14} />
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Ringkasan</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-slate-100">{employees.length}</p>
            <p className="text-slate-500 text-xs mt-0.5">Total Slot</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-emerald-400">
              {employees.filter(e => !e.name.startsWith('Karyawan ')).length}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Sudah Diisi</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3">
            <p className="text-2xl font-bold text-amber-400">
              {employees.filter(e => e.name.startsWith('Karyawan ')).length}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">Default</p>
          </div>
        </div>
      </div>
    </div>
  );
}
