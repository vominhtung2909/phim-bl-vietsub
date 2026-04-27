/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Episode {
  name: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  poster_url: string;
  description: string;
  category: string;
  type: string;
  country: string;
  genres: string;
  actors: string;
  tags: string;
  slug: string;
  episodes: Episode[];
  episodesTelegram: Episode[];
  episodesOkru: Episode[];
  statusLabel?: string;
  raw_episodes_json: string;
  updated_at?: string;
  views?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Comment {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: any; // Firestore Timestamp
}
