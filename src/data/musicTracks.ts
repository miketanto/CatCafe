export type MusicNote = {
  time: number;
  frequency: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
};

export type MusicTrack = {
  id: string;
  label: string;
  mood: string;
  duration: number;
  notes: MusicNote[];
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "curious-loop",
    label: "Window Light",
    mood: "curious",
    duration: 6,
    notes: [
      { time: 0, frequency: 523.25, duration: 0.45, gain: 0.14, type: "triangle" },
      { time: 0.48, frequency: 659.25, duration: 0.35, gain: 0.12, type: "triangle" },
      { time: 0.9, frequency: 587.33, duration: 0.4, gain: 0.12, type: "triangle" },
      { time: 1.4, frequency: 698.46, duration: 0.45, gain: 0.12, type: "square" },
      { time: 2, frequency: 783.99, duration: 0.5, gain: 0.12, type: "triangle" },
      { time: 2.7, frequency: 659.25, duration: 0.35, gain: 0.13, type: "triangle" },
      { time: 3.2, frequency: 587.33, duration: 0.4, gain: 0.11, type: "triangle" },
      { time: 3.8, frequency: 659.25, duration: 0.35, gain: 0.12, type: "triangle" },
      { time: 4.3, frequency: 698.46, duration: 0.4, gain: 0.11, type: "square" },
      { time: 4.9, frequency: 783.99, duration: 0.45, gain: 0.11, type: "triangle" },
      { time: 5.5, frequency: 659.25, duration: 0.4, gain: 0.11, type: "triangle" },
    ],
  },
  {
    id: "happy-loop",
    label: "Sunbeam Hop",
    mood: "happy",
    duration: 6,
    notes: [
      { time: 0, frequency: 659.25, duration: 0.35, gain: 0.14, type: "square" },
      { time: 0.42, frequency: 783.99, duration: 0.3, gain: 0.13, type: "square" },
      { time: 0.76, frequency: 880, duration: 0.28, gain: 0.13, type: "square" },
      { time: 1.1, frequency: 987.77, duration: 0.35, gain: 0.12, type: "triangle" },
      { time: 1.6, frequency: 880, duration: 0.35, gain: 0.12, type: "square" },
      { time: 2.05, frequency: 783.99, duration: 0.3, gain: 0.12, type: "triangle" },
      { time: 2.4, frequency: 659.25, duration: 0.28, gain: 0.12, type: "triangle" },
      { time: 2.75, frequency: 880, duration: 0.32, gain: 0.13, type: "square" },
      { time: 3.1, frequency: 987.77, duration: 0.3, gain: 0.12, type: "triangle" },
      { time: 3.55, frequency: 1046.5, duration: 0.4, gain: 0.12, type: "triangle" },
      { time: 4.1, frequency: 987.77, duration: 0.28, gain: 0.12, type: "square" },
      { time: 4.4, frequency: 880, duration: 0.32, gain: 0.12, type: "triangle" },
      { time: 4.8, frequency: 783.99, duration: 0.35, gain: 0.12, type: "square" },
      { time: 5.25, frequency: 880, duration: 0.32, gain: 0.12, type: "triangle" },
      { time: 5.6, frequency: 659.25, duration: 0.35, gain: 0.12, type: "triangle" },
    ],
  },
  {
    id: "sleepy-loop",
    label: "Moonlit Paws",
    mood: "sleepy",
    duration: 6.5,
    notes: [
      { time: 0, frequency: 392, duration: 0.6, gain: 0.1, type: "sine" },
      { time: 0.7, frequency: 349.23, duration: 0.5, gain: 0.1, type: "sine" },
      { time: 1.35, frequency: 329.63, duration: 0.55, gain: 0.09, type: "triangle" },
      { time: 2.05, frequency: 293.66, duration: 0.6, gain: 0.09, type: "triangle" },
      { time: 2.8, frequency: 329.63, duration: 0.5, gain: 0.09, type: "triangle" },
      { time: 3.45, frequency: 392, duration: 0.6, gain: 0.1, type: "sine" },
      { time: 4.2, frequency: 349.23, duration: 0.55, gain: 0.09, type: "triangle" },
      { time: 4.95, frequency: 329.63, duration: 0.5, gain: 0.09, type: "triangle" },
      { time: 5.6, frequency: 293.66, duration: 0.6, gain: 0.09, type: "triangle" },
    ],
  },
  {
    id: "playful-loop",
    label: "Toy Parade",
    mood: "playful",
    duration: 5.8,
    notes: [
      { time: 0, frequency: 523.25, duration: 0.25, gain: 0.15, type: "square" },
      { time: 0.28, frequency: 659.25, duration: 0.25, gain: 0.15, type: "square" },
      { time: 0.56, frequency: 698.46, duration: 0.22, gain: 0.14, type: "square" },
      { time: 0.82, frequency: 783.99, duration: 0.22, gain: 0.14, type: "square" },
      { time: 1.1, frequency: 880, duration: 0.22, gain: 0.14, type: "square" },
      { time: 1.38, frequency: 783.99, duration: 0.22, gain: 0.14, type: "square" },
      { time: 1.66, frequency: 698.46, duration: 0.22, gain: 0.14, type: "square" },
      { time: 1.94, frequency: 659.25, duration: 0.22, gain: 0.14, type: "square" },
      { time: 2.22, frequency: 587.33, duration: 0.22, gain: 0.14, type: "square" },
      { time: 2.5, frequency: 523.25, duration: 0.22, gain: 0.14, type: "square" },
      { time: 2.78, frequency: 880, duration: 0.22, gain: 0.14, type: "square" },
      { time: 3.06, frequency: 783.99, duration: 0.22, gain: 0.14, type: "square" },
      { time: 3.34, frequency: 698.46, duration: 0.22, gain: 0.13, type: "square" },
      { time: 3.62, frequency: 587.33, duration: 0.22, gain: 0.13, type: "square" },
      { time: 3.9, frequency: 523.25, duration: 0.22, gain: 0.13, type: "square" },
      { time: 4.18, frequency: 587.33, duration: 0.22, gain: 0.13, type: "square" },
      { time: 4.46, frequency: 659.25, duration: 0.22, gain: 0.13, type: "square" },
      { time: 4.74, frequency: 698.46, duration: 0.22, gain: 0.13, type: "square" },
      { time: 5.02, frequency: 659.25, duration: 0.22, gain: 0.13, type: "square" },
      { time: 5.3, frequency: 523.25, duration: 0.28, gain: 0.13, type: "square" },
    ],
  },
];
