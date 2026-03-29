import { useState } from "react";
import { useApp } from "../context/AppContext";

const initialPosts = [
  {
    id: 1, type: "experience", anon: false,
    author: "Lakshmi R.", district: "Mysuru", time: "2h ago",
    title: "Finally got free sanitary pads from PHC Kuvempunagar!",
    content: "After 3 visits they finally had stock. The nurse was very helpful. Sharing for everyone in Mysuru — stocks available on Tuesdays and Fridays.",
    likes: 34, dislikes: 1,
    comments: [
      { id: 1, author: "Priya M.", text: "Thank you so much! I had no idea.", likes: 8, replies: [] },
      { id: 2, author: "Sunita K.", text: "Is it free for all ages or only BPL card holders?", likes: 5, replies: [{ author: "Lakshmi R.", text: "All women above 10 years, no BPL needed." }] },
    ]
  },
  {
    id: 2, type: "complaint", anon: true,
    author: "Anonymous", district: "Raichur", time: "5h ago",
    title: "Pads not distributed for 3 months in our village",
    content: "Our Anganwadi centre has not received pad supplies since October. When we ask they say 'stock will come'. This is a serious problem for school girls.",
    likes: 67, dislikes: 2,
    comments: [
      { id: 1, author: "Anonymous", text: "Same problem in our area. Who do we contact?", likes: 15, replies: [] },
    ]
  },
  {
    id: 3, type: "query", anon: false,
    author: "Meena S.", district: "Dharwad", time: "1d ago",
    title: "Query: Menopause symptoms and which doctor to see?",
    content: "I am 48 and experiencing hot flashes and irregular periods for 6 months. Which type of doctor should I see? Is there a free government facility for this?",
    likes: 28, dislikes: 0,
    comments: [
      { id: 1, author: "Dr. Kavitha (Volunteer)", text: "Please visit a gynaecologist. Govt hospitals like Vanivilas have free OPD. No referral needed.", likes: 22, replies: [] },
    ]
  },
];

const typeStyle = {
  experience: { color: "#10B981", label: "Experience", bg: "rgba(16,185,129,0.12)" },
  complaint: { color: "#EF4444", label: "Complaint →Govt", bg: "rgba(239,68,68,0.12)" },
  query: { color: "#3B82F6", label: "Query", bg: "rgba(59,130,246,0.12)" },
};

