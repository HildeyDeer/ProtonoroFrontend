import { useState, useEffect, useRef } from 'react';
import { MoreVertical, X, Clock, CheckCircle, Settings } from 'lucide-react';
import styles from './DropZone.module.css';
import type { DroppedCategory, Task } from '../../../../types';

interface DropZoneProps {
  droppedCategories: DroppedCategory[];
  searchQuery: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveCategory: (id: number) => void;
  onTaskAction: (categoryId: number, task: Task, action: 'edit' | 'delete') => void;
  onToggleTaskCompletion: (categoryId: number, taskId: number) => void;
  onEditCategory: (categoryId: number) => void;
  onDeleteCategory: (categoryId: number) => void;
}

const DropZone = ({
  droppedCategories,
  searchQuery,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveCategory,
  onTaskAction,
  onToggleTaskCompletion,
  onEditCategory,
  onDeleteCategory
}: DropZoneProps) => {
  const [showTaskMenu, setShowTaskMenu] = useState<{categoryId: number, taskId: number} | null>(null);
  const [showCategoryMenuId, setShowCategoryMenuId] = useState<number | null>(null);
  const taskMenuRef = useRef<HTMLDivElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (taskMenuRef.current && !taskMenuRef.current.contains(event.target as Node)) {
        setShowTaskMenu(null);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setShowCategoryMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTaskMenuClick = (categoryId: number, taskId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (showTaskMenu?.categoryId === categoryId && showTaskMenu?.taskId === taskId) {
      setShowTaskMenu(null);
    } else {
      setShowTaskMenu({ 
        categoryId, 
        taskId
      });
      setShowCategoryMenuId(null);
    }
  };

  const handleCategoryMenuClick = (categoryId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (showCategoryMenuId === categoryId) {
      setShowCategoryMenuId(null);
    } else {
      setShowCategoryMenuId(categoryId);
      setShowTaskMenu(null);
    }
  };

  return (
    <div 
      className={`${styles.dropZone} ${droppedCategories.length === 0 ? styles.empty : ''} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => {
        setShowTaskMenu(null);
        setShowCategoryMenuId(null);
      }}
    >
      {droppedCategories.length === 0 ? (
        <div className={styles.dropPlaceholder}>
          <div className={styles.dropIcon}>📁</div>
          <h3>Перетащите категории сюда</h3>
          <p>Перетащите категории из боковой панели, чтобы отобразить их задачи здесь.</p>
        </div>
      ) : (
        <div className={styles.droppedCategoriesGrid}>
          {droppedCategories.map(category => (
            <div key={category.id} className={styles.categoryColumn}>
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitle}>
                  <div 
                    className={styles.categoryColorDot} 
                    style={{ backgroundColor: category.color }}
                  />
                  <h4>{category.name}</h4>
                  <span className={styles.categoryTaskCount}>
                    ({category.tasks.length} tasks)
                  </span>
                </div>
                <div className={styles.categoryActions} ref={categoryMenuRef}>
                  <button 
                    className={styles.categorySettingsBtn}
                    onClick={(e) => handleCategoryMenuClick(category.id, e)}
                    title="Настройки Категории"
                  >
                    <Settings size={16} />
                  </button>
                  
                  {showCategoryMenuId === category.id && (
                    <div className={styles.categoryMenu}>
                      <button 
                        onClick={() => {
                          onEditCategory(category.id);
                          setShowCategoryMenuId(null);
                        }}
                      >
                        ✏️ Изменить Категорию
                      </button>
                      <button 
                        className={styles.deleteBtn}
                        onClick={() => {
                          if (window.confirm(`Delete category "${category.name}"?`)) {
                            onDeleteCategory(category.id);
                            setShowCategoryMenuId(null);
                          }
                        }}
                      >
                        🗑️ Удалить Категорию
                      </button>
                    </div>
                  )}
                  
                  <button 
                    className={styles.removeCategoryBtn}
                    onClick={() => onRemoveCategory(category.id)}
                    title="Remove from view"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              
              <div className={styles.categoryTasks}>
                {category.tasks
                  .filter(task => 
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(task => (
                    <div 
                      key={task.id} 
                      className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={styles.taskHeader}>
                        <span className={styles.taskDate}>{task.date} {task.time}</span>
                        <div className={styles.taskActions}>
                          <button 
                            className={styles.iconBtn}
                            onClick={(e) => handleTaskMenuClick(category.id, task.id, e)}
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {showTaskMenu?.categoryId === category.id && showTaskMenu?.taskId === task.id && (
                            <div 
                              className={styles.taskMenu}
                              ref={taskMenuRef}
                              style={{
                                position: 'absolute',
                                right: '0',
                                top: '100%',
                                zIndex: 1000
                              }}
                            >
                              <button onClick={() => {
                                onTaskAction(category.id, task, 'edit');
                                setShowTaskMenu(null);
                              }}>
                                ✏️ Изменить Задачу
                              </button>
                              <button 
                                className={styles.deleteBtn}
                                onClick={() => {
                                  onTaskAction(category.id, task, 'delete');
                                  setShowTaskMenu(null);
                                }}
                              >
                                🗑️ Удалить Задачу
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={styles.taskBody}>
                        <h3 className={styles.taskTitle}>{task.title}</h3>
                        <p className={styles.taskDescription}>{task.description}</p>
                        
                        <div className={styles.taskMeta}>
                          <div className={styles.metaItem}>
                            <div className={styles.progressCircle} style={{ '--progress': task.progress } as React.CSSProperties}>
                              <span>{task.progress}%</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.taskProgress}>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progressFill} 
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className={styles.progressText}>{task.progress}% complete</span>
                        </div>
                      </div>

                      <div className={styles.taskFooter}>
                        <button 
                          className={`${styles.statusBtn} ${task.completed ? styles.completed : ''}`}
                          onClick={() => onToggleTaskCompletion(category.id, task.id)}
                        >
                          {task.completed ? (
                            <>
                              <CheckCircle size={16} />
                              Завершено
                            </>
                          ) : (
                            <>
                              <Clock size={16} />
                              Отметить как завершенное
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropZone;