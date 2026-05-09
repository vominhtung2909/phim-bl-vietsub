/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movie } from '../types';

const WATCHLIST_STORAGE_KEY = 'phimbl_watchlist_data';

interface WatchlistItem {
  id: string;
  title: string;
  slug: string;
  lastEpisodeCount: number;
  statusLabel: string;
  image: string;
  updatedAt: number;
}

export const notificationService = {
  getWatchlist(): WatchlistItem[] {
    const data = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  toggleWatchlist(movie: Movie) {
    const items = this.getWatchlist();
    const index = items.findIndex(item => item.id === movie.id);
    
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push({
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        lastEpisodeCount: movie.episodes.length,
        statusLabel: movie.statusLabel || '',
        image: movie.poster_url,
        updatedAt: Date.now()
      });
    }
    
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    return this.getWatchlist();
  },

  isInWatchlist(movieId: string): boolean {
    const items = this.getWatchlist();
    return items.some(item => item.id === movieId);
  },

  updateLastSeen(movie: Movie) {
    const items = this.getWatchlist();
    const index = items.findIndex(item => item.id === movie.id);
    if (index > -1) {
      items[index].lastEpisodeCount = movie.episodes.length;
      items[index].statusLabel = movie.statusLabel;
      items[index].updatedAt = Date.now();
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    }
  },

  checkUpdates(allMovies: Movie[]): WatchlistItem[] {
    const watchlist = this.getWatchlist();
    const updates: WatchlistItem[] = [];

        watchlist.forEach(item => {
      const currentMovie = allMovies.find(m => m.id === item.id);
      if (currentMovie) {
        // Simple comparison
        const hasMoreEpisodes = currentMovie.episodes.length > item.lastEpisodeCount;
        const isNowEnd = (currentMovie.statusLabel || '').toUpperCase() === 'END' && (item.statusLabel || '').toUpperCase() !== 'END';
        
        if (hasMoreEpisodes || isNowEnd) {
          updates.push({
            ...item,
            slug: currentMovie.slug,
            statusLabel: currentMovie.statusLabel || ''
          });
        }
      }
    });

    return updates;
  }
};
