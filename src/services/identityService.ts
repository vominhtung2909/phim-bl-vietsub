/**
 * SPDX-License-Identifier: Apache-2.0
 */

interface AnonymousIdentity {
  id: string;
  name: string;
  avatar: string;
}

const ANIMALS = [
  { name: "Mèo Lười Cần Thơ", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cat&backgroundColor=b6e3f4" },
  { name: "Sếu Hồng Đồng Tháp", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bird&backgroundColor=ffdfbf" },
  { name: "Gấu Trúc Trực Đêm", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=panda&backgroundColor=c0aede" },
  { name: "Cánh Cụt Y Khoa", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=penguin&backgroundColor=d1d4f9" },
  { name: "Thỏ Bảy Màu", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=rabbit&backgroundColor=ffd5dc" },
  { name: "Cáo Chín Đuôi", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=fox&backgroundColor=ffdfbf" },
  { name: "Voi Con Bản Đôn", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=elephant&backgroundColor=b6e3f4" },
  { name: "Hổ Hổ Sinh Hùng", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=tiger&backgroundColor=ffd5dc" },
  { name: "Sóc Chuột Nhanh Nhảu", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=squirrel&backgroundColor=c0aede" },
  { name: "Rồng Lộn Xộn", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=dragon&backgroundColor=d1d4f9" }
];

const STORAGE_KEY = 'anonymous_identity';

export const identityService = {
  getIdentity(): AnonymousIdentity {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored identity', e);
      }
    }

    // Generate new identity
    const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    
    const newIdentity: AnonymousIdentity = {
      id,
      name: animal.name,
      avatar: animal.avatar
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newIdentity));
    return newIdentity;
  }
};
