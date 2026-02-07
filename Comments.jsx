// src/Comments.jsx
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
    collection,
    addDoc,
    serverTimestamp,
    query,
    orderBy,
    limit,
    onSnapshot,
} from "firebase/firestore";

export default function Comments() {
    const [ready, setReady] = useState(false);
    const [text, setText] = useState("");
    const [comments, setComments] = useState([]);

    // 1) 匿名ログイン（ログイン画面なし）
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) await signInAnonymously(auth);
            setReady(true);
        });
        return () => unsub();
    }, []);

    // 2) comments をリアルタイム購読
    useEffect(() => {
        const q = query(
            collection(db, "comments"),
            orderBy("createdAt", "desc"),
            limit(50)
        );

        return onSnapshot(q, (snap) => {
            setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });
    }, []);

    // 3) 投稿（Firestoreに保存）
    const submit = async (e) => {
        e.preventDefault();
        if (!ready) return;

        const t = text.trim();
        if (!t) return;

        const uid = auth.currentUser?.uid;
        if (!uid) return;

        await addDoc(collection(db, "comments"), {
            text: t,
            uid,
            createdAt: serverTimestamp(),
        });

        setText("");
    };

    return (
        <div style={{ marginTop: 24 }}>
            <h2>コメント</h2>

            <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    maxLength={300}
                    placeholder="匿名でコメント…"
                    style={{ flex: 1, padding: 8 }}
                    disabled={!ready}
                />
                <button type="submit" disabled={!ready}>
                    投稿
                </button>
            </form>

            <div style={{ marginTop: 12 }}>
                {comments.map((c) => (
                    <div
                        key={c.id}
                        style={{ padding: "10px 0", borderBottom: "1px solid #ddd" }}
                    >
                        {c.text}
                    </div>
                ))}
            </div>
        </div>
    );
}
