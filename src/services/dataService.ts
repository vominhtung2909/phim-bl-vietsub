/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { Movie } from '../types';
import { slugify } from '../lib/slugify';

const DEFAULT_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSGo-5Icf_04efclMe9DXReh3AXZo_eTzo8ksVpCIM6K4F3Eor1Yga8wfrDKpa4p7y4oE6f2RUMfggr/pub?output=csv';

interface FetchMoviesResponse {
  heroData: Movie[];
  listData: Movie[];
}

export async function fetchMovies(csvUrl: string = DEFAULT_CSV_URL): Promise<FetchMoviesResponse> {
  const fetchWithRetry = async (url: string, retries: number = 2): Promise<Response> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (e) {
      if (retries > 0) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithRetry(url, retries - 1);
      }
      throw e;
    }
  };

  try {
    // Force Refresh: use ?nocache=[timestamp] as requested
    const urlWithCacheBuster = `${csvUrl}${csvUrl.includes('?') ? '&' : '?'}_nocache=${Date.now()}`;
    const response = await fetchWithRetry(urlWithCacheBuster);
    const csvContent = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        trimHeaders: true,
        complete: (results) => {
          const rawMovies: Movie[] = results.data.map((row: any) => {
            let episodes: any[] = [];
            
            // Try different cases and Vietnamese names for columns
            const country = row.country || row.Country || row['Quốc gia'] || '';
            const type = row.type || row.Type || row['Phân loại'] || row['Loại'] || '';
            const category = row.category || row.Category || row['Danh mục'] || 'General';
            const genres = row.genres || row.Genres || row['Thể loại'] || '';
            const title = row.title || row.Title || row['Tiêu đề'] || 'Untitled';
            const description = row.description || row.Description || row['Mô tả'] || '';
            const poster_url = row.poster_url || row.Poster || row['Ảnh'] || 'https://via.placeholder.com/300x450?text=No+Poster';
            const episodesJson = row.episodes_json || row.Episodes || '[]';
            const episodesTelegramJson = row.episodes_telegram || '[]';
            const episodesOkruJson = row.episodes_okru || '[]';

            const parseEpisodes = (jsonStr: string) => {
              if (!jsonStr || jsonStr === '[]') return [];
              
              let cleanedJson = jsonStr.trim();
              
              // Feature: Auto-fix common JSON errors in spreadsheet data
              // 1. Fix missing "url": key for strings that look like URLs but don't have a key
              // Matches {"https://..." or , "https://..." where no : follows
              cleanedJson = cleanedJson.replace(/([{,]\s*)"(https?:\/\/[^"]+)"(?!\s*:)/g, '$1"url": "$2"');
              
              // 2. Fix trailing commas in arrays/objects
              cleanedJson = cleanedJson.replace(/,(\s*[\]}])/g, '$1');
              
              try {
                const rawEpisodes = JSON.parse(cleanedJson);
                if (Array.isArray(rawEpisodes)) {
                  return rawEpisodes.map((ep: any, index: number) => {
                    const fallbackName = `Tập ${index + 1}`;
                    const nameKey = Object.keys(ep).find(key => key !== 'url');
                    const rawName = ep.title || ep.name || (nameKey ? ep[nameKey] : fallbackName);
                    return {
                      name: String(rawName || fallbackName),
                      url: ep.url || ''
                    };
                  });
                }
              } catch (e) {
                console.error('Error parsing episodes json:', e, 'Raw string:', jsonStr);
              }
              return [];
            };

            const episodesTelegram = parseEpisodes(episodesTelegramJson);
            const episodesOkru = parseEpisodes(episodesOkruJson);
            const episodesGeneral = parseEpisodes(episodesJson);

            const getStatusBadge = (tg: any[], ok: any[], gen: any[]) => {
              const hasEnd = (list: any[]) => list.length > 0 && list[list.length - 1]?.name?.toUpperCase().includes('END');
              if (hasEnd(tg) || hasEnd(ok) || hasEnd(gen)) {
                return 'END';
              }
              const maxLen = Math.max(tg.length, ok.length, gen.length);
              return maxLen > 0 ? `Tập ${maxLen}` : '';
            };

            const statusLabel = getStatusBadge(episodesTelegram, episodesOkru, episodesGeneral);
            const viewsRaw = row.views || row.Views || row['Lượt xem'] || '0';
            const views = Number(String(viewsRaw).replace(/,/g, '')) || 0;
            
            return {
              id: String(row.id || Math.random().toString(36).substr(2, 9)),
              title,
              poster_url,
              description,
              category,
              type,
              country,
              genres,
              actors: row.actors || row.Actors || row['Diễn viên'] || '',
              tags: row.tags || row.Tags || '',
              slug: slugify(title),
              episodes: episodesGeneral,
              episodesTelegram: episodesTelegram,
              episodesOkru: episodesOkru,
              statusLabel: statusLabel,
              raw_episodes_json: episodesJson,
              updated_at: row.updated_at || row.Updated_at || row['Updated At'] || row['Ngày cập nhật'] || '',
              views
            };
          });

          // Accurate Date Parser for DD/MM/YYYY HH:mm:ss or standard formats
          const parseSheetDate = (dateStr: string): number => {
            if (!dateStr) return 0;
            
            // Try DD/MM/YYYY HH:mm:ss or DD/MM/YYYY pattern
            const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(.*)$/);
            if (match) {
              const [, d, m, y, rest] = match;
              // Normalize to YYYY-MM-DD for reliable Date constructor across browsers
              const day = d.padStart(2, '0');
              const month = m.padStart(2, '0');
              const restPart = rest ? rest.trim().replace(/\//g, '-') : '';
              const formattedDate = `${y}-${month}-${day}${restPart ? ' ' + restPart : ''}`;
              const ts = new Date(formattedDate).getTime();
              if (!isNaN(ts)) return ts;
            }

            const ts = new Date(dateStr).getTime();
            return isNaN(ts) ? 0 : ts;
          };

          // Universal Sorted List: Everything sorted by updated_at descending
          const sortedAll = [...rawMovies].sort((a, b) => {
            const tA = parseSheetDate(a.updated_at);
            const tB = parseSheetDate(b.updated_at);
            if (tB !== tA) return tB - tA;
            // Tie-breaker: Larger ID (more recent entry) first
            return (Number(b.id) || 0) - (Number(a.id) || 0);
          });

          // 1. Hero Data: Sorted by views (Strictly Column K)
          const heroData = [...rawMovies].sort((a, b) => {
            const vA = Number(a.views) || 0;
            const vB = Number(b.views) || 0;
            if (vB !== vA) return vB - vA;
            // Tie-breaker: Latest update
            const tA = parseSheetDate(a.updated_at);
            const tB = parseSheetDate(b.updated_at);
            return tB - tA;
          });

          // 2. List Data: Return the universal sorted list
          const listData = sortedAll;

          // Accurate Debugging Output for User
          console.log("Hero ID 1 (Top Views Expectation):", heroData[0]?.id === '1' ? 'MATCH' : 'FAIL', "ID:", heroData[0]?.id, "Views:", heroData[0]?.views);
          console.log("Thứ tự ID dãy Mới cập nhật (ListData):", listData.slice(0, 10).map(m => m.id));

          // Return separated streams
          resolve({ heroData: heroData.slice(0, 10), listData });
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return { heroData: [], listData: [] };
  }
}

export async function recordView(movieId: string): Promise<void> {
  if (!movieId) return;
  
  const lastViewKey = `last_view_${movieId}`;
  const lastViewTime = localStorage.getItem(lastViewKey);
  const now = Date.now();
  
  // Throttle: 1 view per hour (3,600,000 ms)
  if (lastViewTime && now - parseInt(lastViewTime) < 3600000) {
    return;
  }

  try {
    const macroUrl = `https://script.google.com/macros/s/AKfycbymX20eumWX5q3v8lFR4hkYUE93xc8oB9AnEtRETmzUPRO8rLE9Bj7cV3XS5-ylmArx/exec?id=${movieId}`;
    // no-cors is safer for GAS macros to avoid CORS issues if the macro redirects
    await fetch(macroUrl, { mode: 'no-cors' });
    localStorage.setItem(lastViewKey, now.toString());
  } catch (error) {
    console.error('Error recording view:', error);
  }
}
