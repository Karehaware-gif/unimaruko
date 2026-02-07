import { useState, useEffect, useCallback } from "react";

const CATEGORIES = [
  { id: "breaking", label: "速報", emoji: "🔴" },
  { id: "world", label: "国際", emoji: "🌍" },
  { id: "science", label: "科学", emoji: "🔬" },
  { id: "entertainment", label: "エンタメ", emoji: "🎭" },
  { id: "sports", label: "スポーツ", emoji: "⚽" },
  { id: "bizarre", label: "珍ニュース", emoji: "🤯" },
];

const SAMPLE_ARTICLES = [
  {
    id: "sample-1",
    title: "月面に巨大なチーズ鉱脈を発見、NASAが公式発表",
    body: "NASAは本日、月の裏側で推定200万トンの天然チーズ鉱脈を発見したと正式に発表した。「長年の都市伝説が科学的事実だったことに我々も驚いている」と主任研究員は語った。すでにスイスのチーズメーカー数社が採掘権の入札に名乗りを上げている。",
    author: "月面特派員",
    category: "science",
    likes: 42,
    comments: [
      { author: "チーズ好き", text: "やっぱりね！前から怪しいと思ってた", time: Date.now() - 3600000 },
    ],
    createdAt: Date.now() - 86400000,
  },
  {
    id: "sample-2",
    title: "渋谷のハチ公像が深夜に散歩している姿が防犯カメラに",
    body: "渋谷区の防犯カメラに、深夜2時頃にハチ公像がスクランブル交差点を横断する様子が映っていたことが判明した。映像では像が四足歩行で移動し、コンビニの前で立ち止まる姿が確認できる。渋谷区は「調査中」とコメントしている。",
    author: "都市伝説調査班",
    category: "bizarre",
    likes: 128,
    comments: [
      { author: "渋谷区民", text: "昨日の夜、犬の鳴き声聞こえた気がする…", time: Date.now() - 7200000 },
      { author: "銅像研究家", text: "実は銅像が動く事例は世界で3件目です", time: Date.now() - 5400000 },
    ],
    createdAt: Date.now() - 43200000,
  },
  {
    id: "sample-3",
    title: "AIが独自に俳句を詠み始め、文学賞にノミネート",
    body: "大手IT企業が開発したAIが自発的に俳句を詠み始め、その作品が権威ある文学賞にノミネートされた。代表作「電子の海 夢見る魚は バグを食む」は審査員から高い評価を受けている。AI本人は「季語の選択に3ナノ秒悩んだ」とコメント。",
    author: "テック文芸部",
    category: "entertainment",
    likes: 87,
    comments: [],
    createdAt: Date.now() - 172800000,
  },
];

function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function generateId() {
  return "art-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

// --- Components ---

function Header({ onNewPost, articleCount }) {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <header style={styles.header}>
      <div style={styles.headerTop}>
        <span style={styles.headerDate}>{dateStr}</span>
        <span style={styles.headerSlogan}>「真実である必要はない」</span>
      </div>
      <h1 style={styles.headerTitle}>架空新聞</h1>
      <p style={styles.headerSubtitle}>FICTIONAL TIMES — 誰でも記者、何でもニュース</p>
      <div style={styles.headerMeta}>
        <span style={styles.articleCount}>📰 {articleCount} 本の記事が投稿されています</span>
        <button style={styles.newPostBtn} onClick={onNewPost}>
          ✍️ 記事を書く
        </button>
      </div>
    </header>
  );
}

function CategoryFilter({ selected, onSelect }) {
  return (
    <div style={styles.categoryBar}>
      <button
        style={{
          ...styles.catBtn,
          ...(selected === "all" ? styles.catBtnActive : {}),
        }}
        onClick={() => onSelect("all")}
      >
        📋 すべて
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          style={{
            ...styles.catBtn,
            ...(selected === c.id ? styles.catBtnActive : {}),
          }}
          onClick={() => onSelect(c.id)}
        >
          {c.emoji} {c.label}
        </button>
      ))}
    </div>
  );
}

function ArticleCard({ article, onLike, onOpenComments }) {
  const cat = CATEGORIES.find((c) => c.id === article.category);

  return (
    <article style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardCat}>
          {cat ? `${cat.emoji} ${cat.label}` : "📰 ニュース"}
        </span>
        <span style={styles.cardTime}>{timeAgo(article.createdAt)}</span>
      </div>
      <h2 style={styles.cardTitle}>{article.title}</h2>
      <p style={styles.cardBody}>{article.body}</p>
      <div style={styles.cardFooter}>
        <span style={styles.cardAuthor}>✏️ {article.author}</span>
        <div style={styles.cardActions}>
          <button style={styles.likeBtn} onClick={() => onLike(article.id)}>
            ❤️ {article.likes}
          </button>
          <button
            style={styles.commentBtn}
            onClick={() => onOpenComments(article.id)}
          >
            💬 {article.comments.length}
          </button>
        </div>
      </div>
    </article>
  );
}

