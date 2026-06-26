import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import analyzingAudioIconImg from '../../assets/icons/analyzing_audio_icon.png';
import analyzingSceneImg from '../../assets/images/analyzing_scene.png';
import generatingMinutesIconImg from '../../assets/icons/generating_minutes_icon.png';
import generatingSceneImg from '../../assets/images/generating_scene.png';

const IMAGES = [
  analyzingAudioIconImg,
  analyzingSceneImg,
  generatingMinutesIconImg,
  generatingSceneImg,
];

interface LoadingAnimationProps {
  title: string;
  subtitle?: string;
}

export function LoadingAnimation({ title, subtitle }: LoadingAnimationProps) {
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setImgIdx(prev => (prev + 1) % IMAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative w-52 h-52">
        <AnimatePresence mode="wait">
          <motion.img
            key={imgIdx}
            src={IMAGES[imgIdx]}
            alt=""
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </AnimatePresence>
      </div>
      <p className="text-base font-medium text-[#1A1D2E] mt-4">{title}</p>
      {subtitle && <p className="text-sm text-[#9CA3AF] mt-1">{subtitle}</p>}
    </div>
  );
}
