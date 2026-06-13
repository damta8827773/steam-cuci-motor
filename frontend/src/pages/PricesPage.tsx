import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Price } from '@/types';

const MOTOR_INFO = {
  kecil:  { label: 'Motor Kecil',  icon: '🔵', desc: 'Matic / bebek kecil' },
  sedang: { label: 'Motor Sedang', icon: '🟡', desc: 'Bebek / sport 150cc' },
  besar:  { label: 'Motor Besar',  icon: '🔴', desc: 'Sport 200cc ke atas' },
} as const;

type MotorType = keyof typeof MOTOR_INFO;

function formatCurrency(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function PricesPage() {
  const [prices, setPrices] = useState<Record<MotorType, number>>({ kecil: 18000, sedang: 20000, besar: 25000 });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.get('/prices').then(({ data }) => {
      const map = {} as Record<MotorType, number>;
      data.prices.forEach((p: Price) => { map[p.type] = p.price; });
      setPrices(map);
    }).finally(() => setIsLoading(false));
  }, []);

  function handleChange(type: MotorType, raw: string) {
    const val = parseInt(raw.replace(/\D/g, ''), 10);
    if (!isNaN(val)) {
      setPrices(prev => ({ ...prev, [type]: val }));
      setDirty(true);
    }
  }

  async function handleSave() {
    if (Object.values(prices).some(p => p < 1000)) {
      toast.error('Harga minimal Rp 1.000');
      return;
    }

    setIsSaving(true);
    try {
      await api.put('/prices', prices);
      toast.success('Harga berhasil disimpan!');
      setDirty(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gagal menyimpan';
      toast.error(msg);
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
          <CreditCard size={24} className="text-blue-400" />
          Manajemen Harga
        </h1>
        <p className="text-slate-500 text-sm mt-1">Atur harga cuci untuk setiap tipe motor</p>
      </div>

      <div className="glass-card p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-slate-400 text-sm">
          Perubahan harga akan berlaku untuk transaksi baru. Transaksi yang sudah ada tidak terpengaruh.
        </p>
      </div>

      <div className="space-y-4">
        {(Object.entries(MOTOR_INFO) as [MotorType, typeof MOTOR_INFO[MotorType]][]).map(([type, info], i) => (
          <motion.div
            key={type}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{info.icon}</span>
              <div>
                <h3 className="text-slate-100 font-semibold">{info.label}</h3>
                <p className="text-slate-500 text-xs">{info.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 text-sm font-medium">Rp</span>
              <input
                type="text"
                value={prices[type].toLocaleString('id-ID')}
                onChange={(e) => handleChange(type, e.target.value)}
                className="input-field text-right font-semibold text-lg flex-1"
              />
            </div>

            <div className="mt-2 text-right">
              <span className="text-slate-500 text-xs">
                = {formatCurrency(prices[type])}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card p-5">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Preview Harga</h3>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(MOTOR_INFO) as [MotorType, typeof MOTOR_INFO[MotorType]][]).map(([type, info]) => (
            <div key={type} className="bg-slate-800/50 rounded-xl p-3 text-center">
              <p className="text-xl mb-1">{info.icon}</p>
              <p className="text-slate-400 text-xs">{info.label}</p>
              <p className="text-slate-100 font-bold text-sm mt-1">{formatCurrency(prices[type])}</p>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        onClick={handleSave}
        disabled={isSaving || !dirty}
        className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
        whileHover={{ scale: (isSaving || !dirty) ? 1 : 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isSaving ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save size={18} />
            {dirty ? 'Simpan Perubahan Harga' : 'Harga Sudah Tersimpan'}
          </>
        )}
      </motion.button>
    </div>
  );
}
