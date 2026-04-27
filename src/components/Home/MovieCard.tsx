/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, ChevronDown } from 'lucide-react';
import { Movie } from '../../types';
import { motion } from 'motion/react';

interface MovieCardProps {
  movie: Movie;
  key?: React.Key;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  // Use pre-calculated statusLabel from dataService
  const statusBadge = movie.statusLabel;

  return (
    <div className="relative group w-full cursor-pointer">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="rounded-xl overflow-hidden aspect-[2/3] relative border border-zinc-800/50 group-hover:border-brand-primary transition-all duration-300 shadow-lg bg-zinc-900/50"
        onClick={() => navigate(`/phim/${movie.slug}`)}
      >
        {/* Placeholder / Shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-zinc-900 animate-pulse flex items-center justify-center">
             <div className="w-12 h-12 bg-white/5 rounded-full blur-xl" />
          </div>
        )}
        
        <img 
          src={movie.poster_url || undefined} 
          alt={movie.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-110`}
        />
        
        {/* Episode Status Badge (Neon Purple) */}
        {statusBadge && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <div className="bg-brand-primary/95 backdrop-blur-md text-white text-[10px] md:text-[10px] lg:text-[11px] font-semibold px-3 py-1 rounded-lg border border-white/20 shadow-[0_0_20px_rgba(160,32,240,0.6)] group-hover:shadow-[0_0_25px_rgba(160,32,240,0.8)] group-hover:scale-110 transition-all duration-300 uppercase tracking-widest">
              {statusBadge}
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-brand-primary/20 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(160,32,240,0.4)]">
            <Play className="fill-white text-white w-6 h-6 translate-x-0.5" />
          </div>
        </div>
      </motion.div>
      
      <div className="mt-2.5">
        <h3 className="text-sm md:text-sm lg:text-base font-bold movie-title group-hover:text-brand-primary transition-colors">
          {movie.title}
        </h3>
        {(movie.country || movie.type || movie.genres) && (
          <p className="text-[9px] md:text-[10px] lg:text-[11px] text-zinc-400 font-medium uppercase tracking-wider truncate mt-1 opacity-85">
            {[movie.country, movie.type, movie.genres].filter(Boolean).join(' | ')}
          </p>
        )}
      </div>
    </div>
  );
}
