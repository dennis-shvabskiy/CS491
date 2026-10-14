import React from 'react';
import Lottie from 'react-lottie';
import moods from '../assets/moods.json';

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to My App</h1>
      <p>This is just a demo</p>

      {/* Lottie Container */}
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Lottie 
          animationData={moods} 
          loop={true} 
          autoplay={true} 
        />
      </div>
    </main>
  );
}