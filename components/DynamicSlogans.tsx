'use client';

import { useEffect, useState } from 'react';

const slogans = [
  "Centoventi Comuni, mille sguardi, una sola Città metropolitana",
  "Dove finisce Roma, inizia un racconto da fotografare",
  "Dai colli ai borghi, un click per valorizzare il territorio",
  "Un click per scoprire la bellezza della Città metropolitana"
];

export default function DynamicSlogans() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slogans.length);
        setIsGlitching(false);
      }, 200);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div 
          className="relative perspective-1000"
          style={{
            transform: `rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`
          }}
        >
          {/* Main slogan container with 3D effect */}
          <div className="relative min-h-[200px] flex items-center justify-center">
            {slogans.map((slogan, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                  index === currentIndex 
                    ? 'opacity-100 scale-100 rotate-0' 
                    : 'opacity-0 scale-50 rotate-12'
                }`}
              >
                <h2 
                  className={`text-3xl md:text-5xl lg:text-6xl font-black text-center px-4 ${
                    isGlitching ? 'animate-glitch' : ''
                  }`}
                  style={{
                    transform: `translateX(${mousePosition.x * 2}px) translateY(${mousePosition.y * 2}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  {/* Multiple text layers for 3D effect */}
                  <span className="relative inline-block">
                    {/* Shadow layers */}
                    <span className="absolute inset-0 text-primary-600 blur-sm" aria-hidden="true">
                      {slogan}
                    </span>
                    <span className="absolute inset-0 text-purple-600 blur-md translate-x-1 translate-y-1" aria-hidden="true">
                      {slogan}
                    </span>
                    
                    {/* Gradient text with animation */}
                    <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-purple-300 to-pink-300 animate-gradient-x">
                      {slogan}
                    </span>
                    
                    {/* Glitch overlay */}
                    {isGlitching && (
                      <>
                        <span className="absolute inset-0 text-red-500 translate-x-1 opacity-70" aria-hidden="true">
                          {slogan}
                        </span>
                        <span className="absolute inset-0 text-blue-500 -translate-x-1 opacity-70" aria-hidden="true">
                          {slogan}
                        </span>
                      </>
                    )}
                  </span>
                </h2>
              </div>
            ))}
          </div>

          {/* Animated dots indicator */}
          <div className="flex justify-center gap-3 mt-12">
            {slogans.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative group transition-all duration-300 ${
                  index === currentIndex ? 'w-12' : 'w-3'
                }`}
              >
                <div className={`h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-primary-400 to-purple-400 shadow-lg shadow-primary-500/50' 
                    : 'bg-white/30 hover:bg-white/50'
                }`} />
                
                {/* Pulse effect on active */}
                {index === currentIndex && (
                  <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-75" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Floating camera icons */}      
      </div>

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan" />
    </section>
  );
}
