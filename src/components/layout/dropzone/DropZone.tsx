import { MoreVertical, X, CheckCircle, Clock } from 'lucide-react';
import styles from './DropZone.module.css';
import type { DroppedCategory } from '../../../types/index';

interface DropZoneProps {
  droppedCategories: DroppedCategory[];
  searchQuery: string;
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveCategory: (id: number) => void;
  onToggleTaskCompletion: (categoryId: number, taskId: number) => void;
}

const DropZone = ({
  droppedCategories,
  searchQuery,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveCategory,
  onToggleTaskCompletion
}: DropZoneProps) => {
  return (
    <div 
      className={`${styles.dropZone} ${droppedCategories.length === 0 ? styles.empty : ''} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {droppedCategories.length === 0 ? (
        <div className={styles.dropPlaceholder}>
          <div className={styles.dropIcon}>📁</div>
          <h3>Drag categories here</h3>
          <p>Drag categories from the sidebar to display their tasks here</p>
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
                </div>
                <button 
                  className={styles.removeCategory}
                  onClick={() => onRemoveCategory(category.id)}
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className={styles.categoryTasks}>
                {category.tasks
                  .filter(task => 
                    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(task => (
                    <div key={task.id} className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}>
                      <div className={styles.taskHeader}>
                        <span className={styles.taskDate}>{task.date} {task.time}</span>
                        <div className={styles.taskActions}>
                          <button className={styles.iconBtn}>
                            <MoreVertical size={16} />
                          </button>
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
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock size={16} />
                              Mark Complete
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