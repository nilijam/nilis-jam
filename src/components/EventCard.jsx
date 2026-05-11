import { useState } from 'react';
import './EventCard.css';

export default function EventCard({ event }) {
  const [interested, setInterested] = useState(event.interested || false);

  return (
    <div className="event-card">
      <div className="event-image-wrap">
        <img src={event.image} alt={event.title} className="event-image" loading="lazy" />
        <span className={`event-type-badge type-${event.type}`}>{event.type}</span>
      </div>
      <div className="event-body">
        <p className="event-artist">{event.artist}</p>
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <span className="event-meta-item"><CalendarIcon /> {event.date}</span>
          <span className="event-meta-item"><LocationIcon /> {event.location}</span>
        </div>
        <div className="event-footer">
          <span className="event-price">{event.price || 'Free'}</span>
          <button
            className={`event-btn ${interested ? 'active' : ''}`}
            onClick={() => setInterested(v => !v)}
          >
            {interested ? '✓ Interested' : 'Interested'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function LocationIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
