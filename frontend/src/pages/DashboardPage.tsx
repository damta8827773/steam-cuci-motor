import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Bike, DollarSign, Users, Send, RefreshCw, BarChart2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { DailyStats, HourlyData, EmployeeStat, WeeklyData } from '@/types';

const MOTOR_COLORS = { kecil: '#3b82f6', sedang: '#f59e0b', besar: '#ef4444' };
const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function formatCurrencyShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return `${n}`;
}

const StatCard = ({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string;
}) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-100 mt-1.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-500/15`}>
        <Icon size={18} className={`text-${color}-400`} />
      </div>
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }: unknown) => {
  const p = payload as Array<{ value: number; name: string; color: string }>;
  if (active && p && p.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="text-slate-400 mb-1">{label as string}</p>
        {p.map((entry, i) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.name?.includes('Pendapatan') ? formatCurrency(entry.value) : `${entry.value} motor`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [hourly, setHourly] = useState<HourlyData[]>([]);
  const [empStats, setEmpStats] = useState<EmployeeStat[]>([]);
  const [weekly, setWeekly] = useState<WeeklyData[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsRes, hourlyRes, empRes, weeklyRes] = await Promise.all([
        api.get('/transactions/stats'),
        api.get('/transactions/hourly'),
        api.get('/transactions/employee-stats'),
        api.get('/transactions/weekly'),
      ]);
      setStats(statsRes.data.stats);
      setHourly(hourlyRes.data.hourly.filter((h: HourlyData) => h.count > 0));
      setEmpStats(empRes.data.stats);
      setWeekly(weeklyRes.data.weekly);
    } catch {
      toast.error('Gagal memuat data dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function sendReport() {
    setIsSending(true);
    try {
      const { data } = await api.post('/reports/send');
      toast.success(data.message);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gagal mengirim laporan';
      toast.error(msg);
    } finally {
      setIsSending(false);
    }
  }

  const pieData = stats ? [
    { name: 'Kecil', value: stats.kecil_count },
    { name: 'Sedang', value: stats.sedang_count },
    { name: 'Besar', value: stats.besar_count },
  ].filter(d => d.value > 0) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart2 size={24} className="text-blue-400" />
            Dashboard Pemilik
          </h1>
          <p className="text-slate-500 text-sm mt-1">Data real-time hari ini</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadAll}
            className="btn-secondary flex items-center gap-2 py-2 text-sm"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <motion.button
            onClick={sendReport}
            disabled={isSending}
            className="btn-primary flex items-center gap-2 py-2 text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={14} />
            )}
            <span className="hidden sm:inline">Kirim Laporan</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Bike}
          label="Total Motor Hari Ini"
          value={`${stats?.total_transactions || 0} unit`}
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Pendapatan Hari Ini"
          value={formatCurrencyShort(stats?.total_revenue || 0)}
          sub={formatCurrency(stats?.total_revenue || 0)}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Motor Terbanyak"
          value={
            stats
              ? stats.besar_count >= stats.sedang_count && stats.besar_count >= stats.kecil_count
                ? 'Besar'
                : stats.sedang_count >= stats.kecil_count
                  ? 'Sedang'
                  : 'Kecil'
              : '-'
          }
          color="violet"
        />
        <StatCard
          icon={Users}
          label="Karyawan Aktif"
          value={`${empStats.filter(e => e.total_washed > 0).length} orang`}
          sub="dari 7 karyawan"
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <BarChart2 size={14} />
            Transaksi per Jam — Hari Ini
          </h2>
          {hourly.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Belum ada transaksi hari ini
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Motor" fill="#3b82f6" radius={[4, 4, 0, 0]}
                  fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
            <Bike size={14} />
            Distribusi Tipe Motor
          </h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600 text-sm">
              Belum ada data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} fillOpacity={0.85} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
                />
                <Tooltip
                  formatter={(val) => [`${val} motor`, '']}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Calendar size={14} />
          Tren 7 Hari Terakhir
        </h2>
        {weekly.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-600 text-sm">Belum ada data</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weekly} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} />
              <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={formatCurrencyShort} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                formatter={(val, name) => [
                  name === 'Pendapatan' ? formatCurrency(val as number) : `${val} motor`,
                  name,
                ]}
              />
              <Area yAxisId="right" type="monotone" dataKey="total_revenue" name="Pendapatan"
                stroke="#6366f1" fill="url(#colorRev)" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="total_transactions" name="Motor"
                stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
          <Users size={14} />
          Performa Karyawan — Hari Ini
        </h2>
        <div className="space-y-3">
          {empStats.map((emp, i) => {
            const maxWashed = Math.max(...empStats.map(e => e.total_washed), 1);
            const pct = (emp.total_washed / maxWashed) * 100;
            return (
              <motion.div
                key={emp.employee_id}
                className="flex items-center gap-4 p-3 bg-slate-800/40 rounded-xl"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-200 text-sm font-medium truncate">{emp.employee_name}</span>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-slate-400 text-xs">{emp.total_washed} motor</span>
                      <span className="text-emerald-400 text-xs font-semibold">{formatCurrency(emp.total_revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.04 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
