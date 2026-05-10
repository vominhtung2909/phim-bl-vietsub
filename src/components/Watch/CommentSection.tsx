/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Send, User, Reply, Pencil, Trash2, Check, X, MessageSquare } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../../lib/firebase';
import { identityService } from '../../services/identityService';
import { Comment } from '../../types';

interface CommentSectionProps {
  movieId: string;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState('');
  const [editingText, setEditingText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [identity] = useState(() => identityService.getIdentity());

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('movieId', '==', movieId),
      orderBy('createdAt', 'asc')
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

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    const text = parentId ? replyText : newComment;
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        movieId,
        userId: identity.id,
        userName: identity.name,
        userPhoto: identity.avatar,
        text: text.trim(),
        createdAt: serverTimestamp(),
        ...(parentId && { parentId })
      });
      if (parentId) {
        setReplyText('');
        setReplyingToId(null);
      } else {
        setNewComment('');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'comments', id), {
        text: editingText.trim(),
        isEdited: true
      });
      setEditingId(null);
      setEditingText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${id}`);
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

  const rootComments = comments.filter(c => !c.parentId).reverse(); 
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div className="space-y-6 bg-zinc-900/30 p-4 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <MessageSquare size={18} className="text-brand-primary" />
        <h3 className="text-base font-bold">Thảo luận ({comments.length})</h3>
      </div>

      <div className="bg-zinc-800/30 border border-white/5 p-4 rounded-2xl space-y-4 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden ring-2 ring-brand-primary/20 p-0.5">
            <img src={identity.avatar} alt={identity.name} className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] leading-none mb-1">Của bạn</p>
            <p className="text-xs font-bold text-brand-primary">{identity.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Để lại bình luận..."
            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-3 pr-12 text-xs focus:ring-2 focus:ring-brand-primary focus:border-transparent placeholder:text-zinc-600 resize-none min-h-[80px] transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="absolute bottom-3 right-3 p-2 bg-brand-primary rounded-lg text-white disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      <div className="space-y-6 pt-2">
        {rootComments.length > 0 ? (
          rootComments.map((comment) => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              identity={identity}
              editingId={editingId}
              editingText={editingText}
              replyingToId={replyingToId}
              replyText={replyText}
              isSubmitting={isSubmitting}
              setEditingId={setEditingId}
              setEditingText={setEditingText}
              setReplyingToId={setReplyingToId}
              setReplyText={setReplyText}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              handleSubmit={handleSubmit}
              getReplies={getReplies}
            />
          ))
        ) : (
          <div className="text-center py-8 space-y-2 opacity-50">
            <p className="text-zinc-500 text-[11px] italic font-medium">Chưa có bình luận nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  identity: any;
  editingId: string | null;
  editingText: string;
  replyingToId: string | null;
  replyText: string;
  isSubmitting: boolean;
  isReply?: boolean;
  setEditingId: (id: string | null) => void;
  setEditingText: (text: string) => void;
  setReplyingToId: (id: string | null) => void;
  setReplyText: (text: string) => void;
  handleDelete: (id: string) => void;
  handleUpdate: (id: string) => void;
  handleSubmit: (e: React.FormEvent, parentId?: string) => void;
  getReplies: (parentId: string) => Comment[];
  key?: React.Key;
}

function CommentItem({ 
  comment, 
  identity, 
  editingId, 
  editingText, 
  replyingToId, 
  replyText, 
  isSubmitting,
  isReply = false,
  setEditingId,
  setEditingText,
  setReplyingToId,
  setReplyText,
  handleDelete,
  handleUpdate,
  handleSubmit,
  getReplies
}: CommentItemProps) {
  const isOwner = comment.userId === identity.id;
  const isEditing = editingId === comment.id;
  const isReplying = replyingToId === comment.id;

  return (
    <div className={`flex gap-3 group ${isReply ? 'ml-6 md:ml-8' : ''}`}>
      <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full flex-shrink-0 bg-zinc-800 flex items-center justify-center overflow-hidden ring-1 ring-white/10`}>
        <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="bg-zinc-800/40 border border-white/5 rounded-xl rounded-tl-none p-2.5 space-y-1 group-hover:bg-zinc-800/60 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[11px] text-zinc-100">{comment.userName}</span>
              <span className="text-[9px] text-zinc-500 font-bold opacity-60">
                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}
              </span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isOwner && !isEditing && (
                <>
                  <button 
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditingText(comment.text);
                      setReplyingToId(null);
                    }}
                    className="p-1 text-zinc-400 hover:text-brand-primary"
                  >
                    <Pencil size={12} />
                  </button>
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-1.5">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs focus:ring-1 focus:ring-brand-primary outline-none"
                autoFocus
              />
              <div className="flex justify-end gap-1">
                <button onClick={() => setEditingId(null)} className="p-1 text-zinc-400"><X size={14} /></button>
                <button onClick={() => handleUpdate(comment.id)} className="p-1 text-brand-primary"><Check size={14} /></button>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-300 leading-normal whitespace-pre-wrap">
              {comment.text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          {!isReply && (
            <button 
              onClick={() => {
                setReplyingToId(comment.id);
                setReplyText('');
                setEditingId(null);
              }}
              className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${isReplying ? 'text-brand-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Reply size={12} />
              <span>Phản hồi</span>
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-2 ml-4">
            <form onSubmit={(e) => handleSubmit(e, comment.id)} className="relative">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Phản hồi...`}
                className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg p-2 pr-10 text-[11px] focus:ring-1 focus:ring-brand-primary outline-none min-h-[60px]"
                autoFocus
              />
              <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                <button type="button" onClick={() => setReplyingToId(null)} className="p-1 text-zinc-500"><X size={12} /></button>
                <button type="submit" disabled={!replyText.trim() || isSubmitting} className="p-1 text-brand-primary disabled:opacity-50"><Send size={12} /></button>
              </div>
            </form>
          </div>
        )}

        {!isReply && getReplies(comment.id).map(reply => (
          <CommentItem 
            key={reply.id} 
            comment={reply} 
            identity={identity}
            editingId={editingId}
            editingText={editingText}
            replyingToId={replyingToId}
            replyText={replyText}
            isSubmitting={isSubmitting}
            setEditingId={setEditingId}
            setEditingText={setEditingText}
            setReplyingToId={setReplyingToId}
            setReplyText={setReplyText}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            handleSubmit={handleSubmit}
            getReplies={getReplies}
            isReply
          />
        ))}
      </div>
    </div>
  );
}