export default function DiscussionPage() {
  const { user } = useApp();
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [form, setForm] = useState({ type: "experience", title: "", content: "", anon: false });
  const [newComment, setNewComment] = useState({});

  const vote = (postId, dir) => {
    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, likes: p.likes + (dir === "up" ? 1 : 0), dislikes: p.dislikes + (dir === "down" ? 1 : 0) }
      : p));
  };

  const addPost = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const newPost = {
      id: Date.now(), type: form.type, anon: form.anon,
      author: form.anon ? "Anonymous" : (user?.name || "User"),
      district: user?.district || "Karnataka",
      time: "just now", title: form.title, content: form.content,
      likes: 0, dislikes: 0, comments: [],
    };
    setPosts(ps => [newPost, ...ps]);
    setForm({ type: "experience", title: "", content: "", anon: false });
    setShowForm(false);
  };

  const addComment = (postId) => {
    const text = newComment[postId];
    if (!text?.trim()) return;
    setPosts(ps => ps.map(p => p.id === postId
      ? { ...p, comments: [...p.comments, { id: Date.now(), author: user?.name || "You", text, likes: 0, replies: [] }] }
      : p));
    setNewComment(c => ({ ...c, [postId]: "" }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Community Discussion</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Share experiences, ask queries, report complaints</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ width: "auto", padding: "10px 18px" }}>
          + New Post
        </button>
      </div>

      {/* New Post Form */}
      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.typeRow}>
            {Object.entries(typeStyle).map(([type, s]) => (
              <button key={type} onClick={() => setForm(f => ({ ...f, type }))}
                style={{ ...styles.typeBtn, ...(form.type === type ? { background: s.bg, color: s.color, borderColor: s.color + "44" } : {}) }}>
                {s.label}
              </button>
            ))}
          </div>
          {form.type === "complaint" && (
            <div style={styles.complaintNote}>
              This complaint will be sent anonymously to district government officials
            </div>
          )}
          <input placeholder="Title of your post" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ marginBottom: 10 }} />
          <textarea placeholder="Share your experience, query, or complaint..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} style={{ marginBottom: 10, resize: "vertical" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={styles.anonToggle}>
              <input type="checkbox" checked={form.anon} onChange={e => setForm(f => ({ ...f, anon: e.target.checked }))} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Post anonymously</span>
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowForm(false)} className="btn-ghost" style={{ width: "auto", padding: "8px 16px" }}>Cancel</button>
              <button onClick={addPost} className="btn-primary" style={{ width: "auto", padding: "8px 18px" }}>Post</button>
            </div>
          </div>
        </div>
      )}

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.map(post => {
          const ts = typeStyle[post.type];
          const expanded = expandedPost === post.id;
          return (
            <div key={post.id} style={styles.postCard}>
              <div style={styles.postHeader}>
                <div style={styles.authorRow}>
                  <div style={styles.authorAvatar}>{post.anon ? "?" : post.author[0]}</div>
                  <div>
                    <span style={styles.authorName}>{post.author}</span>
                    <span style={styles.authorMeta}> · {post.district} · {post.time}</span>
                  </div>
                </div>
                <span style={{ ...styles.typeBadge, background: ts.bg, color: ts.color }}>{ts.label}</span>
              </div>
              <div style={styles.postTitle}>{post.title}</div>
              <div style={styles.postContent}>{post.content}</div>
              <div style={styles.postActions}>
                <button onClick={() => vote(post.id, "up")} style={styles.voteBtn}>▲ {post.likes}</button>
                <button onClick={() => vote(post.id, "down")} style={styles.voteBtnDown}>▼ {post.dislikes}</button>
                <button onClick={() => setExpandedPost(expanded ? null : post.id)} style={styles.commentBtn}>
                  💬 {post.comments.length} {expanded ? "Hide" : "Comments"}
                </button>
              </div>

              {expanded && (
                <div style={styles.commentsSection}>
                  {post.comments.map(c => (
                    <div key={c.id} style={styles.comment}>
                      <div style={styles.commentAuthor}>{c.author}</div>
                      <div style={styles.commentText}>{c.text}</div>
                      {c.replies?.map((r, ri) => (
                        <div key={ri} style={styles.reply}>
                          <div style={styles.commentAuthor}>{r.author}</div>
                          <div style={styles.commentText}>{r.text}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div style={styles.commentInput}>
                    <input placeholder="Write a comment..." value={newComment[post.id] || ""}
                      onChange={e => setNewComment(c => ({ ...c, [post.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addComment(post.id)}
                    />
                    <button onClick={() => addComment(post.id)} style={styles.sendBtn}>→</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "20px 20px 80px", maxWidth: 800, margin: "0 auto", animation: "fadeIn 0.3s ease" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  heading: { fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 2 },
  formCard: { background: "var(--bg-card)", border: "1px solid var(--emerald-border)", borderRadius: 16, padding: 20, marginBottom: 20, animation: "fadeIn 0.2s ease" },
  typeRow: { display: "flex", gap: 8, marginBottom: 12 },
  typeBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", transition: "all 0.2s" },
  complaintNote: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 12 },
  anonToggle: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" },
  postCard: { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: 18, transition: "border-color 0.2s" },
  postHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  authorRow: { display: "flex", alignItems: "center", gap: 10 },
  authorAvatar: { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#10B981,#059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#020D18" },
  authorName: { fontSize: 13, fontWeight: 600, color: "var(--text-primary)" },
  authorMeta: { fontSize: 12, color: "var(--text-muted)" },
  typeBadge: { fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 20 },
  postTitle: { fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" },
  postContent: { fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 },
  postActions: { display: "flex", gap: 8 },
  voteBtn: { background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--emerald)", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  voteBtnDown: { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#FCA5A5", borderRadius: 8, padding: "6px 12px", fontSize: 13, cursor: "pointer" },
  commentBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer" },
  commentsSection: { marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 },
  comment: { background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 },
  commentAuthor: { fontSize: 12, fontWeight: 600, color: "var(--emerald)", marginBottom: 3 },
  commentText: { fontSize: 13, color: "var(--text-secondary)" },
  reply: { marginLeft: 16, marginTop: 8, borderLeft: "2px solid var(--border)", paddingLeft: 10 },
  commentInput: { display: "flex", gap: 8, marginTop: 10 },
  sendBtn: { background: "var(--emerald)", border: "none", color: "#020D18", borderRadius: 8, width: 40, fontSize: 16, cursor: "pointer", fontWeight: 700, flexShrink: 0 },
};