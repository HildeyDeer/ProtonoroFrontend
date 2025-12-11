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

export type TimerState = 'stopped' | 'running' | 'paused';

export type DroppedCategory = {
  id: number;
  name: string;
  color: string;
  tasks: Task[];
  position: number;
};