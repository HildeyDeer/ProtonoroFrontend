import { Calendar, Target, Search, Plus, Moon, Sun } from 'lucide-react';
//import { useState } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  darkMode: boolean;
  onThemeToggle: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewTask: () => void;
}

const Header = ({ 
  darkMode, 
  onThemeToggle, 
  searchQuery, 
  onSearchChange,
  onNewTask 
}: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.logo}>
          <Target className={styles.logoIcon} size={28} />
          <h1>Protonoro</h1>
        </div>
        <div className={styles.dateDisplay}>
          <Calendar size={18} />
          <span>September 2026</span>
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.searchBar}>
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <button 
          className={styles.themeToggle}
          onClick={onThemeToggle}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        
        <button className={styles.btnPrimary} onClick={onNewTask}>
          <Plus size={18} />
          New Task
        </button>
        <div className={styles.userAvatar}>
          <span>AD</span>
        </div>
      </div>
    </header>
  );
};

export default Header;