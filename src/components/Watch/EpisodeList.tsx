/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { Episode } from '../../types';

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeIndex: number;
  onSelect: (index: number) => void;
}

export default function EpisodeList({ episodes, currentEpisodeIndex, onSelect }: EpisodeListProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Danh sách tập 
          <span className="text-xs font-normal text-zinc-500">({episodes.length} tập)</span>
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {episodes.map((episode, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
              index === currentEpisodeIndex 
                ? 'bg-brand-primary/10 border border-brand-primary/30 text-brand-primary' 
                : 'hover:bg-zinc-800 text-zinc-300 border border-transparent'
            }`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
              index === currentEpisodeIndex ? 'bg-brand-primary text-white' : 'bg-zinc-800'
            }`}>
              {index === currentEpisodeIndex ? <Play size={14} fill="currentColor" /> : index + 1}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold truncate">{episode.name}</p>
              <p className="text-[10px] opacity-60 uppercase font-bold tracking-tight">Sẵn sàng</p>
            </div>
            {index === currentEpisodeIndex && <CheckCircle size={14} className="text-brand-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
