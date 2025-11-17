import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

export const App = () => {
  const [rooms, setRooms] = useState([]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const [newRoom, setNewRoom] = useState(''); 
  const [createRoomError, setCreateRoomError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      // Check if user already exists
      const checkRes = await fetch(
        `http://localhost:5000/users?name=${username}`,
      );
      const users = await checkRes.json();

      if (users.length === 0) {
        // Create new user
        const createRes = await fetch('http://localhost:5000/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username }),
        });

        if (!createRes.ok) {
          setError('Check internet connection');
          return;
        }
      }

      // Success → hide login form
      setIsLoggedIn(true);
    } catch (err) {
      setError('Check internet connection');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:5000/rooms')
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch(() => setError('Failed to load rooms'));
    }
  }, [isLoggedIn]);

  // -----------------------
  // CREATE NEW ROOM HANDLER
  // -----------------------
  const handleAddRoom = async () => {
    setCreateRoomError('');

    if (!newRoom.trim()) {
      setCreateRoomError('Please enter a hobby.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRoom }), // backend expects {title}
      });

      if (!res.ok) {
        setCreateRoomError('Failed to create room. Check internet connection.');
        return;
      }

      const createdRoom = await res.json();

      // Append new room to bottom of list
      setRooms((prev) => [...prev, createdRoom]);

      // Clear input
      setNewRoom('');
    } catch (err) {
      setCreateRoomError('Failed to create room. Check internet connection.');
    }
  };

  return (
    <div>
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
        <div>
          <h1>Choose your interest</h1>
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                <NavLink to={`/rooms/${room.title}`}>{room.title}</NavLink>
              </li>
            ))}
          </ul>

          {/* new room creation section */}
          <div style={{ marginTop: '20px' }}>
            <label>
              <strong>Nothing interesting?</strong>
            </label>
            <br />

            <input
              type="text"
              value={newRoom}
              placeholder="Enter your hobby"
              onChange={(e) => setNewRoom(e.target.value)}
              style={{ marginRight: '10px' }}
            />

            <button onClick={handleAddRoom}>Add your Hobby</button>

            {createRoomError && (
              <p style={{ color: 'red' }}>{createRoomError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
