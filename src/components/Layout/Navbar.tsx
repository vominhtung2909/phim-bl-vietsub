/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User, LogOut, Heart, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMovies } from '../../context/MovieContext';
import SearchOverlay from './SearchOverlay';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { user, profile, login, logout } = useAuth();
  const { movies, types, genres, countries } = useMovies();
  const location = useLocation();
  const navigate = useNavigate();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const Dropdown = ({ title, items, pathPrefix, isOpen, setIsOpen }: any) => (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className={`flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-2 ${isOpen ? 'text-white' : ''}`}>
        {title} <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 w-48 bg-zinc-900/98 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-3 z-[110] max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            {items.map((item: string) => (
              <Link
                key={item}
                to={`${pathPrefix}/${item}`}
                className="block px-4 py-2 text-sm text-zinc-400 hover:bg-brand-primary/10 hover:text-brand-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-300 flex items-center justify-between px-4 md:px-12 py-3 md:py-4 ${
          isScrolled ? 'bg-bg-dark/95 backdrop-blur-md shadow-lg border-b border-zinc-800/50' : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-3 md:gap-8">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-zinc-300 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
              <img src="https://i.postimg.cc/PrRmB148/z6859167247794-6d9c3bca7be3f1d827aeba837e8c845a.jpg" alt="Phim BL" className="w-full h-full object-cover" />
            </div>
            <span className="text-white text-xl md:text-2xl font-black tracking-tighter uppercase">
              Phim <span className="text-brand-primary">BL</span>
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link to="/" className={`hover:text-white transition-colors ${location.pathname === '/' ? 'text-white' : ''}`}>Trang chủ</Link>
            
            <Dropdown 
              title="Phân loại" 
              items={types} 
              pathPrefix="/type" 
              isOpen={showTypeMenu} 
              setIsOpen={setShowTypeMenu} 
            />
            
            <Dropdown 
              title="Thể loại" 
              items={genres} 
              pathPrefix="/genre" 
              isOpen={showGenreMenu} 
              setIsOpen={setShowGenreMenu} 
            />
            
            <Dropdown 
              title="Quốc gia" 
              items={countries} 
              pathPrefix="/country" 
              isOpen={showCountryMenu} 
              setIsOpen={setShowCountryMenu} 
            />

            <Link to="/watchlist" className={`hover:text-white transition-colors ${location.pathname === '/watchlist' ? 'text-white' : ''}`}>Danh sách của tôi</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-6">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-zinc-300 hover:text-white transition-colors"
          >
            <Search size={22} />
          </button>
          
          <NotificationCenter movies={movies} />
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 md:w-9 h-8 md:h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-primary transition-all flex items-center justify-center bg-zinc-800"
              >
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-zinc-400" />
                )}
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    ref={userMenuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden z-[120]"
                  >
                    <div className="px-4 py-3 border-b border-zinc-800 mb-2">
                      <p className="text-sm font-bold text-white truncate">{profile?.displayName}</p>
                      <p className="text-[10px] text-zinc-500 font-medium truncate uppercase tracking-widest">{profile?.email}</p>
                    </div>
                    <Link to="/watchlist" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                      <Heart size={16} className="text-brand-primary" /> Danh sách lưu
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-white transition-colors"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button 
              onClick={login}
              className="px-4 md:px-5 py-1.5 md:py-2 bg-brand-primary rounded-lg text-xs md:text-sm font-black hover:bg-brand-primary/80 transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
            >
              LOGIN
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-bg-dark border-r border-zinc-800 z-[160] md:hidden flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src="https://i.postimg.cc/PrRmB148/z6859167247794-6d9c3bca7be3f1d827aeba837e8c845a.jpg" alt="Phim BL" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-xl font-black tracking-tighter uppercase">
                    Phim <span className="text-brand-primary">BL</span>
                  </span>
                </Link>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setIsSidebarOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="p-2 text-zinc-300 hover:text-white transition-colors"
                  >
                    <Search size={22} />
                  </button>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="space-y-4">
                    <Link to="/" className="block text-lg font-bold hover:text-brand-primary transition-colors">Trang chủ</Link>
                    <Link to="/watchlist" className="block text-lg font-bold hover:text-brand-primary transition-colors">Danh sách của tôi</Link>
                  </div>
                </div>

                <SidebarSection title="Phân loại" items={types} prefix="/type" />
                <SidebarSection title="Thể loại" items={genres} prefix="/genre" />
                <SidebarSection title="Quốc gia" items={countries} prefix="/country" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        movies={movies} 
      />
    </>
  );
}

function SidebarSection({ title, items, prefix }: { title: string, items: string[], prefix: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-3 group"
      >
        {title} <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {items.map((item) => (
              <Link 
                key={item} 
                to={`${prefix}/${item}`}
                className="block pl-2 text-zinc-300 hover:text-brand-primary transition-colors text-sm font-medium"
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

