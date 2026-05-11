import { useState } from 'react';
import EventCard from '../components/EventCard';
import './Events.css';

const EVENTS_DATA = [
  { id: 1, type: 'festival', artist: 'Burna Boy', title: 'African Giant World Tour', date: 'Jun 15, 2025', location: 'Stade de France, Paris', price: '€65–€180', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=225&fit=crop' },
  { id: 2, type: 'concert', artist: 'Tems', title: 'Born in the Wild Tour', date: 'Jul 4, 2025', location: 'O2 Arena, London', price: '£45–£120', image: 'https://images.unsplash.com/photo-1501386761578-eaa54b8a7b0e?w=400&h=225&fit=crop' },
  { id: 3, type: 'showcase', artist: 'Asake', title: 'Work of Art Showcase', date: 'Jun 28, 2025', location: 'Madison Square Garden, NYC', price: '$55–$150', image: 'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=400&h=225&fit=crop' },
  { id: 4, type: 'festival', artist: 'Various Artists', title: 'Afrobeats Summer Fest', date: 'Aug 10, 2025', location: 'Accra Sports Stadium, Accra', price: 'GH₵200', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=225&fit=crop' },
  { id: 5, type: 'club', artist: 'Wizkid', title: 'Made in Lagos After Party', date: 'Jun 20, 2025', location: 'Fabric, London', price: '£25', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop' },
  { id: 6, type: 'concert', artist: 'Davido', title: '001 World Tour', date: 'Sep 5, 2025', location: 'Ziggo Dome, Amsterdam', price: '€50–€140', image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=225&fit=crop' },
  { id: 7, type: 'showcase', artist: 'Rema', title: 'Calm Down World Tour', date: 'Jul 19, 2025', location: 'Palacio de los Deportes, Madrid', price: '€40–€110', image: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=225&fit=crop' },
  { id: 8, type: 'festival', artist: 'Various Artists', title: 'Global Beats Festival', date: 'Aug 23, 2025', location: 'Victoria Island, Lagos', price: '₦15,000', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=225&fit=crop' },
  { id: 9, type: 'concert', artist: 'Ayra Starr', title: 'The Starr is Born Tour', date: 'Oct 3, 2025', location: 'Royal Albert Hall, London', price: '£60–£200', image: 'https://images.unsplash.com/photo-1540039155733-5bb30b631d5c?w=400&h=225&fit=crop' },
];

const FILTER_TYPES = ['All', 'concert', 'festival', 'showcase', 'club'];

export default function Events() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? EVENTS_DATA : EVENTS_DATA.filter(e => e.type === filter);

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Events</h1>
      <p className="events-sub">Discover live concerts, festivals and showcases</p>

      <div className="events-filters">
        {FILTER_TYPES.map(type => (
          <button
            key={type}
            className={`filter-btn ${filter === type ? 'active' : ''}`}
            onClick={() => setFilter(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      <div className="events-grid">
        {filtered.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
