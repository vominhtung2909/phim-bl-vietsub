/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Loader2 } from 'lucide-react';
import { Movie } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
}

export default function SearchOverlay({ isOpen, onClose, movies }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genres.toLowerCase().includes(query.toLowerCase()) ||
        movie.country.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, movies]);

  const handleSelect = (movie: Movie) => {
    navigate(`/phim/${movie.slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 w-full z-[210] p-4 md:p-8 flex justify-center"
          >
            <div className="w-full max-w-3xl">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand-primary transition-colors" size={24} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm kiếm phim, thể loại, quốc gia..."
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl py-4 pl-14 pr-14 text-lg text-white focus:outline-none focus:border-brand-primary/50 focus:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && onClose()}
                />
                <button 
                  onClick={onClose}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Results Dropdown */}
              <AnimatePresence>
                {query.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl max-h-[60vh] overflow-y-auto custom-scrollbar"
                  >
                    {results.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {results.map((movie) => (
                          <button
                            key={movie.id}
                            onClick={() => handleSelect(movie)}
                            className="w-full flex items-center gap-4 p-2 hover:bg-zinc-800 rounded-xl transition-colors group text-left"
                          >
                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                              <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-sm truncate group-hover:text-brand-primary transition-colors">{movie.title}</h4>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                                {movie.country} • {movie.statusLabel}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-zinc-500 text-sm font-medium">Không tìm thấy kết quả cho "{query}"</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
