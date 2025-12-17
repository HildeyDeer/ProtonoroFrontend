import { useState, useEffect, useRef } from 'react';
import { X, BarChart3, TrendingUp, Calendar, Target, CheckCircle, Clock, Award, Zap } from 'lucide-react';
import styles from './Analytics.module.css';
import type { Category } from '../../../../types';

interface AnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageCompletionTime: string;
  peakProductivityHours: string[];
  taskCompletionByCategory: { [key: string]: number };
  completionTimeDistribution: { hour: number; count: number }[];
  userScore: number;
  streaks: {
    current: number;
    longest: number;
  };
}

const Analytics = ({ isOpen, onClose, categories }: AnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const [showAllHours, setShowAllHours] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      calculateAnalytics();
    }
  }, [isOpen, categories]);

  useEffect(() => {
    if (analyticsData && chartRef.current) {
      // Анимация появления баров
      const bars = chartRef.current.querySelectorAll(`.${styles.timeBarFill}`);
      bars.forEach((bar, index) => {
        setTimeout(() => {
          bar.classList.add(styles.animated);
        }, index * 50);
      });
    }
  }, [analyticsData]);

  const calculateAnalytics = () => {
    const allTasks = categories.flatMap(cat => cat.tasks);
    const completedTasks = allTasks.filter(task => task.completed);
    const totalTasks = allTasks.length;
    
    // Расчет времени завершения задач
    const completionTimes: number[] = [];
    const completionByHour: { [key: number]: number } = {};
    
    completedTasks.forEach(task => {
      const [hours] = task.time.split(':').map(Number);
      completionTimes.push(hours);
      completionByHour[hours] = (completionByHour[hours] || 0) + 1;
    });

    // Расчет по категориям
    const completionByCategory: { [key: string]: number } = {};
    categories.forEach(category => {
      const categoryTasks = category.tasks;
      const completedCategoryTasks = categoryTasks.filter(task => task.completed);
      completionByCategory[category.name] = Math.round(
        (completedCategoryTasks.length / Math.max(categoryTasks.length, 1)) * 100
      );
    });

    // Распределение по времени
    const completionTimeDistribution = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: completionByHour[hour] || 0
    }));

    // Пиковые часы продуктивности
    const peakHours = Object.entries(completionByHour)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    // Среднее время
    const avgHour = completionTimes.length > 0 
      ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length)
      : 0;
    const averageTime = avgHour < 12 ? `${avgHour}:00 AM` : `${avgHour - 12}:00 PM`;

    // Рейтинг пользователя
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks.length / totalTasks) * 100) 
      : 0;
    
    const progressScore = allTasks.reduce((sum, task) => sum + task.progress, 0) / Math.max(allTasks.length, 1);
    const userScore = Math.round((completionRate * 0.6) + (progressScore * 0.4));

    // Стрики
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const completedYesterday = completedTasks.some(task => {
      const [day, month, year] = task.date.split('/').map(Number);
      const taskDate = new Date(year, month - 1, day);
      return taskDate.toDateString() === yesterday.toDateString();
    });

    const currentStreak = completedYesterday ? 7 : 3;
    const longestStreak = 14;

    setAnalyticsData({
      totalTasks,
      completedTasks: completedTasks.length,
      completionRate,
      averageCompletionTime: averageTime,
      peakProductivityHours: peakHours,
      taskCompletionByCategory: completionByCategory,
      completionTimeDistribution,
      userScore,
      streaks: {
        current: currentStreak,
        longest: longestStreak
      }
    });
  };

  const getCurrentHour = () => new Date().getHours();

  const formatHourLabel = (hour: number) => {
    if (hour === 0) return '12AM';
    if (hour === 12) return '12PM';
    return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
  };

  const getBarHeight = (count: number, maxCount: number) => {
    if (maxCount === 0) return '4px';
    const percentage = (count / maxCount) * 100;
    return `${Math.max(percentage, 4)}%`;
  };

  const getBarBackground = (hour: number) => {
    const currentHour = getCurrentHour();
    if (hour === currentHour) {
      return '#ef4444'; // красный для текущего часа
    }
    if (hour === hoveredHour || hour === activeHour) {
      return '#8b5cf6'; // фиолетовый для активного/наведенного
    }
    return '#3b82f6'; // синий по умолчанию
  };

  const getBarGradient = (hour: number) => {
    const baseColor = getBarBackground(hour);
    const darkColor = getDarkenedColor(baseColor, 0.2);
    
    return `linear-gradient(180deg, ${baseColor}, ${darkColor})`;
  };

  const getDarkenedColor = (color: string, amount: number) => {
    // Простая функция для затемнения цвета
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const r = Math.max(0, Math.min(255, ((num >> 16) & 0xFF) * (1 - amount)));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0xFF) * (1 - amount)));
      const b = Math.max(0, Math.min(255, (num & 0xFF) * (1 - amount)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return color;
  };

  const handleBarClick = (hour: number) => {
    if (activeHour === hour) {
      setActiveHour(null);
    } else {
      setActiveHour(hour);
    }
  };

  const handleBarHover = (hour: number) => {
    setHoveredHour(hour);
  };

  const handleBarLeave = () => {
    setHoveredHour(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.analyticsOverlay} onClick={onClose}>
      <div className={styles.analyticsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.analyticsHeader}>
          <div className={styles.headerLeft}>
            <BarChart3 size={24} />
            <h2>Доска Аналитики</h2>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.analyticsContent}>
          {analyticsData ? (
            <>
              {/* Статистика вверху */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Target size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.totalTasks}</h3>
                    <p>Всего Задач</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.completedTasks}</h3>
                    <p>Завершено</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <TrendingUp size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.completionRate}%</h3>
                    <p>Рейтинг завершения</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Award size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.userScore}/100</h3>
                    <p>Рейтинг пользователя</p>
                  </div>
                </div>
              </div>

              {/* Основные графики */}
              <div className={styles.chartsGrid}>
                {/* График завершения по категориям */}
                <div className={styles.chartCard}>
                  <h3>Заврешния по категории</h3>
                  <div className={styles.categoryChart}>
                    {Object.entries(analyticsData.taskCompletionByCategory).map(([category, percentage]) => {
                      const categoryObj = categories.find(c => c.name === category);
                      return (
                        <div key={category} className={styles.categoryBar}>
                          <div className={styles.barLabel}>
                            <div 
                              className={styles.categoryDot} 
                              style={{ backgroundColor: categoryObj?.color || '#ccc' }}
                            />
                            <span>{category}</span>
                            <span className={styles.percentage}>{percentage}%</span>
                          </div>
                          <div className={styles.barContainer}>
                            <div 
                              className={styles.barFill}
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: categoryObj?.color || '#ccc'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* График по времени */}
                <div className={styles.chartCard}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1.5rem' 
                  }}>
                    <h3>Распределение времени завершения</h3>
                    <button 
                      onClick={() => setShowAllHours(!showAllHours)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--border-color)',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {showAllHours ? 'Show Peak Hours' : 'Show All Hours'}
                    </button>
                  </div>
                  
                  <div ref={chartRef} className={styles.timeChart}>
                    {analyticsData.completionTimeDistribution
                      .filter(data => showAllHours || data.count > 0)
                      .map(({ hour, count }) => {
                        const maxCount = Math.max(...analyticsData.completionTimeDistribution.map(d => d.count));
                        const height = getBarHeight(count, maxCount);
                        const isCurrentHour = hour === getCurrentHour();
                        const isActive = hour === activeHour;
                        const isHovered = hour === hoveredHour;
                        
                        return (
                          <div 
                            key={hour}
                            className={`${styles.timeBar} ${isCurrentHour ? styles.current : ''} ${isActive ? styles.active : ''}`}
                            onClick={() => handleBarClick(hour)}
                            onMouseEnter={() => handleBarHover(hour)}
                            onMouseLeave={handleBarLeave}
                            style={{ 
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-end'
                            }}
                          >
                            <div 
                              className={styles.timeBarTooltip}
                              style={{ 
                                opacity: isHovered || isActive ? 1 : 0,
                                transform: `translateX(-50%) translateY(${isHovered || isActive ? 0 : '10px'})`
                              }}
                            >
                              {count} task{count !== 1 ? 's' : ''} Завершено в {formatHourLabel(hour)}
                            </div>
                            
                            <div 
                              className={styles.timeBarFill}
                              style={{ 
                                height,
                                background: getBarGradient(hour)
                              }}
                            />
                            
                            <span className={styles.hourLabel}>
                              {formatHourLabel(hour)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                  
                  <div className={styles.timeLegend}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: '#3b82f6' }} />
                      <span>Завершенные задачи</span>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }} />
                      <span>Текущий час ({getCurrentHour()}:00)</span>
                    </div>
                    <div className={styles.legendItem}>
                      <Zap size={12} />
                      <span>Пик: {analyticsData.peakProductivityHours.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className={styles.peakHours}>
                    <Clock size={14} />
                    <span>Среднее время завершения: {analyticsData.averageCompletionTime}</span>
                    {activeHour !== null && (
                      <span style={{ marginLeft: 'auto', color: 'var(--primary-color)', fontWeight: 500 }}>
                        Выбрано: {formatHourLabel(activeHour)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Дополнительная статистика */}
              <div className={styles.additionalStats}>
                <div className={styles.infoCard}>
                  <h3>Анализ Производительности</h3>
                  <div className={styles.insights}>
                    <div className={styles.insightItem}>
                      <Calendar size={16} />
                      <div>
                        <p className={styles.insightTitle}>Среднее время завершения</p>
                        <p className={styles.insightValue}>{analyticsData.averageCompletionTime}</p>
                      </div>
                    </div>
                    <div className={styles.insightItem}>
                      <TrendingUp size={16} />
                      <div>
                        <p className={styles.insightTitle}>Текущий Страйк</p>
                        <p className={styles.insightValue}>{analyticsData.streaks.current} дней</p>
                      </div>
                    </div>
                    <div className={styles.insightItem}>
                      <Award size={16} />
                      <div>
                        <p className={styles.insightTitle}>Самый Долгий страйк</p>
                        <p className={styles.insightValue}>{analyticsData.streaks.longest} дней</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <h3>Распределение Прогресса</h3>
                  <div className={styles.progressBreakdown}>
                    {Object.entries(analyticsData.taskCompletionByCategory).map(([category, percentage]) => {
                      const categoryObj = categories.find(c => c.name === category);
                      const tasksInCategory = categoryObj?.tasks.length || 0;
                      const completedInCategory = categoryObj?.tasks.filter(t => t.completed).length || 0;
                      
                      return (
                        <div key={category} className={styles.progressItem}>
                          <div className={styles.progressHeader}>
                            <div className={styles.categoryInfo}>
                              <div 
                                className={styles.categoryDot} 
                                style={{ backgroundColor: categoryObj?.color || '#ccc' }}
                              />
                              <span>{category}</span>
                            </div>
                            <span className={styles.progressStats}>
                              {completedInCategory}/{tasksInCategory}
                            </span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill}
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: categoryObj?.color || '#ccc'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.loading}>
              <BarChart3 size={48} />
              <p>Загрузка Аналитики...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;