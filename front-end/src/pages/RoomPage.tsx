import { useEffect, useState } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';

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
   //const { room } = useParams();
  const [searchParams] = useSearchParams(); // Get the search params object

  // Get the 'room' query parameter from the URL
  const { roomTitle } = searchParams.get('room');

  const { author } = useOutletContext<OutletCtx>();


  const [messages, setMessages] = useState([] as Message[]);
  const [error, setError] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [createMessageError, setCreateMessageError] = useState('');
  const [editText, setEditText] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    if (!roomTitle) return;
    // if (!isLoggedIn) return;
    const loadMessages = () => {
      fetch(`http://localhost:5000/messages?room=${roomTitle}`)
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
console.log("a" , roomTitle);
    return () => ws.close();
  }, [roomTitle]);

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
        body: JSON.stringify({ text: newMessageText, author: author, room: roomTitle, }),
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


  const handleUpdateMessage = async (messageId: number, messageAuthor: string, editingText: string) => {
  // Check if the logged-in user is the author
  if (messageAuthor !== author) {
    alert('To update this section you must be the author.');
    return;
  }

  // Ensure the editing title is not empty
  if (!editingText.trim()) {
    alert('Message text cannot be empty');
    return;
  }

  try {
    // Make the PUT request to update the room title
    const updateRes = await fetch(`http://localhost:5000/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editingText }),  // Use editingTitle

    });

    if (!updateRes.ok) {
      const data = await updateRes.json();
      alert(data.message || 'Failed to update message');
      setEditText(null);

      // return;
    }

    // Update the state to reflect the room update
    setMessages((prevRooms) =>
      prevRooms.map((m) => (m.id === messageId ? { ...m, text: editingText } : m)),
    );

    // Exit edit mode after successful update
    setEditText(null);
  } catch (err) {
    alert('Failed to update room');
    setEditText(null);
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

  const handleEnterKey = (e: React.KeyboardEvent, messageId: number) => {
    if (e.key === 'Enter') {
      handleUpdateMessage(messageId, author, editingText);
    }
  };

  const handleMessageEdit = (
    messageId: number,
    messageText: string,
    messageAuthor: string,
  ) => {
    // Check if the logged-in user is the author of the room
    if (messageAuthor !== author) {
      alert('You must be the author of the room to edit it.');
      return;
    }

    // Enter edit mode and set the current room title for editing
    setEditText(messageId); // Set the room id to be edited
    setEditingText(messageText); // Set the current room title to be edited
  };


  // const filteredMessages = messages.filter((m) => m.room === room);
  // const roomHeading = roomTitle.toUpperCase();
  return (
    <div>
      <h1>JOIN FANS OF {roomTitle}</h1>
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
        {messages.map((message) => (
          <li key={message.id}>
            {/* <strong>{message.author}:</strong> {message.text}
            <div onClick={() => handleDeleteMessage(message.id, message.author)}>X</div>
          </li> */}

                  {editText === message.id ? (
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, message.id)}
                      style={{ marginRight: '10px' }}
                    />
            ) : (
                <div>
                    <strong>{message.author}:</strong> {message.text}
                </div>

                  )}

                  {editText === message.id ? (
                    <button
                      onClick={() => {

                        handleUpdateMessage(message.id, message.author, editingText); // Call the update function
                      }}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleMessageEdit(message.id, message.text, message.author)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id, message.author)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
        ))}
      </ul>
    </div>
  );
};
