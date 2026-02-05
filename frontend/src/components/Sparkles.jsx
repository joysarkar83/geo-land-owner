import React from 'react';

// Lightweight sparkles effect for dark mode background
export default function Sparkles() {
  return (
    <div aria-hidden="true" className="sparkles fixed inset-0 pointer-events-none z-0" />
  );
}
