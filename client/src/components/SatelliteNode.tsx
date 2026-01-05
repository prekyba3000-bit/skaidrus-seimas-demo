import { motion } from "framer-motion";
import { useMemo } from "react";

interface SatelliteNodeProps {
    index: number;
    total: number;
    radius?: number;
    isActive?: boolean;
}

export function SatelliteNode({ index, total, radius = 90, isActive = true }: SatelliteNodeProps) {
    // Randomize start position and speed for organic "swarm" feel
    const randomDelay = useMemo(() => Math.random() * 2, []);
    const randomDuration = useMemo(() => 3 + Math.random() * 2, []);

    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: isActive ? 1 : 0,
                scale: isActive ? 1 : 0,
                x: isActive ? [x - 5, x + 5, x - 5] : 0,
                y: isActive ? [y - 5, y + 5, y - 5] : 0,
            }}
            transition={{
                opacity: { duration: 0.5 },
                scale: { duration: 0.5 },
                x: {
                    duration: randomDuration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: randomDelay
                },
                y: {
                    duration: randomDuration * 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: randomDelay
                }
            }}
            className="absolute w-2 h-2"
            style={{
                left: "50%",
                top: "50%",
                // We set initial position via margin to center the orbit
                marginLeft: x,
                marginTop: y,
            }}
        >
            <div className="w-full h-full rounded-full bg-[#00ffff] shadow-[0_0_8px_#00ffff]" />
            <motion.div
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2, repeat: Infinity, delay: randomDelay }}
                className="absolute inset-0 bg-white rounded-full blur-[1px]"
            />
        </motion.div>
    );
}