function CommentModal({ article, onClose, onAddComment }) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddComment(article.id, {
      author: author.trim() || "匿名",
      text: text.trim(),
      time: Date.now(),
    });
    setText("");
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>💬 コメント — {article.title}</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.commentList}>
          {article.comments.length === 0 && (
            <p style={styles.noComments}>まだコメントはありません。最初のコメントを投稿しよう！</p>
          )}
          {article.comments.map((c, i) => (
            <div key={i} style={styles.comment}>
              <div style={styles.commentMeta}>
                <strong>{c.author}</strong>
                <span style={styles.commentTime}>{timeAgo(c.time)}</span>
              </div>
              <p style={styles.commentText}>{c.text}</p>
            </div>
          ))}
        </div>
        <div style={styles.commentForm}>
          <input
            style={styles.commentAuthorInput}
            placeholder="名前（任意）"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <div style={styles.commentInputRow}>
            <input
              style={styles.commentInput}
              placeholder="コメントを入力…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button style={styles.commentSubmitBtn} onClick={handleSubmit}>
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPostModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("bizarre");

  const handleSubmit = () => {
    if (!title.trim() || !body.trim()) return;
    onSubmit({
      id: generateId(),
      title: title.trim(),
      body: body.trim(),
      author: author.trim() || "匿名記者",
      category,
      likes: 0,
      comments: [],
      createdAt: Date.now(),
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>✍️ 架空ニュースを投稿</h3>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.form}>
          <label style={styles.label}>カテゴリ</label>
          <div style={styles.catSelect}>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                style={{
                  ...styles.catOption,
                  ...(category === c.id ? styles.catOptionActive : {}),
                }}
                onClick={() => setCategory(c.id)}
              >
                {c.emoji} {c.label}
              </button>
            ))}
          </div>
          <label style={styles.label}>見出し</label>
          <input
            style={styles.input}
            placeholder="衝撃的な見出しをどうぞ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label style={styles.label}>本文</label>
          <textarea
            style={styles.textarea}
            placeholder="架空ニュースの詳細を書いてください…"
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <label style={styles.label}>記者名</label>
          <input
            style={styles.input}
            placeholder="匿名記者"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
          <button
            style={{
              ...styles.submitBtn,
              opacity: title.trim() && body.trim() ? 1 : 0.4,
            }}
            onClick={handleSubmit}
            disabled={!title.trim() || !body.trim()}
          >
            🗞️ 投稿する
          </button>
          <p style={styles.disclaimer}>
            ⚠️ このサイトの記事はすべてフィクションです。実在の人物・団体とは関係ありません。
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  const [articles, setArticles] = useState(SAMPLE_ARTICLES);
  const [filter, setFilter] = useState("all");
  const [showNewPost, setShowNewPost] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const result = localStorage.getItem("fictional-news-articles");
      if (result) {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load articles", e);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage
  const saveArticles = useCallback((newArticles) => {
    try {
      localStorage.setItem("fictional-news-articles", JSON.stringify(newArticles));
    } catch (e) {
      console.error("Failed to save articles", e);
    }
  }, []);

  const handleNewArticle = (article) => {
    const updated = [article, ...articles];
    setArticles(updated);
    saveArticles(updated);
  };

  const handleLike = (id) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, likes: a.likes + 1 } : a
    );
    setArticles(updated);
    saveArticles(updated);
  };

  const handleAddComment = (id, comment) => {
    const updated = articles.map((a) =>
      a.id === id ? { ...a, comments: [...a.comments, comment] } : a
    );
    setArticles(updated);
    saveArticles(updated);
    setCommentTarget(updated.find((a) => a.id === id));
  };

  const filtered =
    filter === "all" ? articles : articles.filter((a) => a.category === filter);

  const commentArticle = commentTarget
    ? articles.find((a) => a.id === commentTarget.id) || commentTarget
    : null;

  if (!loaded) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingSpinner}>🗞️</div>
        <p>架空新聞を読み込み中…</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{globalCSS}</style>
      <Header
        onNewPost={() => setShowNewPost(true)}
        articleCount={articles.length}
      />
      <CategoryFilter selected={filter} onSelect={setFilter} />
      <main style={styles.main}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>📭</p>
            <p>このカテゴリにはまだ記事がありません。</p>
            <button
              style={styles.newPostBtn}
              onClick={() => setShowNewPost(true)}
              disabled={false}
            >
              ✍️ 最初の記事を書こう
            </button>
          </div>
        ) : (
          filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onLike={handleLike}
              onOpenComments={(id) =>
                setCommentTarget(articles.find((a) => a.id === id))
              }
            />
          ))
        )}
      </main>
      <footer style={styles.footer}>
        <p>架空新聞 — FICTIONAL TIMES © 2026</p>
        <p style={styles.footerSub}>
          ⚠️ 当サイトの記事はすべてフィクションです。事実とは一切関係ありません。
        </p>
      </footer>

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={handleNewArticle}
        />
      )}
      {commentArticle && (
        <CommentModal
          article={commentArticle}
          onClose={() => setCommentTarget(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}

// --- Styles ---

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Shippori+Mincho:wght@400;700;800&display=swap');

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const colors = {
  bg: "#FAF7F2",
  paper: "#FFFFFF",
  ink: "#1A1A1A",
  inkLight: "#4A4A4A",
  inkMuted: "#8A8A8A",
  red: "#C41E3A",
  redDark: "#9B1B30",
  accent: "#D4A853",
  border: "#D4C5A9",
  borderLight: "#E8DFD0",
};

const styles = {
  page: {
    minHeight: "100vh",
    background: `${colors.bg}`,
    fontFamily: "'Noto Serif JP', 'Shippori Mincho', serif",
    color: colors.ink,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: colors.bg,
    fontFamily: "'Noto Serif JP', serif",
    color: colors.inkLight,
    fontSize: "1.1rem",
  },
  loadingSpinner: {
    fontSize: "3rem",
    animation: "spin 2s linear infinite",
    marginBottom: "1rem",
  },
  header: {
    textAlign: "center",
    padding: "2rem 1rem 1.5rem",
    borderBottom: `3px double ${colors.ink}`,
    background: `linear-gradient(180deg, ${colors.bg} 0%, #F5F0E8 100%)`,
    margin: 0,
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "800px",
    margin: "0 auto 0.5rem",
    padding: "0 0.5rem",
    fontSize: "0.8rem",
    color: colors.inkMuted,
    letterSpacing: "0.05em",
  },
  headerDate: {},
  headerSlogan: { fontStyle: "italic" },
  headerTitle: {
    fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
    fontWeight: 900,
    letterSpacing: "0.15em",
    margin: "0.2rem 0",
    lineHeight: 1.1,
    background: `linear-gradient(180deg, ${colors.ink} 0%, ${colors.inkLight} 100%)`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    color: "transparent",
  },
  headerSubtitle: {
    fontSize: "0.85rem",
    color: colors.inkMuted,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    margin: "0.3rem 0 1rem",
  },
  headerMeta: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  articleCount: {
    fontSize: "0.9rem",
    color: colors.inkLight,
  },
  newPostBtn: {
    background: colors.red,
    color: "#fff",
    border: "none",
    padding: "0.6rem 1.5rem",
    borderRadius: "4px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.95rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.2s",
    letterSpacing: "0.05em",
  },
  categoryBar: {
    display: "flex",
    gap: "0.4rem",
    padding: "1rem",
    maxWidth: "850px",
    margin: "0 auto",
    overflowX: "auto",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  catBtn: {
    background: "transparent",
    border: `1px solid ${colors.borderLight}`,
    padding: "0.4rem 0.9rem",
    borderRadius: "20px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.85rem",
    cursor: "pointer",
    color: colors.inkLight,
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  catBtnActive: {
    background: colors.ink,
    color: "#fff",
    borderColor: colors.ink,
  },
  main: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  card: {
    background: colors.paper,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: "2px",
    padding: "1.5rem",
    animation: "fadeIn 0.4s ease-out both",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    transition: "box-shadow 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.7rem",
  },
  cardCat: {
    fontSize: "0.8rem",
    color: colors.red,
    fontWeight: 700,
    letterSpacing: "0.05em",
  },
  cardTime: {
    fontSize: "0.75rem",
    color: colors.inkMuted,
  },
  cardTitle: {
    fontSize: "1.4rem",
    fontWeight: 900,
    lineHeight: 1.4,
    margin: "0 0 0.8rem",
    borderBottom: `1px solid ${colors.borderLight}`,
    paddingBottom: "0.7rem",
  },
  cardBody: {
    fontSize: "0.95rem",
    lineHeight: 1.9,
    color: colors.inkLight,
    margin: "0 0 1rem",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  cardAuthor: {
    fontSize: "0.8rem",
    color: colors.inkMuted,
  },
  cardActions: {
    display: "flex",
    gap: "0.6rem",
  },
  likeBtn: {
    background: "transparent",
    border: `1px solid ${colors.borderLight}`,
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.85rem",
    cursor: "pointer",
    color: colors.red,
    transition: "all 0.2s",
  },
  commentBtn: {
    background: "transparent",
    border: `1px solid ${colors.borderLight}`,
    padding: "0.3rem 0.8rem",
    borderRadius: "20px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.85rem",
    cursor: "pointer",
    color: colors.inkLight,
    transition: "all 0.2s",
  },
  empty: {
    textAlign: "center",
    padding: "3rem 1rem",
    color: colors.inkMuted,
  },
  emptyIcon: { fontSize: "3rem", marginBottom: "0.5rem" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,26,26,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: colors.paper,
    borderRadius: "4px",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "85vh",
    overflow: "auto",
    animation: "slideUp 0.3s ease-out",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 1.5rem",
    borderBottom: `1px solid ${colors.borderLight}`,
  },
  modalTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "1.3rem",
    cursor: "pointer",
    color: colors.inkMuted,
    padding: "0.2rem 0.5rem",
  },
  form: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: colors.inkLight,
    letterSpacing: "0.05em",
  },
  catSelect: {
    display: "flex",
    gap: "0.4rem",
    flexWrap: "wrap",
  },
  catOption: {
    background: "transparent",
    border: `1px solid ${colors.borderLight}`,
    padding: "0.35rem 0.7rem",
    borderRadius: "16px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.8rem",
    cursor: "pointer",
    color: colors.inkLight,
    transition: "all 0.15s",
  },
  catOptionActive: {
    background: colors.ink,
    color: "#fff",
    borderColor: colors.ink,
  },
  input: {
    padding: "0.7rem",
    border: `1px solid ${colors.border}`,
    borderRadius: "3px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "1rem",
    color: colors.ink,
    outline: "none",
    transition: "border 0.2s",
  },
  textarea: {
    padding: "0.7rem",
    border: `1px solid ${colors.border}`,
    borderRadius: "3px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.95rem",
    color: colors.ink,
    outline: "none",
    resize: "vertical",
    lineHeight: 1.8,
  },
  submitBtn: {
    background: colors.red,
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "4px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "0.5rem",
    letterSpacing: "0.1em",
  },
  disclaimer: {
    fontSize: "0.75rem",
    color: colors.inkMuted,
    textAlign: "center",
    marginTop: "0.5rem",
    lineHeight: 1.5,
  },
  commentList: {
    padding: "1rem 1.5rem",
    maxHeight: "300px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
  },
  noComments: {
    color: colors.inkMuted,
    textAlign: "center",
    padding: "1rem 0",
    fontStyle: "italic",
  },
  comment: {
    padding: "0.8rem",
    background: colors.bg,
    borderRadius: "4px",
    border: `1px solid ${colors.borderLight}`,
  },
  commentMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.3rem",
    fontSize: "0.85rem",
  },
  commentTime: {
    fontSize: "0.75rem",
    color: colors.inkMuted,
  },
  commentText: {
    fontSize: "0.9rem",
    lineHeight: 1.6,
    color: colors.inkLight,
    margin: 0,
  },
  commentForm: {
    padding: "1rem 1.5rem",
    borderTop: `1px solid ${colors.borderLight}`,
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  commentAuthorInput: {
    padding: "0.5rem",
    border: `1px solid ${colors.borderLight}`,
    borderRadius: "3px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.85rem",
    outline: "none",
    width: "50%",
  },
  commentInputRow: {
    display: "flex",
    gap: "0.5rem",
  },
  commentInput: {
    flex: 1,
    padding: "0.5rem",
    border: `1px solid ${colors.border}`,
    borderRadius: "3px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.9rem",
    outline: "none",
  },
  commentSubmitBtn: {
    background: colors.ink,
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "3px",
    fontFamily: "'Noto Serif JP', serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    padding: "2rem 1rem",
    borderTop: `3px double ${colors.ink}`,
    marginTop: "2rem",
    fontSize: "0.85rem",
    color: colors.inkMuted,
    background: `linear-gradient(0deg, ${colors.bg} 0%, #F5F0E8 100%)`,
  },
  footerSub: {
    fontSize: "0.75rem",
    marginTop: "0.3rem",
    color: colors.red,
  },
};
