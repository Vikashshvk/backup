import React, { useState, useEffect } from "react";
import { API } from "../api";
import { Link } from "react-router-dom";

export default function Home({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [commentText, setCommentText] = useState({});

  useEffect(() => {
    API.get("/posts").then((res) => setPosts(res.data));
    API.get("/users/discover").then((res) => setDiscover(res.data));
  }, []);

  const handleFollow = async (id) => {
    await API.post(`/users/${id}/follow`);
    const disc = await API.get("/users/discover");
    setDiscover(disc.data);
  };

  const handleLike = async (postId) => {
    const res = await API.post(`/posts/${postId}/like`);
    setPosts(
      posts.map((p) =>
        p._id === postId ? { ...p, likes: res.data.likes } : p,
      ),
    );
  };

  const handleAddComment = async (postId) => {
    const text = commentText[postId];
    if (!text) return;
    const res = await API.post(`/posts/${postId}/comment`, { text });
    setPosts(posts.map((p) => (p._id === postId ? res.data : p)));
    setCommentText({ ...commentText, [postId]: "" });
  };

  return (
    <div className="row g-4 justify-content-center">
      {/* Center Feed Posts */}
      <div className="col-12 col-lg-7">
        {posts.length === 0 ? (
          <div className="glass-card p-5 text-center text-secondary">
            <h5>No posts yet!</h5>
            <p className="small">Be the first to share a moment.</p>
            <Link to="/create-post" className="btn btn-warning fw-bold">
              Upload Post
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="glass-card mb-4 overflow-hidden shadow-sm"
            >
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-10">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={post.author.avatar}
                    width="42"
                    height="42"
                    className="rounded-circle object-fit-cover border border-warning"
                    alt=""
                  />
                  <div>
                    <h6 className="mb-0 fw-bold">{post.author.name}</h6>
                    <small className="text-secondary">
                      @{post.author.username}
                    </small>
                  </div>
                </div>
                {currentUser._id !== post.author._id && (
                  <button
                    onClick={() => handleFollow(post.author._id)}
                    className="btn btn-sm btn-outline-warning rounded-pill px-3"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Uploaded Post Image */}
              <img
                src={post.image}
                className="w-100 object-fit-cover"
                style={{ maxHeight: "480px" }}
                alt="Feed"
              />

              {/* Interactions */}
              <div className="p-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  >
                    ❤️ {post.likes?.length || 0} Likes
                  </button>
                </div>
                {post.caption && <p className="mb-2">{post.caption}</p>}

                {/* Comments */}
                <div className="border-top border-secondary border-opacity-25 pt-2 mt-2">
                  <div className="small text-secondary mb-2 fw-semibold">
                    Comments ({post.comments?.length || 0})
                  </div>
                  <div
                    className="overflow-y-auto mb-2"
                    style={{ maxHeight: "120px" }}
                  >
                    {post.comments?.map((c, i) => (
                      <div key={i} className="small my-1">
                        <strong>{c.user?.name || "User"}: </strong>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Add a comment..."
                      value={commentText[post._id] || ""}
                      onChange={(e) =>
                        setCommentText({
                          ...commentText,
                          [post._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={() => handleAddComment(post._id)}
                      className="btn btn-sm btn-warning"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right Column: Discover People */}
      <div className="col-12 col-lg-5 d-none d-lg-block">
        <div className="glass-card p-3 sticky-top" style={{ top: "80px" }}>
          <h6 className="fw-bold mb-3">🔥 New Connections</h6>
          {discover.map((u) => (
            <div
              key={u._id}
              className="d-flex align-items-center justify-content-between mb-3"
            >
              <div className="d-flex align-items-center gap-2">
                <img
                  src={u.avatar}
                  width="40"
                  height="40"
                  className="rounded-circle object-fit-cover"
                  alt=""
                />
                <div>
                  <div className="small fw-bold">{u.name}</div>
                  <small className="text-secondary">
                    {u.gender}, {u.age} yrs
                  </small>
                </div>
              </div>
              <div className="d-flex gap-1">
                <Link
                  to="/chats"
                  className="btn btn-sm btn-outline-warning rounded-circle"
                >
                  💬
                </Link>
                <Link
                  to={`/call/${u._id}`}
                  className="btn btn-sm btn-outline-danger rounded-circle"
                >
                  📹
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
