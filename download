/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../Common/SEO';
import { Heart, ChevronDown, ChevronLeft, ChevronRight, Clock, User, Tag, Plus, Check, SkipForward, Send, PlayCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovies } from '../../context/MovieContext';
import { slugify } from '../../lib/slugify';
import { notificationService } from '../../services/notificationService';
import VideoPlayer from './VideoPlayer';
import CommentSection from './CommentSection';
import { recordView } from '../../services/dataService';
import MovieRow from '../Home/MovieRow';

export default function WatchPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const { movies, loading: moviesLoading } = useMovies();
  const navigate = useNavigate();
  
  const movie = movies.find(m => (id && m.id === id) || (slug && m.slug === slug));

  // Redirect to slug-based URL if accessed via ID
  useEffect(() => {
    if (movie && id && !slug) {
      navigate(`/phim/${movie.slug}`, { replace: true });
    }
  }, [movie, id, slug, navigate]);

  // Record view logic
  useEffect(() => {
    if (movie?.id) {
      recordView(movie.id);
    }
  }, [movie?.id]);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentServer, setCurrentServer] = useState<1 | 2>(1);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Initial favorite check
  useEffect(() => {
    if (movie?.id) {
      setIsFavorite(notificationService.isInWatchlist(movie.id));
    }
  }, [movie?.id]);

  // Update last seen when viewing a movie in watchlist
  useEffect(() => {
    if (movie && notificationService.isInWatchlist(movie.id)) {
      notificationService.updateLastSeen(movie);
    }
  }, [movie?.id, movie?.episodes.length]);

  const toggleFavorite = () => {
    if (!movie) return;
    notificationService.toggleWatchlist(movie);
    setIsFavorite(!isFavorite);
  };

  // Choose server with more episodes by default
  useEffect(() => {
    if (movie) {
      setCurrentEpisodeIndex(0);
      setIsDescOpen(false);
      
      if (movie.episodesTelegram.length === 0 && movie.episodesOkru.length > 0) {
        setCurrentServer(2);
      } else if (movie.episodesOkru.length === 0 && movie.episodesTelegram.length > 0) {
        setCurrentServer(1);
      } else if (movie.episodesOkru.length > movie.episodesTelegram.length) {
        setCurrentServer(2);
      } else {
        setCurrentServer(1);
      }
    }
  }, [id, !!movie]);

  const episodes = movie ? (currentServer === 1 
    ? movie.episodesTelegram 
    : movie.episodesOkru) : [];
    
  const currentEpisode = episodes[currentEpisodeIndex] || episodes[0];

  // Synchronize episode index when server or episodes change
  useEffect(() => {
    if (episodes.length > 0 && currentEpisodeIndex >= episodes.length) {
      setCurrentEpisodeIndex(episodes.length - 1);
    }
  }, [currentServer, episodes.length]);

  const playNextEpisode = () => {
    if (episodes.length > 0 && currentEpisodeIndex < episodes.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const playPrevEpisode = () => {
    if (episodes.length > 0 && currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Recommendations logic
  const recommendations = React.useMemo(() => {
    return [...movies]
      .filter(m => m.id !== movie?.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
  }, [movies, movie?.id]);

  if (moviesLoading) return <div className="h-screen flex items-center justify-center text-zinc-500 font-medium">Bản đồ đang tải...</div>;
  if (!movie) return <div className="h-screen flex items-center justify-center text-xl font-bold">Phim không tồn tại</div>;

  const hasEpisodes = movie.episodesTelegram.length > 0 || movie.episodesOkru.length > 0 || movie.episodes.length > 0;

  if (!hasEpisodes) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-xl font-bold">Phim hiện chưa có tập nào</h2>
        <button onClick={() => navigate(-1)} className="btn-secondary">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      {movie && <SEO movie={movie} />}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-brand-primary text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-brand-primary/20 backdrop-blur-md"
          >
            Đang chuyển sang tập tiếp theo...
          </motion.div>
        )}
      </AnimatePresence>
 
      <div className="px-4 md:px-12 max-w-[1200px] mx-auto space-y-4">
        
        {/* Tầng 1: Trình phát video (16:9) */}
        <div key={`${currentServer}-${currentEpisodeIndex}`} className="w-full">
          {episodes.length > 0 ? (
            <VideoPlayer url={currentEpisode?.url || ''} />
          ) : (
            <div className="relative w-full aspect-video bg-zinc-950 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-4 border border-zinc-800 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800">
                <SkipForward size={32} />
              </div>
              <p className="text-zinc-400 font-medium tracking-wide">Server này hiện chưa có tập phim</p>
            </div>
          )}
        </div>

        {/* Tầng 2: Hàng điều hướng tập phim */}
        <div className="flex flex-col gap-4 bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-zinc-800/50 shadow-xl">
          <div className="flex items-start justify-between gap-3 w-full">
            <button
              onClick={playPrevEpisode}
              disabled={currentEpisodeIndex === 0 || episodes.length === 0}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border shadow-lg ${
                (currentEpisodeIndex === 0 || episodes.length === 0)
                  ? 'bg-zinc-800/30 text-zinc-600 border-zinc-700/30 cursor-not-allowed' 
                  : 'bg-zinc-900 text-white border-brand-primary/50 hover:bg-brand-primary/10 hover:border-brand-primary hover:shadow-[0_0_15px_rgba(160,32,240,0.3)] active:scale-95'
              }`}
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Tập trước</span>
            </button>
            
            <div className="flex flex-wrap items-center justify-center gap-2 flex-1">
              {episodes.length > 0 ? (
                episodes.map((episode, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentEpisodeIndex(index);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`min-w-[42px] h-10 flex items-center justify-center rounded-xl font-semibold text-sm transition-all border ${
                      index === currentEpisodeIndex 
                        ? 'bg-brand-primary text-white border-brand-primary shadow-[0_0_15px_rgba(160,32,240,0.4)]' 
                        : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:border-brand-primary/50 hover:text-brand-primary hover:bg-brand-primary/5'
                    }`}
                    title={episode?.name || ''}
                  >
                    {(episode?.name || '').replace(/\D/g, '') || index + 1}
                  </button>
                ))
              ) : (
                <div className="text-zinc-600 text-xs font-medium uppercase tracking-widest py-2">Không có tập phim</div>
              )}
            </div>

            <button
              onClick={playNextEpisode}
              disabled={episodes.length === 0 || currentEpisodeIndex === episodes.length - 1}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border shadow-lg ${
                (episodes.length === 0 || currentEpisodeIndex === episodes.length - 1)
                  ? 'bg-zinc-800/30 text-zinc-600 border-zinc-700/30 cursor-not-allowed' 
                  : 'bg-zinc-900 text-white border-brand-primary/50 hover:bg-brand-primary/10 hover:border-brand-primary hover:shadow-[0_0_15px_rgba(160,32,240,0.3)] active:scale-95'
              }`}
            >
              <span className="hidden sm:inline">Tập tiếp theo</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Tầng 3: Hàng quản lý Server */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 sm:p-5 rounded-2xl border border-zinc-800/50 shadow-xl">
          <div className="flex items-center gap-2 bg-zinc-950/50 p-1.5 rounded-xl border border-zinc-800/30 w-full sm:w-auto">
            <button
              onClick={() => setCurrentServer(1)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                currentServer === 1 
                  ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(160,32,240,0.5)] border border-white/20' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <PlayCircle size={14} className={currentServer === 1 ? 'animate-pulse' : ''} />
              <span>SERVER 1</span>
            </button>
            <button
              onClick={() => setCurrentServer(2)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
                currentServer === 2 
                  ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(160,32,240,0.5)] border border-white/20' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <PlayCircle size={14} className={currentServer === 2 ? 'animate-pulse' : ''} />
              <span>SERVER 2</span>
            </button>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 bg-zinc-950/50 px-4 py-2.5 rounded-xl border border-zinc-800/30">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Tự động chuyển tập</span>
            <button
              onClick={() => setAutoNext(!autoNext)}
              className={`relative w-9 h-5 rounded-full transition-all duration-300 ${autoNext ? 'bg-brand-primary shadow-[0_0_15px_rgba(160,32,240,0.4)]' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoNext ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-2">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
                  {movie.title} {currentEpisode?.name ? `- ${currentEpisode.name}` : ''}
                </h1>
                <div className="group relative">
                  <HelpCircle size={18} className="text-zinc-600 hover:text-zinc-400 cursor-help transition-colors" />
                  <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl text-[11px] text-zinc-400 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <p className="font-bold text-zinc-200 mb-1">Mẹo điều khiển:</p>
                    Bạn có thể sử dụng phím mũi tên <span className="text-brand-primary">⬅️ ➡️</span> trên bàn phím hoặc nhấp đúp vào hai bên video để tua phim nhanh hơn. Phím <span className="text-brand-primary">Space</span> để tạm dừng/phát.
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
                {(movie.country || movie.type || movie.genres) && (
                  <div className="flex items-center gap-1.5 py-1 text-zinc-500 font-normal text-[11px] md:text-xs max-w-full overflow-hidden opacity-80 uppercase tracking-wider">
                    <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
                      {movie.country && (
                        <Link 
                          to={`/country/${slugify(movie.country)}`}
                          className="hover:text-brand-primary transition-all cursor-pointer"
                        >
                          {movie.country}
                        </Link>
                      )}
                      {movie.country && (movie.type || movie.genres) && <span className="opacity-30">|</span>}
                      {movie.type && (
                        <Link 
                          to={`/type/${slugify(movie.type)}`}
                          className="hover:text-brand-primary transition-all cursor-pointer"
                        >
                          {movie.type}
                        </Link>
                      )}
                      {(movie.country || movie.type) && movie.genres && <span className="opacity-30">|</span>}
                      {movie.genres && (
                        <span className="flex items-center gap-1 truncate">
                          {movie.genres.split(',').map((genre, idx, arr) => {
                            const gName = genre.trim();
                            if (!gName) return null;
                            return (
                              <React.Fragment key={idx}>
                                <Link 
                                  to={`/genre/${slugify(gName)}`}
                                  className="hover:text-brand-primary transition-all cursor-pointer"
                                >
                                  {gName}
                                </Link>
                                {idx < arr.length - 1 && <span className="text-zinc-500">,</span>}
                              </React.Fragment>
                            );
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${
                  isFavorite 
                    ? 'bg-zinc-800 text-white border border-zinc-700' 
                    : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                <Heart 
                  size={18} 
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-current'} 
                />
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
            </div>
          </div>

          {/* 2. Mô tả phim */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setIsDescOpen(!isDescOpen)}
              className="w-full text-left p-6 flex items-center justify-between hover:bg-zinc-800/50 transition-colors"
            >
              <span className="font-bold">Mô tả phim</span>
              <motion.div
                animate={{ rotate: isDescOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {isDescOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-6 pb-6 space-y-4">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                      {movie.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* 4. Bình luận */}
        <div className="pt-8 border-t border-zinc-900">
          <CommentSection movieId={movie.id} />
        </div>
      </div>

      {/* 5. Gợi ý cho bạn - Outside container for full-width horizontal scroll */}
      <div className="mt-12 pt-12 border-t border-zinc-900">
        <MovieRow title="Gợi ý cho bạn" movies={recommendations} />
      </div>
    </div>
  );
}
