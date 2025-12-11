import { Play, Pause, RotateCcw } from 'lucide-react';
import styles from './TimerSection.module.css';
import type { TimerState } from '../../../types/index';

interface TimerSectionProps {
  time: number;
  timerState: TimerState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  formatTime: (seconds: number) => string;
}

const TimerSection = ({
  time,
  timerState,
  onStart,
  onPause,
  onReset,
  formatTime
}: TimerSectionProps) => {
  return (
    <div className={styles.timerSection}>
      <div className={styles.timerHeader}>
        <h3>Today's Focus</h3>
        <div className={styles.timerDisplay}>
          <span className={styles.timerValue}>{formatTime(time)}</span>
          <span className={styles.timerLabel}>MINUTES REMAINING</span>
        </div>
      </div>
      <div className={styles.timerControls}>
        <button 
          className={`${styles.timerBtn} ${timerState === 'running' ? styles.active : ''}`}
          onClick={timerState === 'running' ? onPause : onStart}
          disabled={time === 0}
        >
          {timerState === 'running' ? (
            <>
              <Pause size={16} />
              Pause
            </>
          ) : (
            <>
              <Play size={16} />
              Start
            </>
          )}
        </button>
        <button 
          className={`${styles.timerBtn} ${styles.reset}`}
          onClick={onReset}
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
};

export default TimerSection;