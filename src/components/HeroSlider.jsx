// src/components/HeroSlider.jsx
import { motion } from "framer-motion";

const images = [
  "/dog1.jpg",
  "/dog2.jpg",
  "/dog3.jpg",
];

export default function HeroSlider() {
  return (
    <div className="h-screen w-full overflow-hidden relative">
      {images.map((img, i) => (
        <motion.img
          key={i}
          src={img}
          alt={`dog-${i}`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: i * 5 }}
        />
      ))}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40" />
    </div>
  );
}
