import React from 'react';

export const ThreeDObjectLayer: React.FC<{ videoSrc?: string }> = ({ videoSrc }) => {
  if (!videoSrc) return null;
  return (
    <video
      src={videoSrc}
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        filter: 'blur(8px) brightness(0.7)',
        zIndex: 5,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}; 