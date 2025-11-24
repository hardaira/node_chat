import { useParams } from 'react-router-dom';

export default function Room() {
  const { title } = useParams();

  return (
    <div>
      <h2>Room: {title}</h2>
      {/* load messages or hobby details here */}
    </div>
  );
}
