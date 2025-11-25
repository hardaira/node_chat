import { useEffect, useState } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';

interface OutletCtx {
  author: string;
}

interface Message {
  id: number;
  text: string;
  author: string;
  room: string;
}

export const RoomPage = () => {
  const { room } = useParams();
  const { author } = useOutletContext<OutletCtx>();


  const [messages, setMessages] = useState([] as Message[]);
  const [error, setError] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [createMessageError, setCreateMessageError] = useState('');

  useEffect(() => {
    // if (!isLoggedIn) return;
    const loadMessages = () => {
      fetch('http://localhost:5000/messages')
        .then((res) => res.json())
        .then((data) => setMessages(data))
        // .then((data) => {
        //   console.log('Messages from backend:', data); // ← CHECK THIS
        //   setMessages(Array.isArray(data) ? data : []);
        // })
        .catch(() => setError('Failed to load messages'));
    };

    loadMessages();

    const ws = new WebSocket('ws://localhost:5000');

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (
        msg.type === 'messageCreated' ||
        msg.type === 'messageUpdated' ||
        msg.type === 'messageDeleted'
      ) {
        loadMessages();
      }
    };

    ws.onerror = () => setError('WebSocket connection error');

    return () => ws.close();
  }, []);

  const handleAddMessage = async (e) => {
    e.preventDefault();

    if (!newMessageText.trim()) {
      setCreateMessageError('Title is required');
      return;
    }

    try {
      // 1️⃣ Fetch existing users

      const messagesRes = await fetch('http://localhost:5000/messages');
      if (!messagesRes.ok) throw new Error('Failed to fetch messages');

      const messages = await messagesRes.json();

      // 2️⃣ Check if user already exists
      // const existingMessage = messages.find((m) => m.text === newMessageText && m.author === author);

      // if (existingMessage) {
      //   // If user exists → login without creating
      //   // setIsLoggedIn(true);
      //   setNewMessageText(''); // clear input
      //   console.log(messages);
      //   return;
      // }

      // 3️⃣ Create new user if not found
      const createRes = await fetch('http://localhost:5000/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessageText, author: author, room: room, }),
      });

      // if (!createRes.ok) {
      //   throw new Error('Failed to create message');
      // }

      const createdMessage = await createRes.json();
      console.log('Created room:', createdMessage);
      setMessages([...messages, createdMessage]);
      // 4️⃣ Log in and clear input

      setNewMessageText('');

      console.log(messages);
    } catch (err) {
      console.error('Error:', err);
      setCreateMessageError('Failed to connect to the server');
      setNewMessageText('');
    }
  };

  // DELETE MESSAGE
  const handleDeleteMessage = async (messageId: number, messageAuthor: string) => {
    // Only allow the author to delete the room
    if (messageAuthor !== author) {
      alert('To delete this message you must be the author.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/messages/${messageId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      // if (!res.ok) {
      //   alert(data.message || 'Failed to delete room');
      //   return;
      // }

      // Update the state to reflect the room deletion
      setMessages((prevMessages) =>
        prevMessages.filter((r) => r.id !== messageId),
      );
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const filteredMessages = messages.filter((m) => m.room === room);
  const roomHeading = room.toUpperCase();
  return (
    <div>
      <h1>JOIN FANS OF {roomHeading}</h1>
      <h3>You are logged in as: {author}</h3>

      {/* Add new message */}
      <form onSubmit={handleAddMessage}>
        <input
          type="text"
          value={newMessageText}
          placeholder="Enter your message"
          onChange={(e) => setNewMessageText(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {createMessageError && (
        <p style={{ color: 'red' }}>{createMessageError}</p>
      )}

      <ul>
        {filteredMessages.map((message) => (
          <li key={message.id}>
            <strong>{message.author}:</strong> {message.text}
            <div onClick={() => handleDeleteMessage(message.id, message.author)}>X</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
