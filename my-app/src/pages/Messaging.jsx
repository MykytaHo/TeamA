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
  getDocs,
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
  const [filteredUsers, setFilteredUsers] = useState([]);

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
    return () => {
      unsubUsers();
    };
    }, [currentUser]);
useEffect(() => {
  if (!currentUser || users.length === 0) return;

  const filterUsersByRole = async () => {
    try {
      // Get current user's role
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userRole = userDoc.data().role;

      const filtered = [];

      for (const u of users) {
        if (userRole === "client") {
          // Get client's job categories
          const clientJobsQuery = query(
            collection(db, "jobs"),
            where("clientId", "==", currentUser.uid)
          );
          const jobsSnap = await getDocs(clientJobsQuery);
          const jobCategories = [...new Set(jobsSnap.docs.map(d => d.data().category))];

          // Show suppliers who tendered for jobs in those categories
          const tendersQuery = query(
            collection(db, "tenders"),
            where("category", "in", jobCategories),
            where("supplierId", "==", u.id)
          );
          const snap = await getDocs(tendersQuery);
          if (snap.size > 0) filtered.push(u);

        } else if (userRole === "supplier") {
          // Show clients they have tenders for
          const tendersQuery = query(
            collection(db, "tenders"),
            where("supplierId", "==", currentUser.uid),
            where("clientId", "==", u.id)
          );
          const snap = await getDocs(tendersQuery);
          if (snap.size > 0) filtered.push(u);
        }
      }

      setFilteredUsers(filtered);
    } catch (err) {
      console.error("Error filtering users:", err);
    }
  };

  filterUsersByRole();
}, [currentUser, users]);


useEffect(() => {
  if (!currentUser) return;

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
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userRole = userDoc.data().role;

      const participants = [currentUser.uid, otherUser.id].sort();
      const conversationId = participants.join("_");
      const conversationRef = doc(db, "conversations", conversationId);
      const snap = await getDoc(conversationRef);

      if (snap.exists()) {
        setSelectedConversation({ id: conversationId, ...snap.data() });
        return;
      }

      let hasPermission = false;

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

      if (!hasPermission) {
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

  const addToFavorites = async (userId) => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const currentFavorites = userDoc.data().favorites || [];
      
      if (!currentFavorites.includes(userId)) {
        await updateDoc(userRef, {
          favorites: [...currentFavorites, userId]
        });
        setError("Added to favorites!");
        setTimeout(() => setError(""), 2000);
      } else {
        setError("Already in favorites");
        setTimeout(() => setError(""), 2000);
      }
    } catch (err) {
      console.error('Error adding to favorites:', err);
      setError("Failed to add to favorites");
    }
  };

  const leaveReview = async (userId) => {
    // Navigate to leave review page with selected user
    window.location.href = `/leavereview?user=${userId}`;
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
          {filteredUsers.map((u) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => startConversation(u)} style={{ flex: 1 }}>
              {u.name || u.displayName || u.email || "User"}
            </button>
             
              <button 
                onClick={() => addToFavorites(u.id)}
                style={{ padding: "4px 8px", fontSize: "12px" }}
                title="Add to favorites"
              >
                ❤️
              </button>
              <button 
                onClick={() => leaveReview(u.id)}
                style={{ padding: "4px 8px", fontSize: "12px" }}
                title="Leave review"
              >
                ⭐
              </button>
            </div>
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