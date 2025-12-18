import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CalendarPopup.module.css';

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: {
    x: number;
    y: number;
  };
}

interface CalendarDay {
  date: Date;
  day: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasTask?: boolean;
  isSelected?: boolean;
}

const CalendarPopup: React.FC<CalendarPopupProps> = ({ isOpen, onClose, position }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [taskDates, setTaskDates] = useState<Set<string>>(new Set());
  const [isExpanded, setIsExpanded] = useState(false);

  // Симулируем задачи на некоторые даты
  useEffect(() => {
    const mockTaskDates = new Set<string>();
    const today = new Date();
    
    // Сегодня
    mockTaskDates.add(today.toISOString().split('T')[0]);
    
    // Завтра
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    mockTaskDates.add(tomorrow.toISOString().split('T')[0]);
    
    // Через 3 дня
    const day3 = new Date(today);
    day3.setDate(day3.getDate() + 3);
    mockTaskDates.add(day3.toISOString().split('T')[0]);
    
    // Через неделю
    const week = new Date(today);
    week.setDate(week.getDate() + 7);
    mockTaskDates.add(week.toISOString().split('T')[0]);
    
    setTaskDates(mockTaskDates);
  }, []);

  // Генерация календаря
  useEffect(() => {
    const generateCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const today = new Date();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const lastDayOfWeek = lastDay.getDay();
      
      const days: CalendarDay[] = [];
      
      // Дни предыдущего месяца
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({
          date,
          day: prevMonthLastDay - i,
          month: month - 1,
          year,
          isCurrentMonth: false,
          isToday: date.toDateString() === today.toDateString(),
          hasTask: taskDates.has(date.toISOString().split('T')[0]),
          isSelected: date.toDateString() === selectedDate.toDateString()
        });
      }
      
      // Дни текущего месяца
      const daysInMonth = lastDay.getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        days.push({
          date,
          day: i,
          month,
          year,
          isCurrentMonth: true,
          isToday: date.toDateString() === today.toDateString(),
          hasTask: taskDates.has(date.toISOString().split('T')[0]),
          isSelected: date.toDateString() === selectedDate.toDateString()
        });
      }
      
      // Дни следующего месяца
      const daysToAdd = 42 - days.length;
      for (let i = 1; i <= daysToAdd; i++) {
        const date = new Date(year, month + 1, i);
        days.push({
          date,
          day: i,
          month: month + 1,
          year,
          isCurrentMonth: false,
          isToday: date.toDateString() === today.toDateString(),
          hasTask: taskDates.has(date.toISOString().split('T')[0]),
          isSelected: date.toDateString() === selectedDate.toDateString()
        });
      }
      
      setCalendarDays(days);
    };
    
    generateCalendar();
  }, [currentDate, selectedDate, taskDates]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      setCurrentDate(new Date(day.year, day.month, 1));
    }
    setSelectedDate(day.date);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getUpcomingTasks = () => {
    const upcoming = [];
    const today = new Date();
    
    // Задачи на сегодня
    if (taskDates.has(today.toISOString().split('T')[0])) {
      upcoming.push({
        date: today,
        title: 'Текущие задачи',
        count: 3,
        priority: 'high',
        time: 'Сегодня, 14:00'
      });
    }
    
    // Задачи на завтра
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (taskDates.has(tomorrow.toISOString().split('T')[0])) {
      upcoming.push({
        date: tomorrow,
        title: 'Планы на завтра',
        count: 2,
        priority: 'medium',
        time: 'Завтра, 10:00'
      });
    }
    
    // Задачи через 3 дня
    const day3 = new Date(today);
    day3.setDate(day3.getDate() + 3);
    if (taskDates.has(day3.toISOString().split('T')[0])) {
      upcoming.push({
        date: day3,
        title: 'Совещание',
        count: 1,
        priority: 'high',
        time: formatShortDate(day3)
      });
    }
    
    // Задачи через неделю
    const week = new Date(today);
    week.setDate(week.getDate() + 7);
    if (taskDates.has(week.toISOString().split('T')[0])) {
      upcoming.push({
        date: week,
        title: 'Недельный план',
        count: 5,
        priority: 'low',
        time: formatShortDate(week)
      });
    }
    
    return upcoming;
  };

  if (!isOpen) return null;

  const upcomingTasks = getUpcomingTasks();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.calendarPopup} ${isExpanded ? styles.expanded : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          left: `${Math.min(position.x, window.innerWidth - (isExpanded ? 400 : 350))}px`,
          top: `${Math.min(position.y, window.innerHeight - (isExpanded ? 600 : 400))}px`
        }}
      >
        <div className={styles.popupHeader}>
          <div className={styles.popupHeaderTop}>
            <div className={styles.popupTitle}>
              <Calendar size={20} />
              <h4>Календарь задач</h4>
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.selectedDateInfo}>
            <div className={styles.selectedDateText}>
              <span className={styles.selectedDateLabel}>Выбрана дата:</span>
              <span className={styles.selectedDateValue}>
                {selectedDate.toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
            <div className={styles.headerButtons}>
              <button 
                className={styles.todayButton}
                onClick={handleTodayClick}
              >
                Сегодня
              </button>
              <button 
                className={styles.expandButton}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Свернуть' : 'Развернуть'}
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <button className={styles.navButton} onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <h3 className={styles.monthYear}>
              {formatMonthYear(currentDate)}
            </h3>
            <button className={styles.navButton} onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className={styles.weekDays}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
              <div key={index} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>
          
          <div className={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <button
                key={index}
                className={`${styles.calendarDay} ${
                  day.isToday ? styles.today : ''
                } ${day.isSelected ? styles.selected : ''} ${
                  !day.isCurrentMonth ? styles.otherMonth : ''
                } ${day.hasTask ? styles.hasTask : ''}`}
                onClick={() => handleDayClick(day)}
                title={day.date.toLocaleDateString('ru-RU')}
              >
                <span className={styles.dayNumber}>{day.day}</span>
                {day.hasTask && <span className={styles.taskDot}></span>}
              </button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            <div className={styles.upcomingTasks}>
              <div className={styles.upcomingHeader}>
                <h4>Ближайшие задачи</h4>
                <span className={styles.taskCount}>{upcomingTasks.length} события</span>
              </div>
              
              <div className={styles.tasksList}>
                {upcomingTasks.map((task, index) => (
                  <div key={index} className={styles.taskItem}>
                    <div className={styles.taskDateBadge}>
                      <span className={styles.taskDay}>
                        {task.date.toLocaleDateString('ru-RU', { day: 'numeric' })}
                      </span>
                      <span className={styles.taskMonth}>
                        {task.date.toLocaleDateString('ru-RU', { month: 'short' })}
                      </span>
                    </div>
                    <div className={styles.taskInfo}>
                      <div className={styles.taskTitle}>{task.title}</div>
                      <div className={styles.taskMeta}>
                        <span className={`${styles.taskPriority} ${styles[task.priority]}`}>
                          {task.priority === 'high' ? 'Высокий' : 
                           task.priority === 'medium' ? 'Средний' : 'Низкий'}
                        </span>
                        <span className={styles.taskTime}>{task.time}</span>
                      </div>
                      <div className={styles.taskCountBadge}>
                        {task.count} задач
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingTasks.length === 0 && (
                  <div className={styles.noTasks}>
                    <Calendar size={24} />
                    <span>Нет запланированных задач</span>
                    <small>Нажмите на дату для создания задачи</small>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.popupFooter}>
              <button className={styles.createTaskBtn} onClick={onClose}>
                <Check size={16} />
                Создать задачу на {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              </button>
            </div>
          </>
        )}

        {!isExpanded && (
          <div className={styles.collapsedFooter}>
            <div className={styles.taskSummary}>
              <Calendar size={14} />
              <span>{upcomingTasks.length} задачи на ближайшие дни</span>
            </div>
            <button 
              className={styles.viewAllBtn}
              onClick={() => setIsExpanded(true)}
            >
              Показать все
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPopup;