import { useState, useEffect, useRef } from 'react';
import Header from './components/layout/Header/Header';
import Sidebar from './components/layout/Sidebar/Sidebar';
import TimerSection from './components/layout/timer/TimerSection';
import DropZone from './components/layout/dropzone/DropZone';
import CategoryPopup from './components/layout/popup/CategoryPopup';
import type { Category, TimerState, DroppedCategory } from './types';
import './styles/App.css';

const App = () => {
  // Темная тема
  const [darkMode, setDarkMode] = useState(false);
  
  // Таймер
  const [time, setTime] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>('stopped');
  const intervalRef = useRef<number | null>(null);
  
  // Drag and Drop
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [droppedCategories, setDroppedCategories] = useState<DroppedCategory[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Popup state
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [showPopup, setShowPopup] = useState(false);
  const popupTimeoutRef = useRef<number | null>(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Данные
  const [categories, setCategories] = useState<Category[]>([
    { 
      id: 1, 
      name: 'Category 1', 
      color: '#3b82f6', 
      tasks: [
        { id: 1, title: 'on employee targets', description: 'Set quarterly targets for sales team', category: 'Category 1', date: '01/9/2026', time: '09:00', progress: 75, completed: false },
        { id: 2, title: 'on employee target range', description: 'Define target ranges for different roles', category: 'Category 1', date: '01/9/2026', time: '11:30', progress: 100, completed: true },
        { id: 6, title: 'Team Meeting', description: 'Weekly team sync meeting', category: 'Category 1', date: '03/9/2026', time: '15:00', progress: 100, completed: true },
      ]
    },
    { 
      id: 2, 
      name: 'Category 2', 
      color: '#10b981', 
      tasks: [
        { id: 3, title: 'on employee targets range', description: 'Review and adjust target ranges', category: 'Category 2', date: '02/9/2026', time: '14:00', progress: 30, completed: false },
        { id: 7, title: 'Budget Planning', description: 'Prepare Q4 budget report', category: 'Category 2', date: '04/9/2026', time: '11:00', progress: 60, completed: false },
      ]
    },
    { 
      id: 3, 
      name: 'Category 3', 
      color: '#8b5cf6', 
      tasks: [
        { id: 4, title: 'Performance Review Q3', description: 'Conduct quarterly performance reviews', category: 'Category 3', date: '05/9/2026', time: '10:00', progress: 0, completed: false },
        { id: 8, title: 'Client Presentation', description: 'Prepare slides for client meeting', category: 'Category 3', date: '06/9/2026', time: '13:00', progress: 40, completed: false },
        { id: 9, title: 'Documentation Update', description: 'Update project documentation', category: 'Category 3', date: '07/9/2026', time: '16:00', progress: 20, completed: false },
      ]
    },
    { 
      id: 4, 
      name: 'Category 4', 
      color: '#f59e0b', 
      tasks: [
        { id: 5, title: 'Training Program Setup', description: 'Launch new employee training program', category: 'Category 4', date: '10/9/2026', time: '13:45', progress: 50, completed: false },
        { id: 10, title: 'System Migration', description: 'Migrate to new CRM system', category: 'Category 4', date: '12/9/2026', time: '09:30', progress: 80, completed: false },
      ]
    },
  ]);

  // Переключение темы
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Логика таймера
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = window.setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            setTimerState('stopped');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Drag and Drop handlers
  const handleDragStart = (category: Category, e: React.DragEvent) => {
    setDraggedCategory(category);
    setShowPopup(false);
    setHoveredCategory(null);
    
    e.dataTransfer.setData('application/json', JSON.stringify(category));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const category: Category = JSON.parse(data);
        if (!droppedCategories.find(c => c.id === category.id)) {
          const newDroppedCategory: DroppedCategory = {
            ...category,
            position: droppedCategories.length
          };
          setDroppedCategories([...droppedCategories, newDroppedCategory]);
        }
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
    
    setDraggedCategory(null);
  };

  const removeDroppedCategory = (id: number) => {
    setDroppedCategories(droppedCategories.filter(cat => cat.id !== id));
  };

  // Popup handlers
  const handleMouseEnter = (category: Category, e: React.MouseEvent) => {
    if (draggedCategory) {
      return;
    }
    
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 10,
      y: rect.top
    });
    
    popupTimeoutRef.current = window.setTimeout(() => {
      setHoveredCategory(category);
      setShowPopup(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
    
    if (!draggedCategory) {
      popupTimeoutRef.current = window.setTimeout(() => {
        setShowPopup(false);
        setHoveredCategory(null);
      }, 200);
    }
  };

  // Добавим обработчик для всего документа для отслеживания drag end
  useEffect(() => {
    const handleDragEnd = () => {
      setDraggedCategory(null);
      setIsDragOver(false);
    };

    document.addEventListener('dragend', handleDragEnd);
    
    return () => {
      document.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  const handlePopupMouseEnter = () => {
    if (popupTimeoutRef.current) {
      window.clearTimeout(popupTimeoutRef.current);
    }
  };

  const handlePopupMouseLeave = () => {
    handleMouseLeave();
  };

  // Task completion toggle
  const toggleTaskCompletion = (categoryId: number, taskId: number) => {
    // Обновляем категории в сайдбаре
    setCategories(categories.map(category => 
      category.id === categoryId 
        ? {
            ...category,
            tasks: category.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : category
    ));

    // Обновляем dropped категории
    setDroppedCategories(droppedCategories.map(category =>
      category.id === categoryId
        ? {
            ...category,
            tasks: category.tasks.map(task =>
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : category
    ));
  };

  // Timer controls
  const startTimer = () => setTimerState('running');
  const pauseTimer = () => setTimerState('paused');
  const resetTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerState('stopped');
    setTime(25 * 60);
  };

  // Статистика
  const totalTasks = categories.reduce((sum, cat) => sum + cat.tasks.length, 0);
  const allTasks = categories.flatMap(cat => cat.tasks);
  const completedTasks = allTasks.filter(t => t.completed).length;
  const inProgressTasks = allTasks.filter(t => !t.completed && t.progress > 0).length;

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <Header 
        darkMode={darkMode}
        onThemeToggle={() => setDarkMode(!darkMode)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={() => console.log('New task')}
      />

      <div className="main-layout">
        <Sidebar 
          categories={categories}
          droppedCategories={droppedCategories.map(dc => ({
            id: dc.id,
            name: dc.name,
            color: dc.color,
            tasks: dc.tasks
          }))}
          draggedCategory={draggedCategory}
          onDragStart={handleDragStart}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          totalTasks={totalTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
        />

        <main className="content">
          <TimerSection 
            time={time}
            timerState={timerState}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            formatTime={formatTime}
          />

          <DropZone 
            droppedCategories={droppedCategories}
            searchQuery={searchQuery}
            isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemoveCategory={removeDroppedCategory}
            onToggleTaskCompletion={toggleTaskCompletion}
          />

          {showPopup && hoveredCategory && (
            <CategoryPopup 
              category={hoveredCategory}
              position={popupPosition}
              onMouseEnter={handlePopupMouseEnter}
              onMouseLeave={handlePopupMouseLeave}
              onDragToMain={() => {
                if (!droppedCategories.find(c => c.id === hoveredCategory.id)) {
                  const newDroppedCategory: DroppedCategory = {
                    ...hoveredCategory,
                    position: droppedCategories.length
                  };
                  setDroppedCategories([...droppedCategories, newDroppedCategory]);
                }
                setShowPopup(false);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;