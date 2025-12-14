import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserInfo {
  user_id: string | number | null;
  username: string | null;
  email?: string | null;
  full_name?: string | null;
  token?: string | null;
  isDemo?: boolean;
  rememberMe?: boolean;
}

interface AllUserData extends UserInfo {
  [key: string]: any;
}

// Интерфейс для данных пользователя из API
interface ApiUserData {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  [key: string]: any;
}

// Интерфейс для ответа от API login
interface LoginApiResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: ApiUserData;
}

interface AuthState {
  allUserData: AllUserData | null;
  loading: boolean;
  error: string | null;

  // Getters
  user: () => UserInfo;
  isLoggedIn: () => boolean;
  isDemoUser: () => boolean;

  // Actions
  setUser: (user: AllUserData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, fullName?: string, username?: string) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Функция для преобразования данных из API в AllUserData
const transformApiUserToAllUserData = (
  apiUser: ApiUserData, 
  tokens?: { access: string; refresh: string },
  rememberMe?: boolean
): AllUserData => {
  const { id, email, username, full_name, ...restApiUser } = apiUser;
  
  return {
    user_id: id,
    username: username || email?.split('@')[0] || null,
    email: email || null,
    full_name: full_name || null,
    token: tokens?.access || null,
    isDemo: false,
    rememberMe: rememberMe || false,
    ...restApiUser
  };
};

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        allUserData: null,
        loading: false,
        error: null,

        // Getters
        user: () => ({
          user_id: get().allUserData?.user_id || null,
          username: get().allUserData?.username || null,
          email: get().allUserData?.email || null,
          full_name: get().allUserData?.full_name || null,
          token: get().allUserData?.token || null,
          isDemo: get().allUserData?.isDemo || false,
          rememberMe: get().allUserData?.rememberMe || false,
        }),

        isLoggedIn: () => get().allUserData !== null,
        
        isDemoUser: () => get().allUserData?.isDemo === true,

        // Actions
        setUser: (user) => set({ allUserData: user, error: null }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),

        // Auth actions
        login: async (email: string, password: string, rememberMe: boolean = false) => {
          set({ loading: true, error: null });
          
          try {
            // Импортируем функцию login из authService
            const { login: apiLogin } = await import("../api/auth");
            const result = await apiLogin(email, password, rememberMe);
            
            if (result.success && result.data) {
              const { user: apiUser, tokens } = result.data;
              
              // Используем transformApiUserToAllUserData для преобразования
              const allUserData: AllUserData = transformApiUserToAllUserData(
                apiUser,
                tokens,
                rememberMe
              );
              
              set({ 
                allUserData: allUserData, 
                loading: false,
                error: null
              });
              
              console.log('✅ Login successful in store');
            } else {
              set({ 
                loading: false, 
                error: result.error || 'Ошибка авторизации' 
              });
              throw new Error(result.error || 'Ошибка авторизации');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Ошибка авторизации' 
            });
            throw error;
          }
        },

        register: async (email: string, password: string, fullName?: string, username?: string) => {
          set({ loading: true, error: null });
          
          try {
            // Импортируем функцию register из authService
            const { register: apiRegister } = await import("../api/auth");
            const result = await apiRegister(email, password, fullName, username);
            
            if (result.success && result.data) {
              const apiUserData: ApiUserData = {
                id: result.data.id,
                email: result.data.email,
                username: result.data.username,
                full_name: result.data.full_name
              };
              
              const allUserData: AllUserData = transformApiUserToAllUserData(apiUserData);
              
              set({ 
                allUserData: allUserData, 
                loading: false,
                error: null
              });
              
              console.log('✅ Registration successful in store');
            } else {
              set({ 
                loading: false, 
                error: result.error || 'Ошибка регистрации' 
              });
              throw new Error(result.error || 'Ошибка регистрации');
            }
          } catch (error: any) {
            set({ 
              loading: false, 
              error: error.message || 'Ошибка регистрации' 
            });
            throw error;
          }
        },

        logout: () => {
          set({ allUserData: null, error: null, loading: false });
          
          // Вызываем API logout
          import("../api/auth").then(({ logout: apiLogout }) => {
            apiLogout().catch(err => {
              console.warn('Logout API error:', err);
            });
          });
        },

        checkAuth: async () => {
          try {
            const { checkAndRefreshToken, isAuthenticated } = await import("../api/auth");
            
            if (!isAuthenticated()) {
              set({ allUserData: null });
              return false;
            }
            
            const isAuth = await checkAndRefreshToken();
            
            if (isAuth) {
              // Получаем обновленные данные пользователя
              const { getStoredUserData } = await import("../api/auth");
              const storedUser = getStoredUserData();
              
              if (storedUser) {
                const apiUserData: ApiUserData = {
                  id: storedUser.user_id?.toString() || '',
                  email: storedUser.email || '',
                  username: storedUser.username || '',
                  full_name: storedUser.full_name || ''
                };
                
                const allUserData: AllUserData = transformApiUserToAllUserData(
                  apiUserData,
                  storedUser.token ? { access: storedUser.token, refresh: '' } : undefined,
                  storedUser.rememberMe
                );
                
                set({ allUserData });
              }
            } else {
              set({ allUserData: null });
            }
            
            return isAuth;
          } catch (error) {
            console.error('Error checking auth:', error);
            set({ allUserData: null });
            return false;
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          allUserData: state.allUserData,
        }),
        migrate: (persistedState: any, version: number) => {
          if (version === 0) {
            // Миграция с версии 0 на 1
            if (persistedState.allUserData?.isDemo) {
              return { allUserData: null };
            }
          }
          return persistedState;
        },
        version: 1,
      }
    ),
    {
      name: "AuthStore",
    }
  )
);

export { useAuthStore };
export type { AuthState, UserInfo, AllUserData, ApiUserData, LoginApiResponse };