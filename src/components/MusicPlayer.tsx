"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MUSIC_TRACKS } from "@/data/musicTracks";

type MusicPlayerProps = {
  mood: string;
};

type ActiveNode = {
  oscillator: OscillatorNode;
  gain: GainNode;
};

// MusicPlayer sketches a lightweight chiptune loop that can be swapped for custom audio later.
export function MusicPlayer({ mood }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    const initialIndex = MUSIC_TRACKS.findIndex((track) => track.mood === mood);
    return initialIndex === -1 ? 0 : initialIndex;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMoodLinked, setIsMoodLinked] = useState(true);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<ActiveNode[]>([]);
  const loopTimeoutRef = useRef<number | null>(null);
  const beatIntervalRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  const currentTrack = MUSIC_TRACKS[currentTrackIndex] ?? MUSIC_TRACKS[0];

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const stopActiveNodes = useCallback(() => {
    const timeoutId = loopTimeoutRef.current;
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId);
      loopTimeoutRef.current = null;
    }

    activeNodesRef.current.forEach(({ oscillator, gain }) => {
      try {
        oscillator.stop();
      } catch {
        // Node already stopped.
      }
      try {
        oscillator.disconnect();
      } catch {
        // Node already disconnected.
      }
      try {
        gain.disconnect();
      } catch {
        // Gain already disconnected.
      }
    });
    activeNodesRef.current = [];
  }, []);

  const scheduleTrack = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    const track = MUSIC_TRACKS[currentTrackIndex] ?? MUSIC_TRACKS[0];
    if (!track) {
      return;
    }

    let context = audioContextRef.current;
    if (!context) {
      try {
        context = new AudioContext();
        audioContextRef.current = context;
      } catch {
        return;
      }
    }

    if (context.state === "suspended") {
      try {
        await context.resume();
      } catch {
        return;
      }
    }

    stopActiveNodes();

    const startTime = context.currentTime + 0.05;
    const newNodes: ActiveNode[] = [];

    track.notes.forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = note.type ?? "triangle";
      oscillator.frequency.setValueAtTime(note.frequency, startTime + note.time);
      gain.gain.setValueAtTime(note.gain ?? 0.12, startTime + note.time);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(startTime + note.time);
      oscillator.stop(startTime + note.time + note.duration);

      oscillator.onended = () => {
        try {
          oscillator.disconnect();
        } catch {
          // no-op
        }
        try {
          gain.disconnect();
        } catch {
          // no-op
        }
      };

      newNodes.push({ oscillator, gain });
    });

    activeNodesRef.current = newNodes;

    const existingTimeout = loopTimeoutRef.current;
    if (existingTimeout !== null) {
      window.clearTimeout(existingTimeout);
    }

    loopTimeoutRef.current = window.setTimeout(() => {
      if (!isPlayingRef.current) {
        return;
      }
      void scheduleTrack();
    }, track.duration * 1000);
  }, [currentTrackIndex, stopActiveNodes]);

  useEffect(() => {
    if (!isMoodLinked) {
      return;
    }
    const moodIndex = MUSIC_TRACKS.findIndex((track) => track.mood === mood);
    if (moodIndex !== -1 && moodIndex !== currentTrackIndex) {
      setCurrentTrackIndex(moodIndex);
    }
  }, [mood, isMoodLinked, currentTrackIndex]);

  useEffect(() => {
    if (!isPlaying) {
      stopActiveNodes();
      const intervalId = beatIntervalRef.current;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        beatIntervalRef.current = null;
      }
      const context = audioContextRef.current;
      if (context && context.state === "running") {
        context.suspend().catch(() => {
          // Ignore suspend errors.
        });
      }
      return;
    }

    void scheduleTrack();

    const existingInterval = beatIntervalRef.current;
    if (existingInterval !== null) {
      window.clearInterval(existingInterval);
    }

    beatIntervalRef.current = window.setInterval(() => {
      // Keep the interval alive for consistent timing, even without UI.
    }, 420);

    return () => {
      stopActiveNodes();
      const cleanupInterval = beatIntervalRef.current;
      if (cleanupInterval !== null) {
        window.clearInterval(cleanupInterval);
        beatIntervalRef.current = null;
      }
    };
  }, [isPlaying, scheduleTrack, stopActiveNodes]);

  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      const intervalId = beatIntervalRef.current;
      if (intervalId !== null) {
        window.clearInterval(intervalId);
        beatIntervalRef.current = null;
      }
      const timeoutId = loopTimeoutRef.current;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        loopTimeoutRef.current = null;
      }
      stopActiveNodes();
      const context = audioContextRef.current;
      if (context) {
        context.close().catch(() => {
          // Closing context failed, nothing to do.
        });
        audioContextRef.current = null;
      }
    };
  }, [stopActiveNodes]);

  const handlePrev = () => {
    setIsMoodLinked(false);
    setCurrentTrackIndex((index) =>
      (index - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length
    );
  };

  const handleNext = () => {
    setIsMoodLinked(false);
    setCurrentTrackIndex((index) => (index + 1) % MUSIC_TRACKS.length);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    let context = audioContextRef.current;
    if (!context) {
      try {
        context = new AudioContext();
        audioContextRef.current = context;
      } catch {
        return;
      }
    }

    if (context.state === "suspended") {
      context.resume().catch(() => {
        // Ignore resume errors.
      });
    }

    setIsPlaying(true);
  };

  const handleLinkToggle = () => {
    if (isMoodLinked) {
      setIsMoodLinked(false);
      return;
    }

    const moodIndex = MUSIC_TRACKS.findIndex((track) => track.mood === mood);
    if (moodIndex !== -1) {
      setCurrentTrackIndex(moodIndex);
    }
    setIsMoodLinked(true);
  };

  return (
    <section
      className={`music-player ${isPlaying ? "music-player--active" : ""}`}
      aria-label="Cat café music player"
    >
      <div className="music-player__header">
        <span className="music-player__title">Chiptune Bar</span>
        <span className="music-player__badge">{currentTrack.label}</span>
      </div>

      <div className="music-player__controls">
        <button
          type="button"
          onClick={handlePrev}
          className="music-player__button"
          aria-label="Previous track"
        >
          ◄
        </button>
        <button
          type="button"
          onClick={handlePlayPause}
          className="music-player__button music-player__button--primary"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="music-player__button"
          aria-label="Next track"
        >
          ►
        </button>
      </div>

      <div className="music-player__footer">
        <button
          type="button"
          onClick={handleLinkToggle}
          className={`music-player__link ${isMoodLinked ? "music-player__link--active" : ""}`}
        >
          {isMoodLinked ? "Mood linked" : "Link to cat"}
        </button>
      </div>
    </section>
  );
}
