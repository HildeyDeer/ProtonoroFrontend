export type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  progress: number;
  completed: boolean;
};

export type Category = {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
};

export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
export type TimerState = 'running' | 'paused' | 'stopped';

export type DroppedCategory = {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
  position: number;

  
};

export interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  notifications: boolean;
  sound: boolean;
  darkMode: boolean;
};

