"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  if (isStandalone) {
    return null; // Don't show button if already installed
  }

  // For Android / Desktop Chrome where beforeinstallprompt fires
  if (deferredPrompt) {
    return (
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Add to Home</span>
      </button>
    );
  }

  // For iOS - show a hint or a specific button that opens a modal with instructions
  if (isIOS) {
    return (
      <button
        onClick={() => alert("To install on iOS: Tap the Share button and select 'Add to Home Screen'")}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors"
      >
        <Share className="w-4 h-4" />
        <span className="hidden sm:inline">Add to Home</span>
      </button>
    );
  }

  return null;
}
