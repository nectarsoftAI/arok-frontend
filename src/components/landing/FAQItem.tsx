import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type FAQItemProps = {
  question: string;
  answer: string;
};

export function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#E5E7EB] rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#F8F9FC] transition-colors"
      >
        <span className="font-medium text-[#1A1D2E] text-sm">{question}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-[#5B5FF5] flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#6B7280] flex-shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="px-6 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#E5E7EB] pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
