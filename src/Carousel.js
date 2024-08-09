import React, { useState, useRef, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { fetchPopularTracks } from './spotify'; // Ensure this file exists
import './Carousel.css'; // Ensure this file exists

const Carousel = () => {
  const [tracks, setTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false); // State to toggle menu visibility
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const startX = useRef(0);
  const startXRef = useRef(0);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        const popularTracks = await fetchPopularTracks();
        setTracks(popularTracks);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tracks', error);
        setLoading(false);
      }
    };
    loadTracks();
  }, []);

  useEffect(() => {
    if (audio) {
      const handleAudioEnd = () => setPlaying(false);
      audio.addEventListener('ended', handleAudioEnd);
      return () => {
        audio.removeEventListener('ended', handleAudioEnd);
        audio.pause();
        setAudio(null);
      };
    }
  }, [audio]);

  const playPreview = (previewUrl) => {
    if (!previewUrl) {
      setError('No preview URL available for this track.');
      return;
    }

    try {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
      
      const newAudio = new Audio(previewUrl);
      newAudio.play().then(() => setPlaying(true)).catch(error => {
        console.error('Error playing audio', error);
        setPlaying(false);
      });
      setAudio(newAudio);
      setError('');
    } catch (error) {
      console.error('Error handling audio playback', error);
    }
  };

  const handleStart = (event) => {
    setDragging(true);
    startX.current = event.clientX || (event.touches && event.touches[0]?.clientX);
    startXRef.current = x.get();
    event.preventDefault();
  };

  const handleMove = (event) => {
    if (!dragging) return;

    const currentX = event.clientX || (event.touches && event.touches[0]?.clientX);
    if (currentX === undefined) return; // Guard clause for undefined clientX

    const deltaX = currentX - startX.current;
    api.start({ x: startXRef.current + deltaX });
    event.preventDefault();
  };

  const handleEnd = async () => {
    if (!dragging) return;
    setDragging(false);

    const screenWidth = window.innerWidth;
    const currentX = x.get();

    try {
      if (currentX < -screenWidth / 3) {
        // Disliked
        console.log('Disliked:', tracks[currentIndex]);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
        await api.start({ x: -screenWidth }); // Move out of view
        api.start({ x: 0 }); // Reset the card position
      } else if (currentX > screenWidth / 3) {
        // Liked
        console.log('Liked:', tracks[currentIndex]);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
        await api.start({ x: screenWidth }); // Move out of view
        api.start({ x: 0 }); // Reset the card position
      } else {
        // Reset to center
        api.start({ x: 0 });
      }
    } catch (error) {
      console.error('Error handling end', error);
    }
  };

  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
  };

  const handleLike = () => {
    console.log('Liked:', tracks[currentIndex]);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    api.start({ x: window.innerWidth }).then(() => api.start({ x: 0 }));
  };

  const handleDislike = () => {
    console.log('Disliked:', tracks[currentIndex]);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % tracks.length);
    api.start({ x: -window.innerWidth }).then(() => api.start({ x: 0 }));
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove);
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [dragging]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (tracks.length === 0) {
    return <div>No tracks available</div>;
  }

  const currentTrack = tracks[currentIndex];

  return (
    <div className="carousel">
      <div className="hamburger-menu">
        <button
          className={`hamburger-icon ${showMenu ? 'active' : ''}`}
          onClick={handleMenuToggle}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>
      </div>

      <div className={`side-nav ${showMenu ? 'show' : ''}`}>
        <button className="close-btn" onClick={handleMenuToggle}>
          &times;
        </button>
        <ul>
          <li>
            <a href="#!" onClick={handleMenuToggle}>Home</a>
          </li>
          <li>
            <a href="#!" onClick={handleMenuToggle}>About</a>
          </li>
          <li>
            <a href="#!" onClick={handleMenuToggle}>Contact</a>
          </li>
        </ul>
      </div>

      <animated.div
        className="track-card"
        style={{ transform: x.to((x) => `translateX(${x}px)`) }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        <img src={currentTrack.cover} alt={currentTrack.title} className="track-cover" />
        <h2>{currentTrack.title}</h2>
        <p>{currentTrack.artist}</p>
        <button onClick={() => playPreview(currentTrack.previewUrl)} className="play-pause-button">
          {playing ? (
            <i className="fas fa-pause"></i>
          ) : (
            <i className="fas fa-play"></i>
          )}
        </button>
        <div className="action-buttons">
          <button onClick={handleDislike} className="dislike-button">
            <i className="fas fa-times"></i> {/* Icon for dislike */}
          </button>
          <button onClick={handleLike} className="like-button">
            <i className="fas fa-heart"></i> {/* Icon for like */}
          </button>
        </div>
      </animated.div>

      <div className="likes-list">
        <h2>Liked Songs</h2>
        <ul>
          {tracks.filter((_, index) => index < 5).map((track, index) => (
            <li key={index}>
              <img src={track.cover} alt={track.title} className="track-cover-small" />
              <span>{track.title} - {track.artist}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Carousel;
