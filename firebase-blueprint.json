/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SEO from '../components/Common/SEO';
import { useMovies } from '../context/MovieContext';
import { slugify } from '../lib/slugify';
import Hero from '../components/Home/Hero';
import MovieRow from '../components/Home/MovieRow';
import MovieCard from '../components/Home/MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { movies, loading, categories } = useMovies();
  const { type, slug, genre, country } = useParams();
  const { pathname } = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  // Reset page when path changes
  useEffect(() => {
    setCurrentPage(1);
  }, [pathname]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-dark">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter movies based on URL params
  let displayMovies = movies;
  let pageTitle = "Mới cập nhật";
  let isFiltered = false;

  if (pathname === '/phim-moi') {
    displayMovies = movies;
    pageTitle = "Phim mới cập nhật";
    isFiltered = true;
  } else if (type) {
    displayMovies = movies.filter(m => slugify(m.type) === type);
    const originalType = movies.find(m => slugify(m.type) === type)?.type || type;
    pageTitle = `Phân loại: ${originalType}`;
    isFiltered = true;
  } else if (slug) {
    displayMovies = movies.filter(m => slugify(m.category) === slug);
    const originalCategory = movies.find(m => slugify(m.category) === slug)?.category || slug;
    pageTitle = `Danh mục: ${originalCategory}`;
    isFiltered = true;
  } else if (genre) {
    displayMovies = movies.filter(m => m.genres.split(',').map(g => slugify(g.trim())).includes(genre));
    const originalGenre = movies.find(m => m.genres.split(',').map(g => slugify(g.trim())).includes(genre))
      ?.genres.split(',').find(g => slugify(g.trim()) === genre)?.trim() || genre;
    pageTitle = `Thể loại: ${originalGenre}`;
    isFiltered = true;
  } else if (country) {
    displayMovies = movies.filter(m => slugify(m.country) === country);
    const originalCountry = movies.find(m => slugify(m.country) === country)?.country || country;
    pageTitle = `Quốc gia: ${originalCountry}`;
    isFiltered = true;
  }

  return (
    <div className="bg-bg-dark min-h-screen">
      <SEO isHome={true} categoryName={isFiltered ? pageTitle : undefined} />
      {!isFiltered && <Hero />}
      
      <div className={`relative z-10 space-y-4 pb-20 ${!isFiltered ? '-mt-24 md:-mt-32' : 'pt-40 md:pt-44 lg:pt-36 px-4 md:px-12 xxl:px-20'}`}>
        {!isFiltered ? (
          <>
            <MovieRow 
              title="Mới cập nhật" 
              titleLink="/phim-moi"
              movies={movies.slice(0, 20)} 
            />
            
            {movies.filter(m => m.type === 'Phim bộ').length > 0 && (
              <MovieRow 
                key="phim-bo"
                title="Phim bộ" 
                titleLink="/type/phim-bo"
                movies={movies.filter(m => m.type === 'Phim bộ')} 
              />
            )}

            {movies.filter(m => m.type === 'Phim lẻ').length > 0 && (
              <MovieRow 
                key="phim-le"
                title="Phim lẻ" 
                titleLink="/type/phim-le"
                movies={movies.filter(m => m.type === 'Phim lẻ')} 
              />
            )}
            
            {categories.filter(c => c.toLowerCase() !== 'general').map((category) => {
              const catMovies = movies.filter(m => m.category === category);
              if (catMovies.length === 0) return null;
              return (
                <MovieRow 
                  key={category}
                  title={category} 
                  titleLink={`/category/${slugify(category)}`}
                  movies={catMovies} 
                />
              );
            })}
          </>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-black">{pageTitle}</h1>
                <div className="h-1.5 w-24 bg-brand-primary rounded-full shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
              </div>
              <p className="text-zinc-500 font-medium">
                Tìm thấy <span className="text-white">{displayMovies.length}</span> nội dung
              </p>
            </div>

            {displayMovies.length > 0 ? (
              <>
                {/* Responsive Grid - Fixed for Tablet and Desktop gaps */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
                  {displayMovies
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>

                {/* Pagination */}
                {displayMovies.length > itemsPerPage && (
                  <div className="flex justify-center items-center gap-2 pt-12">
                    <button
                      onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className="p-2 md:px-4 md:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <ChevronLeft size={20} />
                      <span className="hidden md:inline">Trang trước</span>
                    </button>

                    <div className="flex items-center gap-1 md:gap-2">
                      {Array.from({ length: Math.ceil(displayMovies.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                          const totalPages = Math.ceil(displayMovies.length / itemsPerPage);
                          if (totalPages <= 7) return true;
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          const totalPages = Math.ceil(displayMovies.length / itemsPerPage);
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;

                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <span className="text-zinc-600 px-1">...</span>}
                              <button
                                onClick={() => {
                                  setCurrentPage(page);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                                  currentPage === page
                                    ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      onClick={() => {
                        const totalPages = Math.ceil(displayMovies.length / itemsPerPage);
                        setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === Math.ceil(displayMovies.length / itemsPerPage)}
                      className="p-2 md:px-4 md:py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      <span className="hidden md:inline">Trang sau</span>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                  <span className="text-4xl text-zinc-700">?</span>
                </div>
                <p className="text-zinc-500 text-lg">Hệ thống đang cập nhật dữ liệu cho định dạng này...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
