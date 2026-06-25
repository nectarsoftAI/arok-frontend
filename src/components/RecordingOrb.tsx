import { motion } from "motion/react";
import { Mic, Square, CheckCircle2 } from "lucide-react";

interface RecordingOrbProps {
  state: 'idle' | 'recording' | 'finished';
  onToggle: () => void;
  elapsedTime?: string;
}

export function RecordingOrb({ state, onToggle, elapsedTime = "00:00" }: RecordingOrbProps) {
  const isRecording = state === 'recording';
  const isFinished = state === 'finished';

  // Define colors and content based on state
  const getStateConfig = () => {
    switch (state) {
      case 'recording':
        return {
          bgGradient: "linear-gradient(135deg, #5B5FF5 0%, #818CF8 100%)",
          shadow: "inset 0 0 0 1px rgba(91, 95, 245, 0.3), 0 0 20px rgba(91, 95, 245, 0.3), 0 4px 12px rgba(0, 0, 0, 0.1)",
          icon: <Square className="w-6 h-6 text-white fill-white" />,
          badgeText: "녹음 중",
          badgeBg: "bg-[#EEF2FF]",
          badgeTextColor: "text-[#5B5FF5]",
        };
      case 'finished':
        return {
          bgGradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
          shadow: "inset 0 0 0 1px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.2), 0 4px 12px rgba(0, 0, 0, 0.1)",
          icon: <CheckCircle2 className="w-7 h-7 text-white" />,
          badgeText: "녹음 완료",
          badgeBg: "bg-[#ECFDF5]",
          badgeTextColor: "text-[#10B981]",
        };
      default: // idle
        return {
          bgGradient: "#FFFFFF",
          shadow: "inset 0 0 0 1px rgba(209, 213, 219, 0.6), 0 4px 12px rgba(0, 0, 0, 0.08)",
          icon: <Mic className="w-7 h-7 text-[#5B5FF5]" />,
          badgeText: "대기 중",
          badgeBg: "bg-[#F3F4F6]",
          badgeTextColor: "text-[#6B7280]",
        };
    }
  };

  const config = getStateConfig();
  return (
    <div className="relative flex flex-col items-center justify-center py-2" style={{ minHeight: '200px' }}>
      {/* State Badge */}
      <div className="mb-2">
        <div className={`px-2.5 py-0.5 ${config.badgeBg} rounded-full flex items-center gap-1.5`}>
          {isRecording && (
            <motion.div
              className="w-1.5 h-1.5 bg-[#EF4444] rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
          <span className={`${config.badgeTextColor} text-xs font-medium`}>{config.badgeText}</span>
        </div>
      </div>

      {/* Orb Container - Always same size */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        {/* Pulsing Rings - Only when recording */}
        {isRecording && (
          <>
            <motion.div
              className="absolute w-[100px] h-[100px] rounded-full border-2 border-[#5B5FF5]/40"
              animate={{
                scale: [1, 1.75, 1.75],
                opacity: [0.6, 0, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute w-[100px] h-[100px] rounded-full border-2 border-[#5B5FF5]/40"
              animate={{
                scale: [1, 1.75, 1.75],
                opacity: [0.6, 0, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
            <motion.div
              className="absolute w-[100px] h-[100px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(91, 95, 245, 0.2) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}

        {/* Main Button - Always same size, different colors */}
        <button
          onClick={onToggle}
          disabled={isFinished}
          className="relative w-[100px] h-[100px] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 z-10 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: config.bgGradient,
            boxShadow: config.shadow,
          }}
          aria-label={state === 'recording' ? "녹음 중지" : state === 'finished' ? "녹음 완료" : "녹음 시작"}
        >
          {/* Icon */}
          <motion.div
            key={state}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center w-full h-full"
          >
            {config.icon}
          </motion.div>
        </button>
      </div>

      {/* Bottom Text */}
      <div className="mt-3 text-center">
        {isRecording ? (
          <div className="inline-flex items-center gap-2 bg-[#F3F4F6] rounded-full px-5 py-2">
            <motion.div
              className="w-2 h-2 bg-[#EF4444] rounded-full flex-shrink-0"
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="text-lg font-bold text-[#1A1D2E] font-mono tracking-widest tabular-nums">
              {elapsedTime}
            </span>
          </div>
        ) : (
          <p className="text-sm text-[#9CA3AF]">버튼을 눌러 시작</p>
        )}
      </div>
    </div>
  );
}
