import './Loader.css';

export default function Loader({ fullscreen = false, message = 'Chargement...' }) {
  return (
    <div className={`loader-wrap ${fullscreen ? 'loader-fullscreen' : ''}`}>
      <div className="loader-icon-wrap">
        <div className="loader-ring loader-ring-1" />
        <div className="loader-ring loader-ring-2" />
        <div className="loader-note">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 36V14l22-4v22"
              stroke="url(#ng)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            <circle cx="13" cy="36" r="5" fill="url(#nf)" />
            <circle cx="35" cy="32" r="5" fill="url(#nf2)" />
            <defs>
              <linearGradient id="ng" x1="18" y1="14" x2="40" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b06aff"/>
                <stop offset="1" stopColor="#ff5eaa"/>
              </linearGradient>
              <linearGradient id="nf" x1="8" y1="31" x2="18" y2="41" gradientUnits="userSpaceOnUse">
                <stop stopColor="#b06aff"/>
                <stop offset="1" stopColor="#7c3aed"/>
              </linearGradient>
              <linearGradient id="nf2" x1="30" y1="27" x2="40" y2="37" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ff5eaa"/>
                <stop offset="1" stopColor="#b06aff"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="loader-bars">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="loader-bar" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>

      <p className="loader-label">{message}</p>
    </div>
  );
}
