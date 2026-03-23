import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export default function Messaging() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== currentUser.uid);

        setUsers(list);
      },
      () => setError("Failed to load users.")
    );

    const convoQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", currentUser.uid)
    );

    const unsubConvos = onSnapshot(
      convoQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0));

        setConversations(list);

        if (!selectedConversation && list.length > 0) {
          setSelectedConversation(list[0]);
        }
      },
      () => setError("Failed to load conversations.")
    );

    return () => {
      unsubUsers();
      unsubConvos();
    };
  }, [currentUser, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation?.id) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, "conversations", selectedConversation.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      messagesQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(list);
      },
      () => setError("Failed to load messages.")
    );

    return () => unsub();
  }, [selectedConversation]);

  const getName = (uid) => {
    if (uid === currentUser?.uid) return "You";
    const user = users.find((u) => u.id === uid);
    return user?.name || user?.displayName || user?.email || "User";
  };

  const getConversationTitle = (conversation) => {
    if (!conversation?.participants || !currentUser) return "Conversation";

    const others = conversation.participants.filter((id) => id !== currentUser.uid);

    if (others.length === 0) return "Saved Messages";

    return others.map(getName).join(", ");
  };

  const startConversation = async (otherUser) => {
    if (!currentUser || !otherUser?.id) return;

    try {
      const participants = [currentUser.uid, otherUser.id].sort();
      const conversationId = participants.join("_");
      const conversationRef = doc(db, "conversations", conversationId);
      const snap = await getDoc(conversationRef);

      if (!snap.exists()) {
        await setDoc(conversationRef, {
          participants,
          lastMessage: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setSelectedConversation({
        id: conversationId,
        participants,
        ...(snap.exists() ? snap.data() : {}),
      });
    } catch {
      setError("Could not start conversation.");
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || !currentUser || !selectedConversation?.id) return;

    try {
      const convoRef = doc(db, "conversations", selectedConversation.id);

      await addDoc(
        collection(db, "conversations", selectedConversation.id, "messages"),
        {
          text,
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(convoRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });

      setMessageText("");
    } catch {
      setError("Failed to send message.");
    }
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="page">Please sign in to use messaging.</div>;
  }

  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
      <aside style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
        <h2>Users</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {users.map((u) => (
            <button key={u.id} onClick={() => startConversation(u)}>
              {u.name || u.displayName || u.email || "User"}
            </button>
          ))}
        </div>

        <h2>Conversations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedConversation(c)}
              style={{
                opacity: selectedConversation?.id === c.id ? 1 : 0.85,
                border: selectedConversation?.id === c.id ? "2px solid #0066cc" : "none",
              }}
            >
              <div style={{ fontWeight: 700 }}>{getConversationTitle(c)}</div>
              <div style={{ fontSize: 12 }}>{c.lastMessage || "No messages yet"}</div>
            </button>
          ))}
        </div>
      </aside>

      <section
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          minHeight: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>{selectedConversation ? getConversationTitle(selectedConversation) : "Select a conversation"}</h2>

        {error ? <p className="message">{error}</p> : null}

        <div style={{ flex: 1, overflowY: "auto", margin: "12px 0", paddingRight: 6 }}>
          {messages.map((m) => {
            const own = m.senderId === currentUser.uid;

            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  justifyContent: own ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    background: own ? "#0066cc" : "#f1f3f5",
                    color: own ? "#fff" : "#333",
                    padding: "8px 10px",
                    borderRadius: 8,
                    maxWidth: "70%",
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{getName(m.senderId)}</div>
                  <div>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={!selectedConversation}
          />
          <button onClick={sendMessage} disabled={!selectedConversation || !messageText.trim()}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}