"use client";

import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsOnline } from "@/lib/hooks/useIsOnline";

export function OfflineIndicator() {
  const isOnline = useIsOnline();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 20, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 20, opacity: 0, x: "-50%" }}
          className="fixed bottom-24 left-1/2 z-[100] w-[min(90vw,400px)] pointer-events-none"
        >
          <div className="bg-destructive text-destructive-foreground px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 border border-white/10 backdrop-blur-xl bg-opacity-95 pointer-events-auto">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <WifiOff className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                You are offline
              </span>
              <span className="text-[11px] opacity-80 leading-tight">
                Changes will be saved once you reconnect
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
