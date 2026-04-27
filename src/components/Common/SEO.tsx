/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Movie } from '../../types';

interface SEOProps {
  title?: string;
  description?: string;
  movie?: Movie;
  image?: string;
  isHome?: boolean;
  categoryName?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, movie, image, isHome, categoryName }) => {
  const siteName = "Phim BL Vietsub";
  const defaultHomeTitle = "Phim BL Vietsub - Xem Phim Đam Mỹ Mới Nhất 2026 (Full HD)";
  const defaultFavicon = "https://i.postimg.cc/PrRmB148/z6859167247794-6d9c3bca7be3f1d827aeba837e8c845a.jpg";
  
  const defaultWatchDescription = (movieTitle: string) => 
    `Xem phim ${movieTitle} Vietsub bản đẹp, chất lượng cao tại ${siteName}. Cập nhật tập mới nhất và nội dung hấp dẫn mỗi ngày.`;

  let finalTitle = title ? `${title} - ${siteName}` : siteName;
  let finalDescription = description || "Phim BL Vietsub - Xem Phim Đam Mỹ Mới Nhất 2026 (Full HD). Tuyển tập phim đam mỹ hay nhất thế giới, phim BL Thái Lan, Hàn Quốc, Nhật Bản mới nhất.";
  let finalImage = image || defaultFavicon;
  const keywords = "phim bl vietsub, đam mỹ vietsub, xem phim bl, phim đam mỹ mới, bl thái lan vietsub, hủ nữ";
  
  // Truncate function for SEO descriptions
  const truncate = (text: string, limit: number) => {
    if (!text || text.length <= limit) return text;
    return text.slice(0, limit - 3) + "...";
  };

  let movieSchema = null;

  if (isHome) {
    if (categoryName) {
      finalTitle = `${categoryName} - ${siteName}`;
    } else {
      finalTitle = defaultHomeTitle;
    }
  } else if (movie) {
    // Watch Page logic: [Tên Phim] [Số tập mới nhất] Vietsub - Phim BL Vietsub
    const episodeText = movie.statusLabel ? ` ${movie.statusLabel}` : "";
    finalTitle = `${movie.title}${episodeText} Vietsub - ${siteName}`;

    // Description logic: column description or fallback
    if (movie.description && movie.description.trim().length > 10) {
      finalDescription = truncate(movie.description.trim(), 160);
    } else {
      finalDescription = truncate(defaultWatchDescription(movie.title), 160);
    }

    finalImage = movie.poster_url;
    
    // JSON-LD Schema (Rich Snippet)
    movieSchema = {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": movie.title,
      "image": movie.poster_url,
      "description": finalDescription,
      "url": window.location.href,
      "genre": movie.genres.split(",").map(g => g.trim()),
      "countryOfOrigin": {
        "@type": "Country",
        "name": movie.country
      },
      "actor": movie.actors.split(",").map(a => ({
        "@type": "Person",
        "name": a.trim()
      }))
    };
  }

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      
      {/* JSON-LD Structured Data */}
      {movieSchema && (
        <script type="application/ld+json">
          {JSON.stringify(movieSchema)}
        </script>
      )}
      
      {/* Open Graph */}
      <meta property="og:title" content={movie ? `${movie.title} - Xem ngay tại ${siteName}` : finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* Favicon */}
      <link rel="icon" type="image/jpeg" href={defaultFavicon} />
      <link rel="apple-touch-icon" href={defaultFavicon} />
    </Helmet>
  );
};

export default SEO;
