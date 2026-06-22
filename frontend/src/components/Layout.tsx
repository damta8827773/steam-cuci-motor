import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <motion.main
        className="flex-1 container mx-auto px-4 py-8 max-w-7xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <Outlet />
      </motion.main>

      <footer className="border-t border-slate-800/50 py-4">
        <div className="container mx-auto px-4 max-w-7xl text-center text-slate-600 text-xs">
          Steam Cuci Motor - Sistem Kasir &copy; {new Date().getFullYear()}
        </div>
      </footer>

      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
