import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
export const App = () =>{
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/rooms') // backend API
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Choose your interest</h1>
      <ul>
        {rooms.map((room) => (
          <NavLink to={`/rooms/${room.title}`} key={room.id}>
            {room.title}
          </NavLink>
        ))}
      </ul>
    </div>
  );
}
