import { useEffect, useRef } from 'react';

type SoundType = 'hover' | 'click' | 'success' | 'error';

const sounds: Record<SoundType, string> = {
  hover: '/sounds/hover.mp3',
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
};

class SoundManager {
  private static instance: SoundManager;
  private audioElements: Map<SoundType, HTMLAudioElement>;
  private enabled: boolean = false;

  private constructor() {
    this.audioElements = new Map();
    Object.entries(sounds).forEach(([type, src]) => {
      const audio = new Audio(src);
      audio.volume = 0.2;
      this.audioElements.set(type as SoundType, audio);
    });
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(type: SoundType) {
    if (!this.enabled) return;
    const audio = this.audioElements.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

export function useSoundSystem() {
  const soundManager = SoundManager.getInstance();

  const play = (type: SoundType) => {
    soundManager.play(type);
  };

  const toggle = () => {
    soundManager.setEnabled(!soundManager.isEnabled());
  };

  const isEnabled = () => {
    return soundManager.isEnabled();
  };

  return { play, toggle, isEnabled };
}

export default function SoundSystem() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const soundManager = SoundManager.getInstance();

    // Add event listeners for interactive elements
    const handleHover = () => soundManager.play('hover');
    const handleClick = () => soundManager.play('click');

    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleHover);
      element.addEventListener('click', handleClick);
    });

    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleHover);
        element.removeEventListener('click', handleClick);
      });
    };
  }, []);

  return null;
} 