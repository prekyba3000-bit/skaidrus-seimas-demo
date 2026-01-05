import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const OrbitView = ({ mps, isLoading, onMpSelect }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (mps) {
      // A simple circular layout algorithm
      const newPositions = mps.map((mp, i) => {
        const angle = (i / mps.length) * 2 * Math.PI;
        const radius = 200 + (i % 3) * 50; // Varying radius for depth
        return {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        };
      });
      setPositions(newPositions);
    }
  }, [mps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-2xl text-slate-400">Loading MPs...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {mps &&
        mps.map((mp, i) => (
          <motion.div
            key={mp.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: positions[i]?.x || 0,
              y: positions[i]?.y || 0,
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            whileHover={{ scale: 1.2, zIndex: 10 }}
            onClick={() => onMpSelect(mp)}
            className="absolute cursor-pointer"
          >
            <Avatar className="w-24 h-24 border-4 border-white/10 hover:border-emerald-500 transition-colors duration-300">
              <AvatarImage
                src={mp.photoUrl || undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-800 text-2xl">
                {mp.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <p className="text-center mt-2 text-sm font-bold bg-black/50 px-2 py-1 rounded">
              {mp.name}
            </p>
          </motion.div>
        ))}
    </div>
  );
};

export default OrbitView;
