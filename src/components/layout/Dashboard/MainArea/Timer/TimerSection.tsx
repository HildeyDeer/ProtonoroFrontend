import { Play, Pause, RotateCcw, FolderOpen, ListTodo } from 'lucide-react';
import { useEffect, useState } from 'react';
import styles from './TimerSection.module.css';
import type { TimerMode, TimerState, DroppedCategory } from '../../../../../types';

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  time: number;
  totalTime: number;
  timerState: TimerState;
  mode: TimerMode;
  completedPomodoros: number;
  droppedCategories: DroppedCategory[];
  onToggleTaskCompletion: (categoryId: number, taskId: number) => void;
  onModeChange: (mode: TimerMode) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  formatTime: (s: number) => string;
}

const TimerSection = ({
  time,
  totalTime,
  timerState,
  mode,
  droppedCategories,
  completedPomodoros,
  onToggleTaskCompletion,
  onStart,
  onPause,
  onReset,
  onModeChange,
  formatTime
}: Props) => {

  const [progress, setProgress] = useState(CIRCUMFERENCE);
  const [animatedTasks, setAnimatedTasks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!totalTime) return;
    setProgress(CIRCUMFERENCE * (1 - time / totalTime));
  }, [time, totalTime]);

  const recentCategories = droppedCategories.slice(-2);

  const getSliderPosition = () => {
    switch (mode) {
      case 'pomodoro': return 'translateX(0%)';
      case 'shortBreak': return 'translateX(100%)';
      case 'longBreak': return 'translateX(200%)';
      default: return 'translateX(0%)';
    }
  };

  const handleTaskToggle = (categoryId: number, taskId: number) => {
    // Добавляем задачу в анимированные
    setAnimatedTasks(prev => new Set([...prev, taskId]));
    
    // Вызываем обработчик из DropZone
    onToggleTaskCompletion(categoryId, taskId);
    
    // Через 1 секунду удаляем из анимированных (после завершения анимации)
    setTimeout(() => {
      setAnimatedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
    }, 1000);
  };

  // Получаем все задачи для отображения
  const allTasks = recentCategories.flatMap(c => 
    c.tasks.map(task => ({ ...task, categoryId: c.id }))
  );

  return (
    <div className={`${styles.timerSection} ${styles[mode]}`}>
      <div className={styles.timerLayout}>

        {/* LEFT SIDE - CATEGORIES */}
        <div className={styles.sideDropZone}>
          <div className={styles.sideTitle}>КАТЕГОРИИ</div>
          
          {recentCategories.length > 0 ? (
            recentCategories.map(cat => {
              const done = cat.tasks.filter(t => t.completed).length;
              return (
                <div key={cat.id} className={styles.sideCategory}>
                  <div className={styles.sideCategoryHeader}>
                    <span className={styles.colorDot} style={{ background: cat.color }} />
                    {cat.name}
                    <span className={styles.sideProgress}>
                      {done}/{cat.tasks.length}
                    </span>
                  </div>
                  {cat.tasks.slice(0, 3).map(task => {
                    const isRecentlyCompleted = animatedTasks.has(task.id) && task.completed;
                    return (
                      <div
                        key={task.id}
                        className={`${styles.sideTask} ${task.completed ? styles.completed : ''}`}
                        onClick={() => handleTaskToggle(cat.id, task.id)}
                      >
                        <div className={`${styles.taskCheckbox} ${task.completed ? styles.checked : ''}`}>
                          {task.completed && <span>✓</span>}
                        </div>
                        {task.title}
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <FolderOpen className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>
                Добавьте категории в рабочую зону, они отобразятся здесь
              </p>
            </div>
          )}
        </div>

        {/* CENTER */}
        <div className={styles.timerContent}>

          {/* MODE SLIDER - над таймером */}
          <div className={styles.timerModeSlider}>
            <div
              className={styles.sliderIndicator}
              style={{ transform: getSliderPosition() }}
            />
            <div className={styles.sliderTrack}>
              <button
                className={`${styles.sliderSegment} ${mode === 'pomodoro' ? styles.active : ''}`}
                onClick={() => onModeChange('pomodoro')}
              >
                Помодоро
              </button>
              <button
                className={`${styles.sliderSegment} ${mode === 'shortBreak' ? styles.active : ''}`}
                onClick={() => onModeChange('shortBreak')}
              >
                Разминка
              </button>
              <button
                className={`${styles.sliderSegment} ${mode === 'longBreak' ? styles.active : ''}`}
                onClick={() => onModeChange('longBreak')}
              >
                Отдых
              </button>
            </div>
          </div>

          {/* TIMER CIRCLE */}
          <div className={styles.timerCircle}>
            <svg className={styles.circleSvg} viewBox="-10 -10 300 300">
              <circle
                cx="140"
                cy="140"
                r={RADIUS}
                className={styles.circleBg}
              />
              <circle
                cx="140"
                cy="140"
                r={RADIUS}
                className={styles.circleProgress}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={progress}
              />
            </svg>

            <div className={styles.timerDisplay}>
              <div className={styles.timerValue}>{formatTime(time)}</div>
              <div className={styles.timerLabel}>
                {mode === 'pomodoro' && 'ФОКУС'}
                {mode === 'shortBreak' && 'ПЕРЕРЫВ'}
                {mode === 'longBreak' && 'ОТДЫХ'}
              </div>
            </div>
          </div>

          {/* CONTROLS */}
          <div className={styles.timerControls}>
            <button
              className={`${styles.timerBtn} ${timerState === 'running' ? styles.active : ''}`}
              onClick={timerState === 'running' ? onPause : onStart}
            >
              {timerState === 'running' ? <Pause /> : <Play />}
            </button>

            <button className={styles.timerBtn} onClick={onReset}>
              <RotateCcw />
            </button>
          </div>

        </div>

        {/* RIGHT SIDE - TASKS */}
        <div className={styles.sideDropZone}>
          <div className={styles.sideTitle}>ЗАДАЧИ</div>
          
          {recentCategories.length > 0 ? (
            allTasks
              .slice(0, 6)
              .map(task => {
                const isRecentlyCompleted = animatedTasks.has(task.id) && task.completed;
                return (
                  <div
                    key={task.id}
                    className={`${styles.sideTask} ${task.completed ? styles.completed : ''}`}
                    onClick={() => handleTaskToggle(task.categoryId, task.id)}
                  >
                    <div className={`${styles.taskCheckbox} ${task.completed ? styles.checked : ''}`}>
                      {task.completed && <span>✓</span>}
                    </div>
                    {task.title}
                  </div>
                );
              })
          ) : (
            <div className={styles.emptyState}>
              <ListTodo className={styles.emptyStateIcon} />
              <p className={styles.emptyStateText}>
                Перетащите задачи из категорий, чтобы отслеживать их здесь
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TimerSection;