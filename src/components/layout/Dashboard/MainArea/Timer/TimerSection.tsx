import { Play, Pause, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './TimerSection.module.css';
import type { TimerMode, TimerState } from '../../../../../types';

const RADIUS = 135;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  time: number;
  totalTime: number;
  timerState: TimerState;
  mode: TimerMode;
  completedPomodoros: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  formatTime: (s: number) => string;
}

const TimerSection = ({
  time,
  totalTime,
  timerState,
  mode,
  completedPomodoros,
  onStart,
  onPause,
  onReset,
  onModeChange,
  formatTime
}: Props) => {

  const [progress, setProgress] = useState(CIRCUMFERENCE);

  useEffect(() => {
    if (!totalTime) return;
    setProgress(CIRCUMFERENCE * (1 - time / totalTime));
  }, [time, totalTime]);

  const getSliderPosition = () => {
    switch (mode) {
      case 'pomodoro': return 'translateX(0%)';
      case 'shortBreak': return 'translateX(100%)';
      case 'longBreak': return 'translateX(200%)';
      default: return 'translateX(0%)';
    }
  };

  return (
    <div className={`${styles.timerSection} ${styles[mode]}`}>
      <div className={styles.timerContent}>

        <div className={styles.timerModeSlider}>
          <div
            className={styles.sliderIndicator}
            style={{ transform: getSliderPosition() }}
          />
          <div className={styles.sliderTrack}>
            <button
              className={`${styles.sliderSegment} ${mode === 'pomodoro' && styles.active}`}
              onClick={() => onModeChange('pomodoro')}
            >
              Помодоро
            </button>
            <button
              className={`${styles.sliderSegment} ${mode === 'shortBreak' && styles.active}`}
              onClick={() => onModeChange('shortBreak')}
            >
              Разминка
            </button>
            <button
              className={`${styles.sliderSegment} ${mode === 'longBreak' && styles.active}`}
              onClick={() => onModeChange('longBreak')}
            >
              Отдых
            </button>
          </div>
        </div>

        <div className={styles.timerCircle}>
          <svg className={styles.circleSvg} viewBox="0 0 280 280">
            <circle
              className={styles.circleBackground}
              cx="140"
              cy="140"
              r={RADIUS}
            />
            <circle
              className={styles.circleProgress}
              cx="140"
              cy="140"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={progress}
            />
          </svg>

          <div className={styles.timerDisplay}>
            <div className={styles.timerValue}>
              {formatTime(time)}
            </div>
            <div className={styles.timerLabel}>
              {mode === 'pomodoro' && 'ФОКУС'}
              {mode === 'shortBreak' && 'РАЗМИНКА'}
              {mode === 'longBreak' && 'ОТДЫХ'}
            </div>
          </div>
        </div>

        <div className={styles.timerControls}>
          <button
            className={`${styles.timerBtn} ${timerState === 'running' && styles.active}`}
            onClick={timerState === 'running' ? onPause : onStart}
          >
            {timerState === 'running' ? <Pause /> : <Play />}
          </button>

          <button
            className={styles.timerBtn}
            onClick={onReset}
          >
            <RotateCcw />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TimerSection;
