import { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, Calendar, Target, CheckCircle, Clock, Award } from 'lucide-react';
import styles from './Analytics.module.css';
import type { Category } from '../../../types';

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

  useEffect(() => {
    if (isOpen && categories.length > 0) {
      calculateAnalytics();
    }
  }, [isOpen, categories]);

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
    const completionTimeDistribution = Object.entries(completionByHour)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      }))
      .sort((a, b) => a.hour - b.hour);

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

    const currentStreak = completedYesterday ? 7 : 3; // Примерные данные
    const longestStreak = 14; // Примерные данные

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

  if (!isOpen) return null;

  return (
    <div className={styles.analyticsOverlay} onClick={onClose}>
      <div className={styles.analyticsModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.analyticsHeader}>
          <div className={styles.headerLeft}>
            <BarChart3 size={24} />
            <h2>Analytics Dashboard</h2>
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
                    <p>Total Tasks</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.completedTasks}</h3>
                    <p>Completed</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <TrendingUp size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.completionRate}%</h3>
                    <p>Completion Rate</p>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Award size={20} />
                  </div>
                  <div className={styles.statContent}>
                    <h3>{analyticsData.userScore}/100</h3>
                    <p>User Score</p>
                  </div>
                </div>
              </div>

              {/* Основные графики */}
              <div className={styles.chartsGrid}>
                {/* График завершения по категориям */}
                <div className={styles.chartCard}>
                  <h3>Completion by Category</h3>
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
                  <h3>Completion Time Distribution</h3>
                  <div className={styles.timeChart}>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const hourData = analyticsData.completionTimeDistribution.find(h => h.hour === hour);
                      const count = hourData?.count || 0;
                      const height = Math.min(count * 20, 100); // Максимальная высота 100px
                      
                      return (
                        <div key={hour} className={styles.timeBar}>
                          <div 
                            className={styles.timeBarFill}
                            style={{ height: `${height}%` }}
                            title={`${count} tasks at ${hour}:00`}
                          />
                          <span className={styles.hourLabel}>
                            {hour === 0 ? '12AM' : hour === 12 ? '12PM' : hour > 12 ? `${hour-12}PM` : `${hour}AM`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.peakHours}>
                    <Clock size={14} />
                    <span>Peak productivity: {analyticsData.peakProductivityHours.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Дополнительная статистика */}
              <div className={styles.additionalStats}>
                <div className={styles.infoCard}>
                  <h3>Performance Insights</h3>
                  <div className={styles.insights}>
                    <div className={styles.insightItem}>
                      <Calendar size={16} />
                      <div>
                        <p className={styles.insightTitle}>Average Completion Time</p>
                        <p className={styles.insightValue}>{analyticsData.averageCompletionTime}</p>
                      </div>
                    </div>
                    <div className={styles.insightItem}>
                      <TrendingUp size={16} />
                      <div>
                        <p className={styles.insightTitle}>Current Streak</p>
                        <p className={styles.insightValue}>{analyticsData.streaks.current} days</p>
                      </div>
                    </div>
                    <div className={styles.insightItem}>
                      <Award size={16} />
                      <div>
                        <p className={styles.insightTitle}>Longest Streak</p>
                        <p className={styles.insightValue}>{analyticsData.streaks.longest} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <h3>Progress Breakdown</h3>
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
              <p>Loading analytics data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;