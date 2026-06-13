import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, CheckCircle2, Clock, User, RefreshCw, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Employee, Price, Transaction } from '@/types';

const MOTOR_CONFIG = {
  kecil:  { label: 'Motor Kecil',  icon: '🔵', color: 'blue',  desc: 'Matic / bebek kecil' },
  sedang: { label: 'Motor Sedang', icon: '🟡', color: 'amber', desc: 'Bebek / sport 150cc' },
  besar:  { label: 'Motor Besar',  icon: '🔴', color: 'rose',  desc: 'Sport 200cc ke atas' },
} as const;

type MotorType = keyof typeof MOTOR_CONFIG;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function CashierPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [prices, setPrices] = useState<Record<MotorType, number>>({ kecil: 18000, sedang: 20000, besar: 25000 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedMotor, setSelectedMotor] = useState<MotorType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [totalToday, setTotalToday] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [empRes, priceRes, txRes] = await Promise.all([
        api.get('/employees'),
        api.get('/prices'),
        api.get('/transactions'),
      ]);
      setEmployees(empRes.data.employees);
      const priceMap = {} as Record<MotorType, number>;
      priceRes.data.prices.forEach((p: Price) => { priceMap[p.type] = p.price; });
      setPrices(priceMap);
      setTransactions(txRes.data.transactions);
      setTotalToday(txRes.data.transactions.length);
    } catch {
      toast.error('Gagal memuat data');
    }
  }

  async function handleSubmit() {
    if (!selectedEmployee || !selectedMotor) {
      toast.error('Pilih karyawan dan tipe motor terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/transactions', {
        employee_id: selectedEmployee,
        motor_type: selectedMotor,
      });
      setTransactions(prev => [data.transaction, ...prev]);
      setTotalToday(prev => prev + 1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setSelectedEmployee(null);
      setSelectedMotor(null);
      toast.success(`Transaksi berhasil! ${MOTOR_CONFIG[selectedMotor].label}`);
    } catch {
      toast.error('Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bike size={24} className="text-blue-400" />
            Kasir Steam Motor
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-slate-300 text-sm font-medium">{totalToday} motor hari ini</span>
          </div>
          <button onClick={loadData} className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={14} />
              Pilih Karyawan
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {employees.map((emp) => (
                <motion.button
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp.id)}
                  className={`
                    p-3 rounded-xl border text-sm font-medium text-left transition-all
                    ${selectedEmployee === emp.id
                      ? 'bg-blue-600/25 border-blue-500/60 text-blue-200 shadow-lg shadow-blue-900/20'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedEmployee === emp.id ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {emp.slot}
                    </div>
                    <span className="truncate">{emp.name}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bike size={14} />
              Pilih Tipe Motor
            </h2>
            <div className="space-y-3">
              {(Object.entries(MOTOR_CONFIG) as [MotorType, typeof MOTOR_CONFIG[MotorType]][]).map(([type, cfg]) => (
                <motion.button
                  key={type}
                  onClick={() => setSelectedMotor(type)}
                  className={`
                    w-full p-4 rounded-xl border text-left transition-all
                    ${selectedMotor === type
                      ? type === 'kecil'
                        ? 'bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-900/20'
                        : type === 'sedang'
                          ? 'bg-amber-600/20 border-amber-500/50 shadow-lg shadow-amber-900/20'
                          : 'bg-rose-600/20 border-rose-500/50 shadow-lg shadow-rose-900/20'
                      : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/70 hover:border-slate-600'
                    }
                  `}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cfg.icon}</span>
                      <div>
                        <p className={`font-semibold text-sm ${
                          selectedMotor === type
                            ? type === 'kecil' ? 'text-blue-200'
                              : type === 'sedang' ? 'text-amber-200'
                              : 'text-rose-200'
                            : 'text-slate-200'
                        }`}>{cfg.label}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{cfg.desc}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-base ${
                      selectedMotor === type
                        ? type === 'kecil' ? 'text-blue-300'
                          : type === 'sedang' ? 'text-amber-300'
                          : 'text-rose-300'
                        : 'text-slate-300'
                    }`}>
                      {formatCurrency(prices[type])}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                className="glass-card p-4 border-emerald-500/40 bg-emerald-500/10 flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
              >
                <CheckCircle2 size={20} className="text-emerald-400" />
                <p className="text-emerald-300 font-medium text-sm">Transaksi berhasil dicatat!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={!selectedEmployee || !selectedMotor || isSubmitting}
            className="btn-primary w-full text-base py-4 flex items-center justify-center gap-2"
            whileHover={{ scale: (!selectedEmployee || !selectedMotor || isSubmitting) ? 1 : 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                {selectedEmployee && selectedMotor
                  ? `Proses — ${formatCurrency(prices[selectedMotor])}`
                  : 'Proses Pembayaran'
                }
              </>
            )}
          </motion.button>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} />
              Riwayat Hari Ini
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-lg">
              {transactions.length} transaksi
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-600">
              <Bike size={40} className="mb-3 opacity-30" />
              <p className="text-sm">Belum ada transaksi hari ini</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {transactions.map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-slate-700/60 transition-colors"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i === 0 ? 0 : 0, duration: 0.2 }}
                  >
                    <span className="text-lg flex-shrink-0">{MOTOR_CONFIG[tx.motor_type].icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate">{tx.employee_name}</p>
                      <p className="text-slate-500 text-xs">{MOTOR_CONFIG[tx.motor_type].label}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-slate-300 text-sm font-semibold">{formatCurrency(tx.price)}</p>
                      <p className="text-slate-600 text-xs">{formatTime(tx.created_at)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
