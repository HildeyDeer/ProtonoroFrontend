import { Play, Pause, RotateCcw, Clock, Target } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './TimerSection.module.css';
import type { TimerState, TimerMode } from '../../../../types/index';

interface TimerSectionProps {
  time: number;
  timerState: TimerState;
  mode: TimerMode;
  completedPomodoros: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: TimerMode) => void;
  formatTime: (seconds: number) => string;
}

const TimerSection = ({
  time,
  timerState,
  mode,
  completedPomodoros,
  onStart,
  onPause,
  onReset,
  onModeChange,
  formatTime
}: TimerSectionProps) => {
  const [isTimeChanging, setIsTimeChanging] = useState(false);

  // Анимация изменения времени
  useEffect(() => {
    if (timerState === 'running') {
      setIsTimeChanging(true);
      const timer = setTimeout(() => {
        setIsTimeChanging(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [time, timerState]);

  // Конфигурация режимов
  const modeConfig = {
    pomodoro: {
      title: 'Время фокусировки',
      label: 'СКОНЦЕНТРИРОВАННАЯ РАБОТА',
      emoji: '🍅'
    },
    shortBreak: {
      title: 'КРАТКИЙ ОТДЫХ',
      label: 'БЫСТРОЕ РАСЛАБЛЕНИЕ',
      emoji: '☕'
    },
    longBreak: {
      title: 'ДОЛГИЙ ОТДЫХ',
      label: 'ПРОДОЛЖИТЕЛЬНЫЙ ОТДЫХ',
      emoji: '🌴'
    }
  };

  const currentMode = modeConfig[mode];

  const handleModeChangeClick = (newMode: TimerMode) => {
    if (newMode !== mode) {
      onModeChange(newMode);
    }
  };

  return (
    <div className={`${styles.timerSection} ${styles[mode]}`}>
      <div className={styles.timerContent}>
        {/* Заголовок с выбором режима - ВВЕРХУ */}
        <div className={styles.timerHeader}>
          <div className={styles.timerModeSelector}>
            <h3>Режимы таймера</h3>
            <div className={styles.modeButtons}>
              <button 
                className={`${styles.modeBtn} ${mode === 'pomodoro' ? styles.active : ''}`}
                onClick={() => handleModeChangeClick('pomodoro')}
                title="сконцентрированная работа"
              >
                🍅 Помодоро
              </button>
              <button 
                className={`${styles.modeBtn} ${mode === 'shortBreak' ? styles.active : ''}`}
                onClick={() => handleModeChangeClick('shortBreak')}
                title="небольшой перерыв"
              >
                ☕Разминка
              </button>
              <button 
                className={`${styles.modeBtn} ${mode === 'longBreak' ? styles.active : ''}`}
                onClick={() => handleModeChangeClick('longBreak')}
                title="длинный перерыв"
              >
                🌴 Длинный перерыв
              </button>
            </div>
          </div>
        </div>

        {/* Таймер - ПО ЦЕНТРУ */}
        <div className={styles.timerDisplay}>
          <span className={`${styles.timerValue} ${isTimeChanging ? styles.changing : ''}`}>
            {formatTime(time)}
          </span>
          <div className={styles.timerLabel}>
            {currentMode.label}
          </div>
        </div>

        {/* Статистика */}
        <div className={styles.timerStats}>
          <span>
            <Clock size={14} />
            {currentMode.title}
          </span>
          <span>
            <Target size={14} />
            Завершенные задачи: {completedPomodoros}
          </span>
        </div>

        {/* Увеличенные кнопки управления */}
        <div className={styles.timerControls}>
          <button 
            className={`${styles.timerBtn} ${timerState === 'running' ? styles.active : ''}`}
            onClick={timerState === 'running' ? onPause : onStart}
            disabled={time === 0}
          >
            {timerState === 'running' ? (
              <>
                <Pause size={16} />
                Пауза
              </>
            ) : (
              <>
                <Play size={16} />
                Старт
              </>
            )}
          </button>
          <button 
            className={styles.timerBtn}
            onClick={onReset}
          >
            <RotateCcw size={16} />
            Сброс
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimerSection;