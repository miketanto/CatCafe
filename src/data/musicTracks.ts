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
  notes?: MusicNote[];
  src?: string;
};

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "curious-loop",
    label: "Window Light",
    mood: "curious",
    duration: 0,
    src: "/music/chill.m4a",
  },
  {
    id: "happy-loop",
    label: "Sunbeam Hop",
    mood: "happy",
    duration: 0,
    src: "/music/happy.m4a",
  },
  {
    id: "sleepy-loop",
    label: "Moonlit Paws",
    mood: "sleepy",
    duration: 0,
    src: "/music/dream.m4a",
  },
  {
    id: "playful-loop",
    label: "Toy Parade",
    mood: "playful",
    duration: 0,
    src: "/music/lost.m4a",
  },
];
