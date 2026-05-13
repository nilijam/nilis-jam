import { useState } from 'react';
import EventCard from '../components/EventCard';
import './Events.css';

// 1 EUR ≈ 655 FCFA / 1 GBP ≈ 760 FCFA / 1 USD ≈ 600 FCFA
const EVENTS_DATA = [
  // ── Événements Gabonais ──────────────────────────────────────
  {
    id: 101,
    type: 'festival',
    gabon: true,
    artist: 'Patience Dabany & Invités',
    title: 'Festival de Musique Gabonaise',
    date: '14 Juil 2025',
    location: 'Stade de l\'Amitié, Libreville',
    price: '5 000 – 15 000 FCFA',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=225&fit=crop',
  },
  {
    id: 102,
    type: 'concert',
    gabon: true,
    artist: 'Oliver Ngoma',
    title: 'Nuit de la Rumba Gabonaise',
    date: '2 Août 2025',
    location: 'Palais des Sports, Libreville',
    price: '3 000 – 10 000 FCFA',
    image: 'https://images.unsplash.com/photo-1501386761578-eaa54b8a7b0e?w=400&h=225&fit=crop',
  },
  {
    id: 103,
    type: 'festival',
    gabon: true,
    artist: 'Divers Artistes',
    title: 'Gabon Music Festival',
    date: '20 Sept 2025',
    location: 'Esplanade du Bord de Mer, Libreville',
    price: 'Gratuit – 8 000 FCFA',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=225&fit=crop',
  },
  {
    id: 104,
    type: 'showcase',
    gabon: true,
    artist: 'Artistes Emergents Gabonais',
    title: 'Showcase New Generation Gabon',
    date: '5 Oct 2025',
    location: 'Le Nomad, Libreville',
    price: '2 000 – 5 000 FCFA',
    image: 'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=400&h=225&fit=crop',
  },
  {
    id: 105,
    type: 'club',
    gabon: true,
    artist: 'DJ Mix Gabon',
    title: 'Soirée Ndombolo & Rumba',
    date: 'Tous les vendredis',
    location: 'Club L\'Équateur, Libreville',
    price: '1 000 – 3 000 FCFA',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop',
  },
  {
    id: 106,
    type: 'concert',
    gabon: true,
    artist: 'Rogombe & Friends',
    title: 'Concert Afro-Jazz du Gabon',
    date: '18 Juil 2025',
    location: 'Institut Français, Libreville',
    price: '4 000 – 12 000 FCFA',
    image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=225&fit=crop',
  },

  // ── Événements Internationaux (prix en FCFA) ─────────────────
  {
    id: 1,
    type: 'festival',
    gabon: false,
    artist: 'Burna Boy',
    title: 'African Giant World Tour',
    date: '15 Juin 2025',
    location: 'Stade de France, Paris',
    price: '42 000 – 118 000 FCFA',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&h=225&fit=crop',
  },
  {
    id: 2,
    type: 'concert',
    gabon: false,
    artist: 'Tems',
    title: 'Born in the Wild Tour',
    date: '4 Juil 2025',
    location: 'O2 Arena, Londres',
    price: '34 000 – 91 000 FCFA',
    image: 'https://images.unsplash.com/photo-1501386761578-eaa54b8a7b0e?w=400&h=225&fit=crop',
  },
  {
    id: 3,
    type: 'showcase',
    gabon: false,
    artist: 'Asake',
    title: 'Work of Art Showcase',
    date: '28 Juin 2025',
    location: 'Madison Square Garden, NYC',
    price: '33 000 – 90 000 FCFA',
    image: 'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=400&h=225&fit=crop',
  },
  {
    id: 4,
    type: 'festival',
    gabon: false,
    artist: 'Divers Artistes',
    title: 'Afrobeats Summer Fest',
    date: '10 Août 2025',
    location: 'Accra Sports Stadium, Accra',
    price: '20 000 FCFA',
    image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=400&h=225&fit=crop',
  },
  {
    id: 5,
    type: 'club',
    gabon: false,
    artist: 'Wizkid',
    title: 'Made in Lagos After Party',
    date: '20 Juin 2025',
    location: 'Fabric, Londres',
    price: '19 000 FCFA',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=225&fit=crop',
  },
  {
    id: 6,
    type: 'concert',
    gabon: false,
    artist: 'Davido',
    title: '001 World Tour',
    date: '5 Sept 2025',
    location: 'Ziggo Dome, Amsterdam',
    price: '32 000 – 91 000 FCFA',
    image: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=400&h=225&fit=crop',
  },
  {
    id: 7,
    type: 'showcase',
    gabon: false,
    artist: 'Rema',
    title: 'Calm Down World Tour',
    date: '19 Juil 2025',
    location: 'Palacio de los Deportes, Madrid',
    price: '26 000 – 72 000 FCFA',
    image: 'https://images.unsplash.com/photo-1504680177321-2e6a879aac86?w=400&h=225&fit=crop',
  },
  {
    id: 8,
    type: 'festival',
    gabon: false,
    artist: 'Divers Artistes',
    title: 'Global Beats Festival',
    date: '23 Août 2025',
    location: 'Victoria Island, Lagos',
    price: '15 000 FCFA',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=225&fit=crop',
  },
  {
    id: 9,
    type: 'concert',
    gabon: false,
    artist: 'Ayra Starr',
    title: 'The Starr is Born Tour',
    date: '3 Oct 2025',
    location: 'Royal Albert Hall, Londres',
    price: '45 000 – 152 000 FCFA',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b631d5c?w=400&h=225&fit=crop',
  },
];

const FILTER_TYPES = ['Tous', 'concert', 'festival', 'showcase', 'club'];

export default function Events() {
  const [filter, setFilter]     = useState('Tous');
  const [showGabon, setShowGabon] = useState(false);

  const filtered = EVENTS_DATA.filter(e => {
    const typeOk  = filter === 'Tous' || e.type === filter;
    const gabonOk = showGabon ? e.gabon === true : true;
    return typeOk && gabonOk;
  });

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">Events</h1>
      <p className="events-sub">Découvre les concerts, festivals et showcases</p>

      {/* Toggle Gabon */}
      <div className="events-gabon-toggle">
        <button
          className={`gabon-toggle-btn ${showGabon ? 'active' : ''}`}
          onClick={() => setShowGabon(p => !p)}
        >
          🇬🇦 Événements Gabonais {showGabon ? '✓' : ''}
        </button>
      </div>

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
