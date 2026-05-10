/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie } from '../../types';
import MovieCard from './MovieCard';

interface MovieRowProps {
  title: string;
  titleLink?: string;
  movies: Movie[];
  key?: React.Key;
}

export default function MovieRow({ title, titleLink, movies }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  const TitleWrapper = ({ children }: { children: React.ReactNode }) => {
    if (titleLink) {
      return (
        <Link 
          to={titleLink} 
          className="flex items-center gap-2 group/title w-fit"
        >
          {children}
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 group-hover/title:bg-brand-primary group-hover/title:text-white transition-all transform group-hover/title:translate-x-1">
            <ArrowRight size={14} />
          </div>
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <div className="space-y-4 px-4 md:px-12 py-4 group/row">
      <TitleWrapper>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-zinc-100 hover:text-brand-primary transition-colors cursor-pointer">
          {title}
        </h2>
      </TitleWrapper>
      
      <div className="relative">
        <button 
          onClick={() => scroll('left')}
          className="absolute -left-4 md:-left-12 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 lg:group-hover/row:opacity-100 transition-opacity hidden lg:flex items-center justify-center hover:bg-black/80"
        >
          <ChevronLeft size={40} />
        </button>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide no-scrollbar pb-4"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-shrink-0 w-[160px] sm:w-[190px] md:w-[230px] lg:w-[240px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          className="absolute -right-4 md:-right-12 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 lg:group-hover/row:opacity-100 transition-opacity hidden lg:flex items-center justify-center hover:bg-black/80"
        >
          <ChevronRight size={40} />
        </button>
      </div>
    </div>
  );
}
