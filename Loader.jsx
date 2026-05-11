import './Loader.css';

export default function Loader({ fullscreen = false, message = 'Chargement...' }) {
  return (
    <div className={`loader-wrap ${fullscreen ? 'loader-fullscreen' : ''}`}>
      <div className="loader-bars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="loader-bar" style={{ animationDelay: `${i * 0.1}s` }} />
        ))}
      </div>
      <p className="loader-label">{message}</p>
    </div>
  );
}
