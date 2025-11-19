import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

interface Room {
  id: number;
  title: string;
}
export const App = () => {
  const [rooms, setRooms] = useState([] as Room[]);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [createRoomError, setCreateRoomError] = useState('');

  const [activeUser, setActiveUser] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    try {
      // 1️⃣ Fetch existing users
      const usersRes = await fetch('http://localhost:5000/users');
      if (!usersRes.ok) throw new Error('Failed to fetch users');

      const users = await usersRes.json();

      // 2️⃣ Check if user already exists
      const existingUser = users.find((u) => u.name === username);

      if (existingUser) {
        // If user exists → login without creating
        setIsLoggedIn(true);
        setActiveUser(username);
        setUsername(''); // clear input
        console.log(users);
        return;
      }

      // 3️⃣ Create new user if not found
      const createRes = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: username }),
      });

      if (!createRes.ok) {
        throw new Error('Failed to create user');
      }

      const createdUser = await createRes.json();
      console.log('Created user:', createdUser);

      // 4️⃣ Log in and clear input
      setIsLoggedIn(true);
      setActiveUser(username);
      setUsername('');

    } catch (err) {
      setError('Failed to connect to the server');
      setUsername('');
    }
  };



//   const fetchRooms = async () => {
//     try {
//       const res = await fetch('http://localhost:5000/rooms');
//       if (!res.ok) throw new Error('Failed to fetch rooms');
//       const data = await res.json();
//       setRooms(data);
//     } catch {
//       setError('Failed to load rooms');
//     }
//   };

// useEffect(() => {
//   if (isLoggedIn) {
//     fetchRooms();
//   }
// }, [isLoggedIn]);


//   const handleAddRoom = async (e) => {
//     e.preventDefault();

//     if (!newRoomTitle.trim()) {
//       setCreateRoomError('Title is required');
//       return;
//     }

//     // 1️⃣ Check if room already exists in state
//     const existingRoom = rooms.find((r) => r.title === newRoomTitle);
//     if (existingRoom) {
//       setNewRoomTitle('');
//       return;
//     }

//     try {
//       // 2️⃣ Create new room
//       const res = await fetch('http://localhost:5000/rooms', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ title: newRoomTitle }),
//       });

//       if (!res.ok) throw new Error('Failed to create room');

//       const createdRoom = await res.json();
// console.log('Created room:', createdRoom);
//       // // 3️⃣ Add new room to state
//       // setRooms((prev) => [...prev, createdRoom]);
//       setNewRoomTitle('');
//     } catch (err) {
//       setCreateRoomError('Failed to connect to the server');
//       setNewRoomTitle('');
//     }
//   };

  useEffect(() => {
    if (!isLoggedIn) return;

    // Fetch rooms once on login
    const loadRooms = () => {
      fetch('http://localhost:5000/rooms')
        .then((res) => res.json())
        .then((data) => setRooms(data))
        .catch(() => setError('Failed to load rooms'));
    };

    loadRooms(); // initial fetch

    // WebSocket connection
    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Handle server events
      if (
        message.type === 'roomCreated' ||
        message.type === 'roomUpdated' ||
        message.type === 'roomDeleted'
      ) {
        loadRooms(); // refresh room list
      }
    };

    ws.onerror = () => setError('WebSocket connection error');

    // Cleanup on logout or unmount
    return () => {
      ws.close();
    };
  }, [isLoggedIn]);



const handleAddRoom = async (e) => {
  e.preventDefault();

  if (!newRoomTitle.trim()) {
    setCreateRoomError('Title is required');
    return;
  }

  try {
    // 1️⃣ Fetch existing users
    const roomsRes = await fetch('http://localhost:5000/rooms');
    if (!roomsRes.ok) throw new Error('Failed to fetch rooms');

    const rooms = await roomsRes.json();

    // 2️⃣ Check if user already exists
    const existingRoom = rooms.find((r) => r.title === newRoomTitle);

    if (existingRoom) {
      // If user exists → login without creating
      //setIsLoggedIn(true);
      setNewRoomTitle(''); // clear input
      console.log(rooms);
      return;
    }

    // 3️⃣ Create new user if not found
    const createRes = await fetch('http://localhost:5000/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newRoomTitle }),
    });

    if (!createRes.ok) {
      throw new Error('Failed to create room');
    }

    const createdRoom = await createRes.json();
    console.log('Created room:', createdRoom);
    setRooms([...rooms, createdRoom]);
    // 4️⃣ Log in and clear input
    //setIsLoggedIn(true);
    setNewRoomTitle('');
  } catch (err) {
    setCreateRoomError('Failed to connect to the server');
    setNewRoomTitle('');
  }
};





  // const handleAddRoom = async () => {
  //   setCreateRoomError('');

  //   if (!newRoomTitle.trim()) {
  //     setCreateRoomError('Please enter a hobby.');
  //     return;
  //   }

  //   try {
  //     const res = await fetch('http://localhost:5000/rooms', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ title: newRoomTitle }), // backend expects {title}
  //     });

  //     if (!res.ok) {
  //       setCreateRoomError('Failed to create room. Check internet connection.');
  //       return;
  //     }

  //     const createdRoom = await res.json();

  //     // Append new room to bottom of list
  //     setRooms([...rooms, createdRoom]);

  //     setNewRoomTitle('');
  //   } catch (err) {
  //     setCreateRoomError('Failed to create room. Check internet connection.');
  //     setNewRoomTitle('');
  //   }
  // };

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
        <div>
          <h1>Choose your interest</h1>
          <ul>
            {rooms.map((room) => (
              <li key={room.id}>
                {/* <NavLink to={`/rooms/${room.title}`}>{room.title}</NavLink> */}
                {room.title}
              </li>
            ))}
          </ul>

          {/* new room creation section */}
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
      )}
    </>
  );
};


export default App;
