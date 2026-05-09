/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useMovies } from '../context/MovieContext';
import SEO from '../components/Common/SEO';
import MovieCard from '../components/Home/MovieCard';
import { Heart } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function WatchlistPage() {
  const { movies } = useMovies();
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For all users, use localStorage
    const localItems = notificationService.getWatchlist();
    setWatchlistIds(localItems.map(item => item.id));
    setLoading(false);
  }, []);

  const watchlistMovies = movies.filter(m => watchlistIds.includes(m.id));

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 pb-20">
      <SEO title="Danh sách của tôi" description="Danh sách phim yêu thích của bạn tại Phim BL Vietsub." />
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-brand-primary/10 rounded-2xl">
          <Heart size={32} className="text-brand-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Danh sách của tôi</h1>
          <p className="text-zinc-500 text-sm">{watchlistMovies.length} bộ phim đã lưu</p>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="aspect-[2/3] bg-zinc-900 rounded-xl" />)}
        </div>
      ) : watchlistMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {watchlistMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 flex flex-col items-center justify-center gap-6">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600">
            <Heart size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-zinc-300">Bạn chưa có phim yêu thích nào</p>
            <p className="text-zinc-500 max-w-xs mx-auto">Hãy khám phá các siêu phẩm đam mỹ và nhấn nút yêu thích để lưu lại nhé!</p>
          </div>
          <a 
            href="/" 
            className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/80 transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
          >
            Khám phá ngay
          </a>
        </div>
      )}
    </div>
  );
}
