import { Link, useLocation } from 'react-router-dom';
import { FileText, User, BarChart3, Upload, TrendingUp, Sparkles, Files } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Upload', icon: Upload },
    { path: '/bulk-upload', label: 'Bulk Upload', icon: Files },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-50 gradient-hero">
      {/* Premium top line accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 py-4 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg group-hover:blur-xl transition-all" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 transition-transform group-hover:scale-105">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  <span className="text-white">FIN</span>
                  <span className="bg-gradient-to-r from-secondary to-white bg-clip-text text-transparent">TRUST</span>
                </h1>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                  <Sparkles className="h-3 w-3 text-secondary" />
                  <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">AI</span>
                </div>
              </div>
              <p className="text-[11px] text-white/50 font-medium tracking-widest uppercase mt-0.5">Intelligent Loan Approval</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'nav-link flex items-center gap-2.5 transition-all',
                  location.pathname === path
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline font-medium">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <button className="relative group">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur group-hover:blur-md transition-all" />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-white/20 hover:border-white/20">
              <User className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Premium bottom shadow */}
      <div className="h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
    </header>
  );
}