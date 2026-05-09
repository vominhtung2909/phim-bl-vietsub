/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Movie } from '../types';
import { fetchMovies } from '../services/dataService';

interface MovieContextType {
  movies: Movie[];
  heroMovies: Movie[];
  loading: boolean;
  categories: string[];
  types: string[];
  genres: string[];
  countries: string[];
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: React.ReactNode }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  const refreshData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { listData, heroData } = await fetchMovies();
      
      setMovies(listData);
      setHeroMovies(heroData);
      
      const cats = Array.from(new Set(listData.map((m) => m.category))).filter(Boolean) as string[];
      setCategories(cats);

      const tps = Array.from(new Set(listData.map((m) => m.type))).filter(Boolean) as string[];
      setTypes(tps);

      const allGenres = listData.flatMap((m) => m.genres.split(',').map((g) => g.trim())).filter(Boolean) as string[];
      setGenres(Array.from(new Set(allGenres)).sort());

      const cnts = Array.from(new Set(listData.map((m) => m.country))).filter(Boolean).sort() as string[];
      setCountries(cnts);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    refreshData(true);

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 60000);

    // Refresh on window focus or visibility change
    const handleFocus = () => {
      refreshData();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  return (
    <MovieContext.Provider value={{ movies, heroMovies, loading, categories, types, genres, countries }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies() {
  const context = useContext(MovieContext);
  if (context === undefined) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
}
