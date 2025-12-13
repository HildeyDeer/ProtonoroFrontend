import { useState, useEffect } from 'react';
import { Save, User, Mail, Briefcase, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './ProfileForm.module.css';

const ProfileForm = () => {
  const [name, setName] = useState('Alex Doe');
  const [email, setEmail] = useState('alex.doe@protonoro.com');
  const [role, setRole] = useState('Product Manager');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarInitials, setAvatarInitials] = useState('AD');

  useEffect(() => {
    // При загрузке страницы можно получить данные из localStorage или API
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profileData = JSON.parse(savedProfile);
      setName(profileData.name || 'Alex Doe');
      setEmail(profileData.email || 'alex.doe@protonoro.com');
      setRole(profileData.role || 'Product Manager');
      if (profileData.avatar) {
        setAvatar(profileData.avatar);
      }
    }

    // Обновляем инициалы для аватара
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    setAvatarInitials(initials);
  }, [name]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData = {
      name,
      email,
      role,
      avatar,
      updatedAt: new Date().toISOString()
    };

    // Сохраняем в localStorage (в реальном приложении - API запрос)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    // Показываем уведомление об успешном сохранении
    alert('Profile saved successfully!');
    
    // Возвращаемся назад через 1 секунду
    setTimeout(() => {
      window.history.back();
    }, 1000);
  };

  const handleReset = () => {
    setName('Alex Doe');
    setEmail('alex.doe@protonoro.com');
    setRole('Product Manager');
    setAvatar(null);
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.pageHeader}>
        <Link to="/" className={styles.backButton}>
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
        <h1>Profile Settings</h1>
        <p className={styles.pageSubtitle}>Manage your personal information and preferences</p>
      </div>

      <div className={styles.profileContainer}>
        <form onSubmit={handleSubmit} className={styles.profileForm}>
          <div className={styles.avatarSection}>
            <div className={styles.avatarContainer}>
              {avatar ? (
                <img 
                  src={avatar} 
                  alt="Profile avatar" 
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <span className={styles.avatarInitials}>{avatarInitials}</span>
                </div>
              )}
            </div>
            
            <div className={styles.avatarControls}>
              <label className={styles.avatarUploadBtn}>
                <Upload size={16} />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className={styles.avatarInput}
                />
              </label>
              {avatar && (
                <button 
                  type="button"
                  className={styles.removeAvatarBtn}
                  onClick={() => setAvatar(null)}
                >
                  Remove Photo
                </button>
              )}
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.formInput}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.formInput}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <Briefcase size={16} />
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.formInput}
                placeholder="Enter your role/position"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bio</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Tell us a little about yourself..."
                rows={4}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button 
              type="button" 
              className={styles.resetButton}
              onClick={handleReset}
            >
              Reset to Default
            </button>
            <div className={styles.actionButtons}>
              <Link to="/" className={styles.cancelButton}>
                Cancel
              </Link>
              <button type="submit" className={styles.submitButton}>
                <Save size={16} />
                Save Changes
              </button>
            </div>
          </div>
        </form>

        <div className={styles.sidePanel}>
          <div className={styles.infoCard}>
            <h3>Profile Information</h3>
            <p>Update your personal details, profile picture, and contact information here.</p>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Account Security</h3>
            <p>Change your password and manage two-factor authentication settings.</p>
            <button className={styles.sideButton}>
              Security Settings
            </button>
          </div>
          
          <div className={styles.infoCard}>
            <h3>Preferences</h3>
            <p>Customize your notification preferences and display settings.</p>
            <button className={styles.sideButton}>
              Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;