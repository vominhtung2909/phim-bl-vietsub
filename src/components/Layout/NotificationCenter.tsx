/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Film, X, Info } from 'lucide-react';
import { Movie } from '../../types';
import { notificationService } from '../../services/notificationService';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
  movies: Movie[];
}

export default function NotificationCenter({ movies }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const checkUpdates = () => {
      const foundUpdates = notificationService.checkUpdates(movies);
      setUpdates(foundUpdates);
    };

    if (movies.length > 0) {
      checkUpdates();
    }
  }, [movies]);

  const handleUpdateClick = (movieId: string) => {
    const movie = movies.find(m => m.id === movieId);
    if (movie) {
      notificationService.updateLastSeen(movie);
      // Refresh updates
      setUpdates(notificationService.checkUpdates(movies));
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-zinc-300 hover:text-white transition-colors"
      >
        <Bell size={22} />
        {updates.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-bg-dark shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[110]" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-4 z-[120] overflow-hidden"
            >
              <div className="px-5 pb-3 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-brand-primary" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Thông báo mới</h3>
                </div>
                {updates.length > 0 && (
                  <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {updates.length} CẬP NHẬT
                  </span>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {updates.length > 0 ? (
                  <div className="divide-y divide-zinc-800/50">
                    {updates.map((update) => (
                      <Link
                        key={update.id}
                        to={`/phim/${update.slug}`}
                        onClick={() => handleUpdateClick(update.id)}
                        className="flex items-start gap-4 px-5 py-4 hover:bg-zinc-800/50 transition-colors group"
                      >
                        <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          <img 
                            src={update.image} 
                            alt={update.title} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-zinc-100 font-bold group-hover:text-brand-primary transition-colors line-clamp-1">
                            {update.title}
                          </p>
                          <p className="text-xs text-zinc-400 font-medium">
                            Phim vừa có tập mới! Trạng thái: <span className="text-brand-primary font-bold">{update.statusLabel}</span>
                          </p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest pt-1">
                            {new Date(update.updatedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-6 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 border border-zinc-800/50">
                      <Bell size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold">Chưa có thông báo nào</p>
                      <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                        Hãy lưu phim vào danh sách để nhận thông báo khi có tập mới nhé!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pt-3 border-t border-zinc-800 bg-zinc-900/50">
                <Link 
                  to="/watchlist" 
                  onClick={() => setIsOpen(false)}
                  className="w-full block py-2 text-center text-xs text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest bg-zinc-800/30 rounded-lg"
                >
                  Xem danh sách lưu của bạn
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
