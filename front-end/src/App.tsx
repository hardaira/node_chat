import { useEffect, useState } from 'react';
import { NavLink, Outlet, useSearchParams } from 'react-router-dom';
import './index.css';

interface Room {
  id: number;
  title: string;
  author: string;
}

export const App = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [createRoomError, setCreateRoomError] = useState('');
  const [activeUser, setActiveUser] = useState('');
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle user login/registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      const usersRes = await fetch('http://localhost:5000/users');
      if (!usersRes.ok) throw new Error('Failed to fetch users');

      const users = await usersRes.json();

      const existingUser = users.find((u: any) => u.name === username);
      if (existingUser) {
        setIsLoggedIn(true);
        setActiveUser(username);
        setUsername('');
        return;
      }

      const createRes = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username }),
      });

      if (!createRes.ok) throw new Error('Failed to create user');

      const createdUser = await createRes.json();
      setIsLoggedIn(true);
      setActiveUser(username);
      setUsername('');
    } catch (err) {
      setError('Failed to connect to the server');
      setUsername('');
    }
  };

  // Fetch rooms and set up WebSocket connection
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadRooms = () => {
      fetch('http://localhost:5000/rooms')
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch(() => setError('Failed to load rooms'));
    };

    loadRooms();

    const ws = new WebSocket('ws://localhost:5000');
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'roomCreated' || message.type === 'roomUpdated' || message.type === 'roomDeleted') {
        loadRooms(); // Refresh room list
      }
    };

    ws.onerror = () => setError('WebSocket connection error');

    return () => {
      ws.close();
    };
  }, [isLoggedIn]);

  // Handle adding a room
  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoomTitle.trim()) {
      setCreateRoomError('Title is required');
      return;
    }

    try {
      const roomsRes = await fetch('http://localhost:5000/rooms');
      const rooms = await roomsRes.json();

      const existingRoom = rooms.find((r: Room) => r.title === newRoomTitle);

      if (existingRoom) {
        setNewRoomTitle('');
        return;
      }

      const createRes = await fetch('http://localhost:5000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRoomTitle, author: activeUser }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create room');
      }

      const createdRoom = await createRes.json();
      setRooms((prevRooms) => [...prevRooms, createdRoom]);
      setNewRoomTitle('');
      console.log(rooms);
    } catch (err) {
      setCreateRoomError('Failed to connect to the server');
      setNewRoomTitle('');
    }
  };

  // Handle updating a room
  const handleUpdateRoom = async (roomId: number, roomAuthor: string, editingTitle: string) => {
  // Check if the logged-in user is the author
  if (roomAuthor !== activeUser) {
    alert('To update this section you must be the author.');
    return;
  }

  // Ensure the editing title is not empty
  if (!editingTitle.trim()) {
    alert('Room title cannot be empty');
    return;
  }

  try {
    // Make the PUT request to update the room title
    const updateRes = await fetch(`http://localhost:5000/rooms/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingTitle }),  // Use editingTitle

    });
console.log(updateRes);
    if (!updateRes.ok) {
      const data = await updateRes.json();
      alert(data.message || 'Failed to update room');
      setEditMode(null);

      // return;
    }

    // Update the state to reflect the room update
    setRooms((prevRooms) =>
      prevRooms.map((r) => (r.id === roomId ? { ...r, title: editingTitle } : r)),
    );
    console.log("aaaa");

    // Exit edit mode after successful update
    setEditMode(null);
  } catch (err) {
    alert('Failed to update room');
    setEditMode(null);
  }
};


  // Handle deleting a room
  const handleDeleteRoom = async (roomId: number, roomAuthor: string) => {
    if (roomAuthor !== activeUser) {
      alert('To delete this section you must be the author.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to delete room');
        return;
      }

      setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomId));
      setActiveRoom(null);
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  // Handle "Enter" to update the room title
  const handleEnterKey = (e: React.KeyboardEvent, roomId: number) => {
    if (e.key === 'Enter') {
      handleUpdateRoom(roomId, activeUser, editingTitle);
    }
  };

  const handleEdit = (
    roomId: number,
    roomTitle: string,
    roomAuthor: string,
  ) => {
    // Check if the logged-in user is the author of the room
    if (roomAuthor !== activeUser) {
      alert('You must be the author of the room to edit it.');
      return;
    }

    // Enter edit mode and set the current room title for editing
    setEditMode(roomId); // Set the room id to be edited
    setEditingTitle(roomTitle); // Set the current room title to be edited
  };

  return (
    <>
      {!isLoggedIn && (
        <div style={{ marginBottom: '20px' }}>
          <h2>Enter your username</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <button type="submit">Submit</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}

      {isLoggedIn && (
        <div className="page">
          <div>
            <h1>Choose your interest</h1>

            <ul>
              {rooms.map((room) => (
                <li key={room.id}>
                  {editMode === room.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleEnterKey(e, room.id)}
                      style={{ marginRight: '10px' }}
                    />
                  ) : (
                    <NavLink
                      // to={`/${room.title}`}
                      to={{
                        pathname: '/messages',
                        search: `?room=${room.title}`,
                      }}
                      onClick={() => {
                        setActiveRoom(room.title);
                        setSearchParams({ room: room.title });
                      }}
                    >
                      {room.title}
                    </NavLink>
                  )}

                  {editMode === room.id ? (
                    <button
                      onClick={() => {
                        // setEditMode(null); // Reset edit mode
                        handleUpdateRoom(room.id, room.author, editingTitle); // Call the update function
                      }}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleEdit(room.id, room.title, room.author)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id, room.author)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>

            <div style={{ marginTop: '20px' }}>
              <p>Nothing interesting?</p>
              <br />

              <form onSubmit={handleAddRoom}>
                <input
                  type="text"
                  value={newRoomTitle}
                  placeholder="Enter Your Hobby"
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <button type="submit">Add Your Hobby</button>
              </form>

              {createRoomError && (
                <p style={{ color: 'red' }}>{createRoomError}</p>
              )}
            </div>
          </div>

          {activeRoom && (
            <div>
              <Outlet context={{ author: activeUser }} />
            </div>
          )}
        </div>
      )}
    </>
  );

};


export default App;
