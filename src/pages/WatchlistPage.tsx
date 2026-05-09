/** @license * SPDX-License-Identifier: Apache-2.0 */
import React, { useEffect, useState } from 'react';
import { useMovies } from '../context/MovieContext';
import SEO from '../components/Common/SEO';
import MovieCard from '../components/Home/MovieCard';
import { Heart } from 'lucide-react';
import { notificationService } from '../services/notificationService';

export default function WatchlistPage() {
  const { movies } = useMovies();
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy danh sách phim yêu thích từ localStorage
    const localItems = notificationService.getWatchlist();
    setWatchlistIds(localItems.map(item => item.id));
    setLoading(false);
  }, []);

  const watchlistMovies = movies.filter(m => watchlistIds.includes(m.id));

  return (
    <div className="min-h-screen bg-black pt-20 px-4">
      <SEO title="Danh sách của tôi - Phim BL Vietsub" />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
          <Heart className="text-pink-500 fill-pink-500" />
          Danh sách của tôi
        </h1>

        <p className="text-gray-400 mb-6">
          {watchlistMovies.length} bộ phim đã lưu
        </p>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : watchlistMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {watchlistMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Bạn chưa có phim yêu thích nào</p>
            <a href="/" className="text-pink-500 hover:underline">Khám phá ngay</a>
          </div>
        )}
      </div>
    </div>
  );
}
