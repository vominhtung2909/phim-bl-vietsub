/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Send, User, Trash2 } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Comment } from '../../types';

interface CommentSectionProps {
  movieId: string;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const { user, profile, login } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('movieId', '==', movieId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'comments');
    });

    return () => unsubscribe();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        movieId,
        userId: user.uid,
        userName: profile?.displayName || 'Anonymous',
        userPhoto: profile?.photoURL ?? undefined,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      });
      setNewComment('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa bình luận này?')) return;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `comments/${id}`);
    }
  };

  return (
    <div className="space-y-8 mt-12 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Bình luận ({comments.length})</h3>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-4">
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-zinc-800 flex items-center justify-center overflow-hidden">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="User" className="w-full h-full object-cover" />
            ) : (
              <User size={20} className="text-zinc-500" />
            )}
          </div>
          <div className="flex-1 space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết cảm nghĩ của bạn về phim..."
              className="w-full bg-zinc-800 border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-brand-primary placeholder:text-zinc-500 resize-none min-h-[100px]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-brand-primary rounded-lg font-bold text-sm disabled:opacity-50 hover:bg-brand-primary/80 transition-all"
              >
                <Send size={16} /> Gửi bình luận
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-800/50 rounded-xl p-8 text-center space-y-4">
          <p className="text-zinc-400">Bạn cần đăng nhập để tham gia thảo luận.</p>
          <button 
            onClick={login}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg font-bold text-sm transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-zinc-800 flex items-center justify-center overflow-hidden">
              {comment.userPhoto ? (
                <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-zinc-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm">{comment.userName}</span>
                  <span className="ml-3 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('vi-VN') : 'Mới đây'}
                  </span>
                </div>
                {user?.uid === comment.userId && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/50 p-3 rounded-lg rounded-tl-none">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
