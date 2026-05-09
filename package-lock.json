/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function slugify(str: string): string {
  if (!str) return '';
  
  // Convert to lower case
  let slug = str.toLowerCase();

  // Replace Vietnamese characters
  const from = "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ";
  const to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";
  for (let i = 0, l = from.length; i < l; i++) {
    slug = slug.replace(new RegExp(from[i], "g"), to[i]);
  }

  // Remove special characters and replace spaces with hyphens
  slug = slug
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    .trim()
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text

  return slug;
}
