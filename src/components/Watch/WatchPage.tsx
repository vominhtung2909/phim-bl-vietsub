/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../Common/SEO';
import { Heart, ChevronDown, SkipForward, PlayCircle, ChevronLeft, ChevronRight, SkipBack } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMovies } from '../../context/MovieContext';
import { slugify } from '../../lib/slugify';
import { notificationService } from '../../services/notificationService';
import VideoPlayer from './VideoPlayer';
import CommentSection from './CommentSection';
import { recordView } from '../../services/dataService';
import MovieCard from '../Home/MovieCard';

export default function WatchPage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const { movies, loading: moviesLoading } = useMovies();
  const navigate = useNavigate();
  
  const movie = movies.find(m => (id && m.id === id) || (slug && m.slug === slug));
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8 
        : scrollLeft + clientWidth * 0.8;
      
      scrollRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (movie && id && !slug) {
      navigate(`/phim/${movie.slug}`, { replace: true });
    }
  }, [movie, id, slug, navigate]);

  useEffect(() => {
    if (movie?.id) {
      recordView(movie.id);
    }
  }, [movie?.id]);

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentServer, setCurrentServer] = useState<1 | 2>(1);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (movie?.id) {
      setIsFavorite(notificationService.isInWatchlist(movie.id));
    }
  }, [movie?.id]);

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

  useEffect(() => {
    if (movie) {
      setCurrentEpisodeIndex(0);
      setIsDescOpen(false);
      
      const tgCount = movie.episodesTelegram.length;
      const okCount = movie.episodesOkru.length;
      
      if (tgCount === 0 && okCount > 0) setCurrentServer(2);
      else if (okCount === 0 && tgCount > 0) setCurrentServer(1);
      else if (okCount > tgCount) setCurrentServer(2);
      else setCurrentServer(1);
    }
  }, [id, !!movie]);

  const episodes = movie ? (currentServer === 1 ? movie.episodesTelegram : movie.episodesOkru) : [];
  const currentEpisode = episodes[currentEpisodeIndex] || episodes[0];

  useEffect(() => {
    if (episodes.length > 0 && currentEpisodeIndex >= episodes.length) {
      setCurrentEpisodeIndex(episodes.length - 1);
    }
  }, [currentServer, episodes.length]);

  const recommendations = React.useMemo(() => {
    return [...movies]
      .filter(m => m.id !== movie?.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
  }, [movies, movie?.id]);

  if (moviesLoading) return <div className="h-screen flex items-center justify-center text-zinc-500 font-medium">Bản đồ đang tải...</div>;
  if (!movie) return <div className="h-screen flex items-center justify-center text-xl font-bold">Phim không tồn tại</div>;

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      setCurrentEpisodeIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-purple-600/30 pt-20 pb-12">
      <SEO movie={movie} />
      
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* CỘT CHÍNH (Laptop) / CONTAINER TỔNG (Mobile) */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* 1. Player Container (Luôn ở trên cùng) */}
            <div className="order-1 relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] border border-white/5">
              {episodes.length > 0 ? (
                <VideoPlayer url={currentEpisode?.url || ''} />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-600">
                  <PlayCircle size={64} className="opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-xs">Phim chưa cập nhật tập này</p>
                </div>
              )}
            </div>

            {/* 2. UNIFIED: Quick Action Bar (Ngay dưới video) */}
            <div className="order-2 mt-4 md:mt-6 bg-zinc-900/40 border border-zinc-800/50 p-2.5 md:p-4 rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Status Text (Left-ish) */}
                <div className="flex items-center gap-2 text-zinc-100 font-bold text-[10px] md:text-[11px] uppercase tracking-widest min-w-0 flex-grow md:flex-grow-0">
                  <PlayCircle size={14} className="shrink-0 text-purple-500" />
                  <span className="truncate">Đang xem: {currentEpisode?.name || `Tập ${currentEpisodeIndex + 1}`}</span>
                </div>

                {/* Right: Action Buttons Group */}
                <div className="flex items-center gap-1.5 md:gap-3 w-full md:w-auto">
                  <button 
                    disabled={currentEpisodeIndex === 0}
                    onClick={handlePrevEpisode}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 px-2 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] bg-purple-600 text-white active:scale-95 shadow-lg uppercase tracking-widest transition-all ${
                      currentEpisodeIndex === 0
                        ? 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50 cursor-not-allowed opacity-50'
                        : 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-500'
                    }`}
                  >
                    <SkipBack size={12} className="shrink-0 md:w-3.5 md:h-3.5" />
                    <span className="whitespace-nowrap">Tập trước</span>
                  </button>

                  <button 
                    disabled={currentEpisodeIndex === episodes.length - 1}
                    onClick={handleNextEpisode}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 px-2 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] bg-purple-600 text-white active:scale-95 shadow-lg uppercase tracking-widest transition-all ${
                      currentEpisodeIndex === episodes.length - 1
                        ? 'bg-zinc-800/50 text-zinc-600 border border-zinc-700/50 cursor-not-allowed opacity-50'
                        : 'bg-purple-600 shadow-purple-600/20 hover:bg-purple-500'
                    }`}
                  >
                    <SkipForward size={12} className="shrink-0 md:w-3.5 md:h-3.5" />
                    <span className="whitespace-nowrap">Tập tiếp</span>
                  </button>

                  <button 
                    onClick={toggleFavorite}
                    className={`flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-2 px-2 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl transition-all active:scale-95 border uppercase tracking-widest text-[9px] md:text-[10px] font-black ${
                      isFavorite 
                        ? 'bg-purple-600/20 border-purple-600/40 text-purple-400' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <Heart size={14} className={`shrink-0 ${isFavorite ? 'fill-purple-600 text-purple-600' : ''}`} />
                    <span className="whitespace-nowrap">{isFavorite ? 'Đã yêu' : 'Yêu thích'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. MOBILE ONLY: Extra content (Playlist + Server) */}
            <div className="order-2 lg:hidden space-y-4 mt-6">
              {/* Horizontal Playlist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Chọn tập phim</h3>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase">{episodes.length} tập</span>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-2 snap-x custom-scrollbar-horizontal scroll-smooth">
                  {episodes.map((ep, idx) => {
                    const isActive = idx === currentEpisodeIndex;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentEpisodeIndex(idx);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex-shrink-0 w-24 snap-start group rounded-xl overflow-hidden border transition-all ${
                          isActive ? 'border-purple-600/50 bg-purple-600/10' : 'border-zinc-800 bg-zinc-900/50'
                        }`}
                      >
                        <div className="relative aspect-video bg-zinc-800">
                          <img src={movie.poster_url} className="w-full h-full object-cover opacity-30" />
                          <div className={`absolute inset-0 flex items-center justify-center ${isActive ? 'bg-purple-600/20' : ''}`}>
                            {isActive ? <PlayCircle size={18} className="text-white" /> : <span className="text-[9px] font-black text-white">{ep.name}</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Server Selection */}
              <div className="pt-2 border-t border-zinc-800/50">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentServer(1)}
                    className={`flex-1 py-2.5 rounded-lg font-black text-[9px] transition-all border uppercase tracking-widest ${
                      currentServer === 1 ? 'bg-purple-600 text-white border-purple-600' : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                    }`}
                  >
                    Server VIP
                  </button>
                  <button
                    onClick={() => setCurrentServer(2)}
                    className={`flex-1 py-2.5 rounded-lg font-black text-[9px] transition-all border uppercase tracking-widest ${
                      currentServer === 2 ? 'bg-purple-600 text-white border-purple-600' : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
                    }`}
                  >
                    Server Dự phòng
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Movie Info Section */}
            <div className="order-3 lg:order-2 space-y-6 mt-8 lg:mt-10">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-3">
                  <h1 className="text-xl md:text-2xl font-black text-white leading-tight uppercase tracking-tight not-italic font-sans">
                    {movie.title}
                  </h1>
                </div>
              </div>

              {/* Meta Tags - Interactive Links */}
              <div className="flex flex-wrap gap-2.5">
                {movie.country && movie.country.toLowerCase() !== 'general' && (
                  <Link 
                    to={`/country/${slugify(movie.country)}`}
                    className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-purple-500 hover:border-purple-600/30 hover:bg-purple-600/5 transition-all"
                  >
                    {movie.country}
                  </Link>
                )}
                {movie.category && movie.category.toLowerCase() !== 'general' && (
                  <Link 
                    to={`/category/${slugify(movie.category)}`}
                    className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-purple-500 hover:border-purple-600/30 hover:bg-purple-600/5 transition-all"
                  >
                    {movie.category}
                  </Link>
                )}
                {movie.type && movie.type.toLowerCase() !== 'general' && (
                  <Link 
                    to={`/type/${slugify(movie.type)}`}
                    className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-purple-500 hover:border-purple-600/30 hover:bg-purple-600/5 transition-all"
                  >
                    {movie.type}
                  </Link>
                )}
                {movie.genres?.split(',').map((g, i) => {
                  const genreName = g.trim();
                  if (!genreName || genreName.toLowerCase() === 'general') return null;
                  return (
                    <Link 
                      key={i}
                      to={`/genre/${slugify(genreName)}`}
                      className="px-4 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-purple-500 hover:border-purple-600/30 hover:bg-purple-600/5 transition-all"
                    >
                      {genreName}
                    </Link>
                  );
                })}
              </div>

              {/* Description Card */}
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <button 
                  onClick={() => setIsDescOpen(!isDescOpen)}
                  className="w-full flex items-center justify-between p-5 px-6 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-3.5 bg-purple-600 rounded-full" />
                    <span className="font-bold text-zinc-400 text-[10px] uppercase tracking-widest leading-none">Nội dung phim</span>
                  </div>
                  <ChevronDown className={`transition-transform duration-300 ${isDescOpen ? 'rotate-180 text-purple-600' : ''}`} size={18} />
                </button>
                <AnimatePresence>
                  {isDescOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-zinc-400 text-sm leading-relaxed whitespace-pre-line border-t border-zinc-800/30 pt-5">
                        {movie.description || 'Chưa có mô tả cho bộ phim này.'}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 6. MOBILE ONLY: Comments */}
            <div className="order-4 lg:hidden mt-8">
              <CommentSection movieId={movie.id} />
            </div>

            {/* 7. Recommendations Section */}
            <div className="order-5 lg:order-3 pt-4 border-t border-white/5 space-y-6 mt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-tight">SIÊU PHẨM KHÁC</h2>
                </div>
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => scroll('left')}
                    className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-white hover:text-white hover:bg-purple-600 hover:border-purple-500 transition-all active:scale-90"
                    aria-label="Trượt trái"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button 
                    onClick={() => scroll('right')}
                    className="p-2.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-white hover:text-white hover:bg-purple-600 hover:border-purple-500 transition-all active:scale-90"
                    aria-label="Trượt phải"
                  >
                    <ChevronRight size={22} />
                  </button>
                </div>
              </div>
              
              <div 
                ref={scrollRef}
                className="flex overflow-x-auto gap-4 pb-8 snap-x custom-scrollbar-horizontal scroll-smooth"
              >
                {recommendations.map(m => (
                  <div key={m.id} className="w-[160px] md:w-[220px] flex-shrink-0 snap-center">
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (Sidebar - Laptop ONLY) */}
          <div className="hidden lg:flex w-full lg:w-[350px] flex-col gap-6 order-2">
            {/* Playlist Container */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col shadow-xl lg:h-[560px]">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">DANH SÁCH TẬP</h3>
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-[10px] font-bold rounded-lg border border-purple-600/20">
                  {episodes.length} TẬP
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                <div className="space-y-1.5">
                  {episodes.length > 0 ? (
                    episodes.map((ep, idx) => {
                      const isActive = idx === currentEpisodeIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentEpisodeIndex(idx);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all group border ${
                            isActive 
                              ? 'bg-purple-600/10 border-purple-600/30' 
                              : 'border-transparent hover:bg-zinc-800/50'
                          }`}
                        >
                          <div className="relative w-20 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 group-hover:scale-95 transition-transform duration-300">
                            <img src={movie.poster_url} alt={ep.name} className="w-full h-full object-cover opacity-60" />
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center bg-purple-600/20 backdrop-blur-[1px]">
                                <PlayCircle size={20} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className={`text-[11px] font-bold truncate ${isActive ? 'text-purple-400' : 'text-zinc-400 group-hover:text-white'}`}>
                              {ep.name}
                            </p>
                            {isActive && <span className="text-[9px] font-black text-purple-600 uppercase tracking-tighter">Đang xem</span>}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-[10px] uppercase font-bold text-zinc-600 italic">
                      Danh sách trống
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Server Selection */}
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">CHỌN SERVER</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentServer(1)}
                  className={`py-3 rounded-full font-bold text-[10px] transition-all border ${
                    currentServer === 1 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20' 
                      : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800'
                  }`}
                >
                  SERVER VIP
                </button>
                <button
                  onClick={() => setCurrentServer(2)}
                  className={`py-3 rounded-full font-bold text-[10px] transition-all border ${
                    currentServer === 2 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20' 
                      : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50 hover:bg-zinc-800'
                  }`}
                >
                  SERVER DỰ PHÒNG
                </button>
              </div>
            </div>

            {/* Comment Section in Sidebar */}
            <div className="flex flex-col">
              <CommentSection movieId={movie.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
