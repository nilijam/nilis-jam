import './MusicLoader.css';

export default function MusicLoader({ text = 'Chargement…', size = 'md' }) {
  return (
    <div className={`music-loader music-loader--${size}`}>
      <div className="music-loader__notes">
        <span className="music-note n1">♩</span>
        <span className="music-note n2">♪</span>
        <span className="music-note n3">♫</span>
        <span className="music-note n4">♬</span>
      </div>
      {text && <p className="music-loader__text">{text}</p>}
    </div>
  );
}