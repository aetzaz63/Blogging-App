"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";

const CommentSection = ({
  postId,
  user,
  postAuthorEmail,
  initialComments,
  onCommentChange,
  onCommentsUpdate,
}) => {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Notify parent when comments change
  useEffect(() => {
    if (onCommentChange) onCommentChange(comments.length);
  }, [comments, onCommentChange]);

  // Update localStorage whenever comments change
  const updateCommentsInStorage = (updatedComments) => {
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, comments: updatedComments } : p
      );
      localStorage.setItem("blogPosts", JSON.stringify(updatedPosts));
      
      // Notify parent component if callback exists
      if (onCommentsUpdate) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        onCommentsUpdate(updatedPost);
      }
    }
  };

  const handleAddComment = () => {
    if (!text.trim()) return;
    const newComment = {
      id: Date.now(), // Use timestamp for unique ID
      author: user?.fullName || "Guest",
      authorEmail: user?.email || null,
      text,
      date: new Date().toISOString(),
    };
    const updatedComments = [...comments, newComment];
    setComments(updatedComments);
    updateCommentsInStorage(updatedComments);
    setText("");
  };

  const handleDeleteComment = (id, authorEmail) => {
    const canDelete =
      user &&
      (user.email === postAuthorEmail || user.email === authorEmail);
    if (!canDelete) return alert("You can only delete your own comments.");
    const updatedComments = comments.filter((c) => c.id !== id);
    setComments(updatedComments);
    updateCommentsInStorage(updatedComments);
  };

  const handleStartEdit = (comment) => {
    if (user?.email !== comment.authorEmail)
      return alert("You can only edit your own comments.");
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleUpdateComment = (id) => {
    if (!editText.trim()) return;
    const updatedComments = comments.map((c) =>
      c.id === id ? { ...c, text: editText, edited: true } : c
    );
    setComments(updatedComments);
    updateCommentsInStorage(updatedComments);
    setEditingId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  // If no comments, show only input
  if (comments.length === 0) {
    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      {/* Comment count */}
      <h4 className="text-sm font-semibold text-gray-700 mb-3">
        {comments.length} Comment{comments.length > 1 ? "s" : ""}
      </h4>

      {/* Comments List */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-50 rounded-lg p-3 relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-sm text-gray-900">
                  {c.author}
                </span>
                <p className="text-xs text-gray-500 mt-0.5">
                  {new Date(c.date).toLocaleDateString()}
                </p>
              </div>

              {/* Action buttons */}
              {(user?.email === c.authorEmail ||
                user?.email === postAuthorEmail) && (
                <div className="flex gap-2 ml-2">
                  {user?.email === c.authorEmail && (
                    <button
                      onClick={() => handleStartEdit(c)}
                      className="text-gray-500 hover:text-blue-600 cursor-pointer"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(c.id, c.authorEmail)}
                    className="text-gray-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Comment Text / Edit Mode */}
            {editingId === c.id ? (
              <div className="flex flex-col gap-2 mt-2">
                <input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-400 rounded-lg p-2 text-sm text-black cursor-pointer hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComment(c.id)}
                    className="bg-blue-500 rounded-lg text-sm text-white cursor-pointer p-2 hover:bg-blue-600 transition"
                  >
                    Update
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 mt-2">
                {c.text}
                {c.edited && (
                  <span className="text-xs text-gray-400 ml-1">(edited)</span>
                )}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Add New Comment */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default CommentSection;