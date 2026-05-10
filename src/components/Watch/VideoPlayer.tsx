/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  // Enhanced URL logic: ensures protocol and common params
  const getEnhancedUrl = (baseUrl: string) => {
    if (!baseUrl) return '';
    let finalUrl = baseUrl;
    
    if (!finalUrl.startsWith('http') && !finalUrl.startsWith('//')) {
      finalUrl = 'https:' + finalUrl;
    }
    
    return finalUrl;
  };

  const finalUrl = getEnhancedUrl(url);

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        key={finalUrl}
        src={finalUrl}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; encrypted-media"
        title="Movie Player"
        loading="lazy"
      />
    </div>
  );
}