/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Youtube, Facebook, Music } from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const socialLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={24} />,
      url: 'https://facebook.com/@tanso0.5',
    },
    {
      name: 'Youtube',
      icon: <Youtube size={24} />,
      url: 'https://youtube.com/@tanso0.5',
    },
    {
      name: 'Tiktok',
      icon: <Music size={24} />,
      url: 'https://tiktok.com/@tanso0.5',
    },
  ];

  return (
    <footer className="relative z-10 px-4 md:px-12 py-12 border-t border-zinc-900 bg-bg-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        
        {/* Social Links */}
        <div className="flex items-center gap-8">
          {socialLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ 
                scale: 1.2,
                color: '#A020F0', // Neon purple
                filter: 'drop-shadow(0 0 8px rgba(160, 32, 240, 0.6))'
              }}
              className="text-zinc-500 transition-colors duration-300"
              aria-label={social.name}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>

        {/* Copyright */}
        <div className="text-center space-y-2">
          <p className="text-zinc-500 text-sm font-medium tracking-tight">
            © 2026 Phim BL - Nơi cập nhật những bộ phim BL Vietsub mới nhất
          </p>
        </div>

      </div>
    </footer>
  );
}
