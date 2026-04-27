/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, Info, Coffee, ChevronRight, ChevronLeft, X, QrCode, CreditCard } from 'lucide-react';
import { Movie } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useMovies } from '../../context/MovieContext';

export default function Hero() {
  const { heroMovies, loading } = useMovies();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<Record<number, boolean>>({});

  // Hero Data is already precision-sorted by views (Top 5) in service
  
  // Total items: 1 Donate + heroMovies.length
  const totalItems = 1 + heroMovies.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalItems);
    }, 10000);
    return () => clearInterval(timer);
  }, [totalItems]);

  if (loading || heroMovies.length === 0) return <div className="h-[90vh] bg-zinc-950 animate-pulse" />;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  const isDonate = currentIndex === 0;
  const currentMovie = isDonate ? null : heroMovies[currentIndex - 1];

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group/hero">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x;
            if (swipe < -80) {
              handleNext();
            } else if (swipe > 80) {
              handlePrev();
            }
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Background Poster */}
          <div className="absolute inset-0 bg-zinc-950">
            {/* Shimmer for Hero */}
            {!imageLoaded[currentIndex] && (
               <div className="absolute inset-0 bg-zinc-900/50 animate-pulse flex items-center justify-center">
                 <div className="w-32 h-32 bg-brand-primary/5 rounded-full blur-[100px]" />
               </div>
            )}
            
            <img 
              src={isDonate ? "https://i.postimg.cc/PrRmB148/z6859167247794-6d9c3bca7be3f1d827aeba837e8c845a.jpg" : (currentMovie?.poster_url || undefined)} 
              alt={isDonate ? "Donate" : currentMovie?.title}
              loading={currentIndex === 0 ? "eager" : "lazy"}
              onLoad={() => setImageLoaded(prev => ({ ...prev, [currentIndex]: true }))}
              className={`w-full h-full object-cover brightness-[0.35] transition-opacity duration-1000 ${imageLoaded[currentIndex] ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
            {isDonate && <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />}
            <div className="absolute inset-0 hero-bottom" />
          </div>

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end px-4 md:px-12 pb-24 md:pb-32 w-full">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-[90%] md:max-w-[50%] space-y-4"
            >
              {isDonate ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded text-[10px] font-bold tracking-widest uppercase border border-brand-primary/30">
                      Ủng hộ phát triển
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase leading-tight text-white drop-shadow-lg">
                    Buy me a Coffee ☕
                  </h1>
                  <p className="text-zinc-200 text-sm md:text-base font-normal leading-relaxed drop-shadow-md">
                    Trang web này là tâm huyết để mang lại trải nghiệm xem phim sạch cho cộng đồng. 
                    Để duy trì Phim BL mà không có quảng cáo rác, mình rất trân trọng mọi sự ủng hộ mời cafe từ bạn. 
                    Cảm ơn bạn vì đã đồng hành!
                  </p>
                  <div className="pt-4">
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="btn-accent flex items-center gap-2"
                    >
                      <Coffee size={20} /> Ủng hộ tụi mình
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {currentMovie && (currentMovie.country || currentMovie.type || currentMovie.genres) && (
                      <span className="px-2 py-0.5 bg-brand-primary text-white rounded text-[10px] font-bold tracking-widest uppercase border border-brand-primary/30 shadow-[0_0_15px_rgba(160,32,240,0.5)] max-w-full truncate inline-block">
                        {[currentMovie.country, currentMovie.type, currentMovie.genres].filter(Boolean).join(' | ')}
                      </span>
                    )}
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                      #Top {currentIndex} xu hướng ({Number(currentMovie?.views || 0).toLocaleString()} lượt xem)
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-bold tracking-tighter uppercase leading-tight text-white drop-shadow-xl">
                    {currentMovie?.title}
                  </h1>
                  
                  <p className="text-zinc-200 text-sm md:text-base line-clamp-3 font-normal leading-relaxed drop-shadow-lg text-pretty">
                    {currentMovie?.description}
                  </p>

                  <div className="flex items-center pt-4">
                    <button 
                      onClick={() => navigate(`/phim/${currentMovie?.slug}`)}
                      className="flex items-center gap-3 px-10 py-4 bg-brand-primary text-white font-semibold rounded-2xl hover:shadow-[0_0_25px_rgba(160,32,240,0.6)] hover:scale-105 transition-all active:scale-95 uppercase tracking-widest text-sm"
                    >
                      <Play className="fill-white" size={22} />
                      Xem ngay
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm opacity-0 lg:group-hover/hero:opacity-100 transition-all duration-300 md:left-8 hidden lg:flex"
      >
        <ChevronLeft size={32} strokeWidth={1.5} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white/50 hover:text-white backdrop-blur-sm opacity-0 lg:group-hover/hero:opacity-100 transition-all duration-300 md:right-8 hidden lg:flex"
      >
        <ChevronRight size={32} strokeWidth={1.5} />
      </button>

      {/* Donation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#050505] rounded-3xl p-8 border-2 border-brand-primary shadow-[0_0_40px_-5px_rgba(168,85,247,0.4)]"
              >
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition-colors text-white"
                >
                  <X size={20} />
                </button>
  
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto ring-2 ring-brand-primary/20">
                    <Coffee size={32} className="text-brand-primary" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">Gửi tặng yêu thương cho Phim BL</h3>
                    <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-widest mt-1">Cảm ơn sự đóng góp của bạn!</p>
                  </div>
  
                  <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Ngân hàng</span>
                        <span className="text-xs font-bold text-white">Vietcombank</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Số tài khoản</span>
                        <span className="text-sm font-mono font-bold text-brand-primary">1041159336</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Chủ tài khoản</span>
                        <span className="text-xs font-bold text-white uppercase">VO MINH TUNG</span>
                      </div>
                    </div>
  
                    <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-xl">
                      <img 
                        src="https://img.vietqr.io/image/VCB-1041159336-compact2.jpg?accountName=VO MINH TUNG&addInfo=Ung%20ho%20Phim%20BL" 
                        alt="VietQR Donate"
                        className="w-[180px] h-auto rounded-lg"
                      />
                      <p className="text-black text-[9px] font-black mt-2 underline decoration-brand-primary decoration-2 underline-offset-4 uppercase">Quét mã để ủng hộ</p>
                    </div>
                  </div>
  
                  <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic">
                    * Mọi đóng góp đều được tự dộng ghi nhận và công khai tại trang Lời cảm ơn.
                  </p>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
