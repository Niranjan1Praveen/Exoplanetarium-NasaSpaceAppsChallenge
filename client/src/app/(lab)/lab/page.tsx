"use client";
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Orbit, Target, Sparkles } from 'lucide-react';

interface Model {
  id: number;
  name: string;
  icon: React.ElementType;
  description: string;
  accuracy: string;
  planets: string;
}

const ExoplanetDashboard: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const models: Model[] = [
    {
      id: 1,
      name: "Transit Photometry",
      icon: Target,
      description: "Detects exoplanets by measuring the dimming of a star's light as a planet passes in front of it. This method has discovered thousands of exoplanets and provides crucial data about planetary size and orbital period.",
      accuracy: "95%",
      planets: "4,000+"
    },
    {
      id: 2,
      name: "Radial Velocity",
      icon: Orbit,
      description: "Identifies exoplanets by detecting the wobble in a star's motion caused by gravitational pull. This technique reveals planetary mass and orbital characteristics with remarkable precision.",
      accuracy: "92%",
      planets: "1,000+"
    },
    {
      id: 3,
      name: "Direct Imaging",
      icon: Sparkles,
      description: "Captures actual images of exoplanets by blocking out the star's light. While challenging, this method provides direct visual confirmation and spectroscopic data about distant worlds.",
      accuracy: "88%",
      planets: "100+"
    }
  ];

  const orbitVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 relative overflow-hidden">
      {/* Animated background orbits */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            variants={orbitVariants}
            animate="animate"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
            }}
          >
            <div className="w-full h-full border border-white/5 rounded-full" />
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 15 - i * 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-0 left-1/2 w-2 h-2 bg-white/20 rounded-full"
              style={{ originX: 0.5, originY: `${150 + i * 100}px` }}
            />
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1
            className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-300 to-white"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Exoplanet Detection Models
          </motion.h1>
          <p className="text-xl text-gray-400">
            Exploring distant worlds through advanced astronomical techniques
          </p>
        </motion.div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {models.map((model, index) => {
            const Icon = model.icon;
            return (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                onHoverStart={() => setHoveredCard(model.id)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative group"
              >
                <motion.div
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/10 relative overflow-hidden"
                  whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glowing effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredCard === model.id ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className="mb-6 relative"
                    animate={{
                      rotate: hoveredCard === model.id ? 360 : 0
                    }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                        
                    </div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-4">{model.name}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {model.description}
                  </p>

                  {/* Stats */}
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Accuracy
                      </p>
                      <p className="text-lg font-semibold">{model.accuracy}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        Discovered
                      </p>
                      <p className="text-lg font-semibold">{model.planets}</p>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: hoveredCard === model.id ? 1 : 0,
                      scaleX: hoveredCard === model.id ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-8 bg-white/5 backdrop-blur-sm rounded-full px-8 py-4 border border-white/10">
            <div>
              <p className="text-3xl font-bold">5,500+</p>
              <p className="text-sm text-gray-400">Total Exoplanets</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-gray-400">Detection Methods</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div>
              <p className="text-3xl font-bold">92%</p>
              <p className="text-sm text-gray-400">Avg. Accuracy</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default ExoplanetDashboard;