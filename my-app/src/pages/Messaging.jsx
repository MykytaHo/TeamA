import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { useSearchParams } from 'react-router-dom';
import {
  collection, addDoc, query, where, onSnapshot,
  doc, getDoc, setDoc, updateDoc, orderBy,
  serverTimestamp, getDocs,
} from "firebase/firestore";

// Returns all users the current user has a tender connection with
const loadConnectedUsers = async (currentUid, allUsers) => {
  const userDoc = await getDoc(doc(db, "users", currentUid));
  const role = userDoc.data()?.role;

  const tendersSnap = await getDocs(
    query(
      collection(db, "tenderList"),
      where(role === "client" ? "clientID" : "supplierID", "==", currentUid)
    )
  );

  const connectedIds = new Set(
    tendersSnap.docs.map(d =>
      role === "client" ? d.data().supplierID : d.data().clientID
    )
  );

  return allUsers.filter(u => connectedIds.has(u.id));
};

export default function Messaging() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [notice, setNotice] = useState("");

  const messagesEndRef = useRef(null);
  const [searchParams] = useSearchParams();

  // Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setLoading(false);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    });

  return () => unsub();
}, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load all users
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.id !== currentUser.uid)
      );
    });
    return () => unsub();
  }, [currentUser]);

  // Filter to connected users via tenders
  useEffect(() => {
    if (!currentUser || users.length === 0) return;
    loadConnectedUsers(currentUser.uid, users)
      .then(setConnectedUsers)
      .catch(err => console.error("Error filtering users:", err));
  }, [currentUser, users]);

