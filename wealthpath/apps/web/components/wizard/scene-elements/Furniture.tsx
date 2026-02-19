"use client";

import { motion } from "framer-motion";

interface FurnitureProps {
  x: number;
  y: number;
  level: number; // 0-1, how much furniture
  scale?: number;
}

export default function Furniture({ x, y, level, scale = 1 }: FurnitureProps) {
  const s = scale;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: level > 0 ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Armchair */}
      {level > 0.1 && (
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Back */}
          <rect
            x={x - 10 * s}
            y={y - 20 * s}
            width={20 * s}
            height={12 * s}
            fill="#B45309"
            rx={3 * s}
          />
          {/* Seat */}
          <rect
            x={x - 12 * s}
            y={y - 10 * s}
            width={24 * s}
            height={8 * s}
            fill="#D97706"
            rx={2 * s}
          />
          {/* Legs */}
          <rect x={x - 10 * s} y={y - 2 * s} width={3 * s} height={4 * s} fill="#78350F" />
          <rect x={x + 7 * s} y={y - 2 * s} width={3 * s} height={4 * s} fill="#78350F" />
        </motion.g>
      )}

      {/* Side table */}
      {level > 0.3 && (
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <rect
            x={x + 18 * s}
            y={y - 13 * s}
            width={12 * s}
            height={2 * s}
            fill="#92400E"
            rx={1}
          />
          <rect x={x + 22 * s} y={y - 11 * s} width={3 * s} height={11 * s} fill="#78350F" />
          {/* Lamp on table */}
          {level > 0.5 && (
            <g>
              <rect x={x + 22.5 * s} y={y - 22 * s} width={2 * s} height={9 * s} fill="#A8A29E" />
              <polygon
                points={`${x + 18 * s},${y - 22 * s} ${x + 29 * s},${y - 22 * s} ${x + 23.5 * s},${y - 30 * s}`}
                fill="#FBBF24"
                opacity={0.7}
              />
            </g>
          )}
        </motion.g>
      )}

      {/* Bookshelf */}
      {level > 0.5 && (
        <motion.g
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <rect
            x={x + 35 * s}
            y={y - 35 * s}
            width={15 * s}
            height={35 * s}
            fill="#92400E"
          />
          {/* Books */}
          {[0, 1, 2].map((shelf) => (
            <g key={shelf}>
              {/* Shelf */}
              <rect
                x={x + 35 * s}
                y={y - 25 * s + shelf * 10 * s}
                width={15 * s}
                height={1 * s}
                fill="#78350F"
              />
              {/* Book spines */}
              {[0, 1, 2, 3].map((book) => (
                <rect
                  key={book}
                  x={x + (36 + book * 3.5) * s}
                  y={y - (34 - shelf * 10) * s}
                  width={2.5 * s}
                  height={8 * s}
                  fill={
                    ["#EF4444", "#3B82F6", "#10B981", "#F59E0B"][book]
                  }
                  rx={0.5}
                />
              ))}
            </g>
          ))}
        </motion.g>
      )}
    </motion.g>
  );
}
