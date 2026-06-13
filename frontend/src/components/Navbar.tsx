import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, LayoutDashboard, CreditCard, Users, LogOut, LogIn, Gauge } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const ownerLinks = [
  { to: '/', label: 'Kasir', icon: Gauge },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/prices', label: 'Harga', icon: CreditCard },
  { to: '/employees', label: 'Karyawan', icon: Users },
];

const publicLinks = [
  { to: '/', label: 'Kasir', icon: Gauge },
];

export default function Navbar() {
  const { isOwner, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const links = isOwner ? ownerLinks : publicLinks;

  function handleLogout() {
    logout();
    toast.success('Berhasil keluar');
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30"
              whileHover={{ scale: 1.05, rotate: -5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Droplets size={18} className="text-white" />
            </motion.div>
            <div className="hidden sm:block">
              <span className="font-bold text-slate-100 text-sm leading-none">Steam</span>
              <span className="block text-slate-500 text-[10px] leading-none mt-0.5">Cuci Motor</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link key={to} to={to}>
                  <motion.div
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon size={15} />
                    <span className="hidden sm:inline">{label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isOwner ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-400 text-xs truncate max-w-[140px]">{user?.email}</span>
                </div>
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogOut size={15} />
                  <span className="hidden sm:inline">Keluar</span>
                </motion.button>
              </div>
            ) : (
              <Link to="/login">
                <motion.div
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg text-sm transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <LogIn size={15} />
                  <span className="hidden sm:inline">Login Pemilik</span>
                </motion.div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