useEffect(() => {
    if (!selectedConversation?.id || !currentUser) { 
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
        
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const newMessage = change.doc.data();
            if (newMessage.senderId !== currentUser.uid && 'Notification' in window && Notification.permission === 'granted') {
              if (newMessage.createdAt && newMessage.createdAt.toMillis() > Date.now() - 5000) {
                  const senderName = getName(newMessage.senderId);
                  new Notification('New message', {
                    body: `${senderName}: ${newMessage.text}`,
                    icon: '/logo.png' 
                  });
              }
            }
          }
        });
        
        setMessages(list);
      },
      (err) => {
        console.error(err);
        setNotice("Failed to load messages."); 
      }
    );

    return () => unsub();
  }, [selectedConversation?.id, currentUser]);

  useEffect(() => {
    if (!currentUser || !searchParams.has('clientID')) return;

    const clientID = searchParams.get('clientID');
    const hasTenderId = searchParams.has('tenderId');
    const userToMessage = users.find(u => u.id === clientID);
    
    if (userToMessage) {
      startConversation(userToMessage, hasTenderId);  // ← Pass hasTenderId as true
    }
  }, [currentUser, searchParams, users]);

  const getName = (uid) => {
    if (uid === currentUser?.uid) return "You";
    const u = users.find(u => u.id === uid);
    return u?.name || u?.email || "User";
  };

  const getConversationTitle = (convo) => {
    if (!convo?.participants || !currentUser) return "Conversation";
    const others = convo.participants.filter(id => id !== currentUser.uid);
    return others.length === 0 ? "Saved Messages" : others.map(getName).join(", ");
  };

  const startConversation = async (otherUser, skipPermissionCheck = false) => {
    if (!currentUser || !otherUser?.id) return;
    try {
      const participants = [currentUser.uid, otherUser.id].sort();
      const conversationId = participants.join("_");
      const conversationRef = doc(db, "conversations", conversationId);
      const snap = await getDoc(conversationRef);

      if (snap.exists()) {
        setSelectedConversation({ id: conversationId, ...snap.data() });
        return;
      }

      let hasPermission = skipPermissionCheck; // Skip if coming from tender

      if (!skipPermissionCheck) {
      if (userRole === "client") {
        const clientJobsQuery = query(
          collection(db, "jobs"),
          where("clientId", "==", currentUser.uid)
        );
        const jobsSnap = await getDocs(clientJobsQuery);
        const jobCategories = [...new Set(jobsSnap.docs.map(d => d.data().category))];
        
        const tendersQuery = query(
          collection(db, "tenders"),
          where("category", "in", jobCategories),
          where("supplierId", "==", otherUser.id)
        );
        const tendersSnap = await getDocs(tendersQuery);
        hasPermission = tendersSnap.size > 0;
      } else if (userRole === "supplier") {
        const tendersQuery = query(
          collection(db, "tenders"),
          where("supplierId", "==", currentUser.uid),
          where("clientId", "==", otherUser.id)
        );
        const tendersSnap = await getDocs(tendersQuery);
        hasPermission = tendersSnap.size > 0;
      }
      }

      if (!hasPermission && !skipPermissionCheck ) {
        setError("You don't have permission to message this user.");
        return;
      }

      await setDoc(conversationRef, {
        participants,
        lastMessage: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSelectedConversation({ id: conversationId, participants });
    } catch (err) {
      console.error(err);
      setNotice("Could not start conversation.");
    }
  };

  const sendMessage = async () => {
    const text = messageText.trim();
    if (!text || !currentUser || !selectedConversation?.id) return;
    try {
      await addDoc(
        collection(db, "conversations", selectedConversation.id, "messages"),
        { text, senderId: currentUser.uid, createdAt: serverTimestamp() }
      );
      await updateDoc(doc(db, "conversations", selectedConversation.id), {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
      setMessageText("");
    } catch {
      setNotice("Failed to send message.");
    }
  };

  const addToFavorites = async (userId) => {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const current = userDoc.data().favorites || [];
      if (!current.includes(userId)) {
        await updateDoc(userRef, { favorites: [...current, userId] });
        setNotice("Added to favourites!");
      } else {
        setNotice("Already in favourites.");
      }
      setTimeout(() => setNotice(""), 2500);
    } catch {
      setNotice("Failed to add to favourites.");
    }
  };

  const goToReview = (userId) => {
    window.location.href = `/leavereview?user=${userId}`;
  };

  if (loading) return <div className="page"><p>Loading...</p></div>;
  if (!currentUser) return <div className="page"><p>Please sign in to use messaging.</p></div>;

  return (
    <div className="page messaging-grid">

      {/* Sidebar */}
      <aside style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, background: "#fff" }}>

        {notice && (
          <p style={{ fontSize: 13, color: "#2563eb", background: "#eff6ff", padding: "8px 12px", borderRadius: 6, marginBottom: 12 }}>
            {notice}
          </p>
        )}

        <h2 style={{ marginBottom: 10 }}>Contacts</h2>
        {connectedUsers.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>
            No contacts yet. Contacts appear once a tender has been submitted on one of your jobs.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {connectedUsers.map(u => (
              <div key={u.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 10px", borderRadius: 8, background: "#f8fafc",
                border: "1px solid #e2e8f0"
              }}>
                <button
                  onClick={() => startConversation(u)}
                  style={{
                    flex: 1, textAlign: "left", background: "none", border: "none",
                    padding: 0, color: "#0f172a", fontWeight: 600, fontSize: 14, cursor: "pointer",
                    boxShadow: "none"
                  }}
                >
                  {u.name || u.email}
                  <span style={{ fontWeight: 400, fontSize: 12, color: "#64748b", marginLeft: 4 }}>
                    ({u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : ""})
                  </span>
                </button>
                <button onClick={() => addToFavorites(u.id)} title="Add to favourites"
                  style={{ padding: "4px 7px", fontSize: 14, background: "none", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  ❤️
                </button>
                <button onClick={() => goToReview(u.id)} title="Leave a review"
                  style={{ padding: "4px 7px", fontSize: 14, background: "none", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  ⭐
                </button>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginBottom: 10 }}>Conversations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.length === 0 ? (
            <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>No conversations yet.</p>
          ) : conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConversation(c)}
              style={{
                textAlign: "left",
                background: selectedConversation?.id === c.id ? "#eff6ff" : "#f8fafc",
                border: selectedConversation?.id === c.id ? "1.5px solid #2563eb" : "1px solid #e2e8f0",
                borderRadius: 8, padding: "10px 12px"
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{getConversationTitle(c)}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.lastMessage || "No messages yet"}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat panel */}
      <section style={{
        border: "1px solid #e2e8f0", borderRadius: 10, padding: 16,
        minHeight: 520, display: "flex", flexDirection: "column", background: "#fff"
      }}>
        <h2 style={{ marginBottom: 12 }}>
          {selectedConversation ? getConversationTitle(selectedConversation) : "Select a conversation"}
        </h2>

        <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, paddingRight: 4 }}>
          {messages.length === 0 && selectedConversation && (
            <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic", textAlign: "center", marginTop: 40 }}>
              No messages yet. Say hello!
            </p>
          )}
          {messages.map(m => {
            const own = m.senderId === currentUser.uid;
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: own ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div style={{
                  background: own ? "#2563eb" : "#f1f5f9",
                  color: own ? "#fff" : "#0f172a",
                  padding: "9px 13px", borderRadius: 10, maxWidth: "70%",
                }}>
                  <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 2 }}>{getName(m.senderId)}</div>
                  <div style={{ fontSize: 14 }}>{m.text}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder={selectedConversation ? "Type a message..." : "Select a conversation to start messaging"}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
            disabled={!selectedConversation}
            style={{ flex: 1 }}
          />
          <button onClick={sendMessage} disabled={!selectedConversation || !messageText.trim()}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}
