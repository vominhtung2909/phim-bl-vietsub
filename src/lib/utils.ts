/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return '';
  
  let slug = text.toLowerCase();
  
  // Remove Vietnamese accents
  slug = slug.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a');
  slug = slug.replace(/[èéẹẻẽêềếệểễ]/g, 'e');
  slug = slug.replace(/[ìíịỉĩ]/g, 'i');
  slug = slug.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o');
  slug = slug.replace(/[ùúụủũưừứựửữ]/g, 'u');
  slug = slug.replace(/[ỳýỵỷỹ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');
  
  // Remove special characters and replace spaces with hyphens
  slug = slug.replace(/[^a-z0-9\s-]/g, '');
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  return slug;
}
