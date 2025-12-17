import axios from "axios";
import apiInstance from "./apiInstance";
import Cookies from "js-cookie";
import { useAuthStore } from "../store/useAuthStore";

// ========== ИНТЕРФЕЙСЫ ==========

// Тип для ответа бэкенда - совместим с Dictionary<string, string> и Dictionary<string, object>
type BackendResponse<T = string> = Record<string, T>;

interface LoginBackendSuccess {
    accessToken: string;
    refreshToken: string;
}

interface LoginBackendError {
    Message: string;
}

interface RegisterBackendSuccess {
    message: string;
}

interface RegisterBackendError {
    error?: Array<{
        code: string;
        description: string;
    }>;
}
interface FullNameResponse {
    fullName: string;
    userId: string;
    userName: string;
    email: string;
}

// Наши интерфейсы
interface TokenResponse {
    access: string;
    refresh: string;
}

interface UserData {
    id: string;
    email: string;
    username?: string;
    full_name?: string;
    [key: string]: any;
}

interface LoginResponse {
    tokens: TokenResponse;
    user: UserData;
}

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
    success: boolean;
}

// Интерфейс для AllUserData (совместимый с useAuthStore)
interface AllUserData {
    user_id: string | number | null;
    username: string | null;
    email: string | null;
    full_name?: string | null;
    token?: string | null;
    isDemo?: boolean;
    rememberMe?: boolean;
    [key: string]: any;
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

function createApiResponse<T>(
    data: T | null = null,
    error: string | null = null,
    status: number = 200,
    success: boolean = true
): ApiResponse<T> {
    return { data, error, status, success };
}

const transformTokenResponse = (backendResponse: LoginBackendSuccess): TokenResponse => {
    return {
        access: backendResponse.accessToken,
        refresh: backendResponse.refreshToken
    };
};

const transformUserData = (backendUser: any): UserData => {
    return {
        id: backendUser.id || backendUser.userId || '',
        email: backendUser.email || '',
        username: backendUser.userName || backendUser.username || '',
        full_name: backendUser.fullName || backendUser.full_name || '',
        ...backendUser
    };
};

const transformToAllUserData = (userData: UserData, token?: string, rememberMe?: boolean): AllUserData => {
    const { id, email, username, full_name, ...restUserData } = userData;
    
    return {
        user_id: id,
        username: username || email?.split('@')[0] || null,
        email: email,
        full_name: full_name || null,
        token: token || null,
        isDemo: false,
        rememberMe: rememberMe || false,
        ...restUserData
    };
};

const updateAuthStore = (user: UserData | null, token?: string, rememberMe?: boolean) => {
    if (user) {
        const allUserData = transformToAllUserData(user, token, rememberMe);
        useAuthStore.getState().setUser(allUserData);
    } else {
        useAuthStore.getState().setUser(null);
    }
};

// ========== КОНСТАНТЫ ==========

const COOKIE_KEYS = {
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
    REMEMBER_ME: "remember_me"
} as const;

const TOKEN_EXPIRY = {
    ACCESS: 1, // 1 день
    REFRESH: 7, // 7 дней
    REMEMBER: 30 // 30 дней для запомненных пользователей
} as const;

// ========== ОСНОВНЫЕ ФУНКЦИИ АВТОРИЗАЦИИ ==========

export const login = async (
    email: string,
    password: string,
    rememberMe: boolean = false
): Promise<ApiResponse<LoginResponse>> => {
    try {
        console.log('🚀 Login attempt started:', { email });
        useAuthStore.getState().setLoading(true);

        const payload = {
            Email: email,
            Password: password
        };

        console.log('📤 Sending login payload:', payload);

        const { data, status } = await apiInstance.post<BackendResponse<string>>(
            'api/auth/login',
            payload
        );

        console.log('📥 Login response:', { status, data });

        if (!data.accessToken) {
            throw new Error(data.Message || 'Ошибка авторизации');
        }

        console.log('✅ Login successful');

        const tokens: TokenResponse = {
            access: data.accessToken,
            refresh: data.refreshToken || ''
        };

        console.log('🔐 Tokens received');

        // 🔐 СОХРАНЯЕМ ТОКЕНЫ И ОБНОВЛЯЕМ API INSTANCE
        setAuthTokens(tokens.access, tokens.refresh, rememberMe);

        // ============================
        // 👤 ПОЛУЧАЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ СРАЗУ
        // ============================
        let userData: UserData;

        try {
            console.log('📡 Getting user profile...');
            
            // Теперь apiInstance уже имеет правильный токен
            const profileResponse = await apiInstance.get<{
                fullName: string;
                userId: string;
                userName: string;
                email: string;
            }>('api/auth/fullname');
            
            console.log('👤 User profile response:', profileResponse.data);
            
            userData = {
                id: profileResponse.data.userId,
                email: profileResponse.data.email,
                username: profileResponse.data.userName,
                full_name: profileResponse.data.fullName || ''
            };
            
            console.log('✅ User data received:', userData);
            
        } catch (profileError) {
            console.warn('⚠️ Failed to load user profile, using email-based data:', profileError);
            
            // Используем данные из email как запасной вариант
            userData = {
                id: `temp-${Date.now()}`,
                email: email,
                username: email.split('@')[0],
                full_name: ''
            };
        }

        // ============================
        // 💾 СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЬСКИХ ДАННЫХ
        // ============================
        const allUserData = transformToAllUserData(
            userData,
            tokens.access,
            rememberMe
        );

        console.log('💾 Saving user data to cookies:', {
            hasFullName: !!userData.full_name,
            username: userData.username
        });

        Cookies.set(COOKIE_KEYS.USER_DATA, JSON.stringify(allUserData), {
            expires: rememberMe ? TOKEN_EXPIRY.REMEMBER : TOKEN_EXPIRY.ACCESS,
            secure: true,
            sameSite: 'strict'
        });

        if (rememberMe) {
            Cookies.set(COOKIE_KEYS.REMEMBER_ME, 'true', {
                expires: TOKEN_EXPIRY.REMEMBER,
                secure: true,
                sameSite: 'strict'
            });
        }

        // Обновляем стор
        updateAuthStore(userData, tokens.access, rememberMe);

        const storeState = useAuthStore.getState();
        console.log('🏪 Store updated:', {
            hasUser: !!storeState.allUserData,
            user: storeState.allUserData
        });

        useAuthStore.getState().setLoading(false);

        console.log('🎉 Login completed successfully!');

        const response: LoginResponse = {
            tokens: tokens,
            user: userData
        };

        return createApiResponse<LoginResponse>(response, null, status, true);

    } catch (error) {
        console.error('🔥 Login error:', error);

        useAuthStore.getState().setLoading(false);

        let errorMessage = 'Ошибка авторизации';
        let statusCode = 500;

        if (axios.isAxiosError(error)) {
            console.error('📡 Axios error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });

            statusCode = error.response?.status || 500;
            const errorData = error.response?.data as BackendResponse<string> | string;

            if (statusCode === 401) {
                errorMessage = 'Неверный email или пароль';
            } else if (statusCode === 400) {
                errorMessage = 'Некорректный запрос';
            } else if (statusCode === 404) {
                errorMessage = 'Сервер авторизации не найден';
            } else if (statusCode === 500) {
                errorMessage = 'Внутренняя ошибка сервера';
            }

            if (typeof errorData === 'object' && errorData.Message) {
                errorMessage = errorData.Message;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.log('📋 Error message:', errorMessage);
        return createApiResponse<LoginResponse>(null, errorMessage, statusCode, false);
    }
};

// ========== ФУНКЦИЯ ДЛЯ ЗАГРУЗКИ ПРОФИЛЯ ==========
export const fetchUserProfile = async (): Promise<ApiResponse<UserData>> => {
    try {
        console.log('🔄 Loading user profile...');
        
        // Используем обычный apiInstance - он уже настроен с интерцептором для токенов
        const { data, status } = await apiInstance.get<{
            fullName: string;
            userId: string;
            userName: string;
            email: string;
        }>('api/auth/fullname');
        
        console.log('✅ Profile loaded:', data);
        
        const userData: UserData = {
            id: data.userId,
            email: data.email,
            username: data.userName,
            full_name: data.fullName || ''
        };
        
        return createApiResponse<UserData>(userData, null, status, true);
        
    } catch (error) {
        console.error('Failed to load user profile:', error);
        
        let errorMessage = 'Ошибка загрузки профиля';
        let statusCode = 500;
        
        if (axios.isAxiosError(error)) {
            statusCode = error.response?.status || 500;
            const errorData = error.response?.data as { error?: string };
            
            if (statusCode === 401) {
                errorMessage = 'Требуется авторизация';
            } else if (errorData?.error) {
                errorMessage = errorData.error;
            }
        }
        
        return createApiResponse<UserData>(null, errorMessage, statusCode, false);
    }
};


export const register = async (
    email: string, 
    password: string, 
    fullName?: string,
    username?: string
): Promise<ApiResponse<UserData>> => {
    try {
        useAuthStore.getState().setLoading(true);
        
        const payload = {
            email,
            password,
            userName: username || email.split('@')[0],
            fullName: fullName || ''
        };
        
        // Используем BackendResponse<any> для совместимости с Dictionary<string, object>
        const { data, status } = await apiInstance.post<BackendResponse<any>>(
            `api/auth/register`,
            payload
        );
        
        console.log('📥 Register response:', { status, data });
        
        useAuthStore.getState().setLoading(false);
        
        // Проверяем по наличию message (как в бэкенде: res.ContainsKey("message"))
        if (data.message) {
            const userData: UserData = {
                id: '', // Будет получен после логина
                email: email,
                username: username || email.split('@')[0],
                full_name: fullName || ''
            };
            
            return createApiResponse<UserData>(userData, null, status, true);
        }
        
        // Обработка ошибок Identity
        if (data.error && Array.isArray(data.error)) {
            const errorMessages = data.error.map((err: any) => err.description || err.code).join(', ');
            return createApiResponse<UserData>(null, errorMessages, 400, false);
        }
        
        return createApiResponse<UserData>(null, 'Ошибка регистрации', status, false);
        
    } catch (error) {
        console.error('Register error:', error);
        
        useAuthStore.getState().setLoading(false);
        
        let errorMessage = 'Ошибка регистрации';
        let statusCode = 500;
        
        if (axios.isAxiosError(error)) {
            statusCode = error.response?.status || 500;
            const errorData = error.response?.data as BackendResponse<any>;
            
            if (statusCode === 400) {
                if (errorData?.error) {
                    const identityErrors = errorData.error;
                    if (Array.isArray(identityErrors)) {
                        errorMessage = identityErrors
                            .map((err: any) => {
                                if (err.code === 'DuplicateUserName') {
                                    return 'Пользователь с таким именем уже существует';
                                }
                                if (err.code === 'DuplicateEmail') {
                                    return 'Пользователь с таким email уже существует';
                                }
                                return err.description || err.code;
                            })
                            .join(', ');
                    }
                }
            }
        }
        
        return createApiResponse<UserData>(null, errorMessage, statusCode, false);
    }
};

// ========== ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ БЭКЕНДА ==========

export const requestPasswordReset = async (email: string): Promise<ApiResponse<null>> => {
    try {
        const { data, status } = await apiInstance.get<BackendResponse<string>>(
            `api/auth/password-reset-email/${email}`
        );
        
        if (data.message) {
            return createApiResponse<null>(null, null, status, true);
        }
        
        return createApiResponse<null>(null, 'Ошибка запроса восстановления пароля', status, false);
        
    } catch (error) {
        console.error('Password reset request error:', error);
        
        let errorMessage = 'Ошибка запроса восстановления пароля';
        
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status || 500;
            const errorData = error.response?.data as BackendResponse<string>;
            
            if (statusCode === 404) {
                errorMessage = errorData?.error || 'Пользователь с таким email не найден';
            }
        }
        
        return createApiResponse<null>(null, errorMessage, 500, false);
    }
};

export const resetPassword = async (
    uuid: string, 
    otp: string, 
    newPassword: string
): Promise<ApiResponse<null>> => {
    try {
        const payload = {
            uuid,
            otp,
            password: newPassword
        };
        
        // Для query параметров используем строку запроса
        const queryParams = new URLSearchParams({
            uuid,
            otp,
            password: newPassword
        }).toString();
        
        const { data, status } = await apiInstance.post<BackendResponse<string>>(
            `api/auth/password-reset?${queryParams}`,
            {}
        );
        
        if (data.message) {
            return createApiResponse<null>(null, null, status, true);
        }
        
        return createApiResponse<null>(null, 'Ошибка сброса пароля', status, false);
        
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Ошибка сброса пароля';
        
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.status || 500;
            const errorData = error.response?.data as BackendResponse<string>;
            
            if (statusCode === 400) {
                errorMessage = errorData?.error || 'Неверный или истекший OTP';
            } else if (statusCode === 404) {
                errorMessage = errorData?.error || 'Запрос на сброс пароля не найден';
            }
        }
        
        return createApiResponse<null>(null, errorMessage, 500, false);
    }
};

export const changePassword = async (
    currentPassword: string,
    newPassword: string
): Promise<ApiResponse<null>> => {
    try {
        const payload = {
            currentPassword,
            newPassword
        };
        
        const { data, status } = await apiInstance.post<BackendResponse<string>>(
            `api/auth/change-password`,
            payload
        );
        
        // Ваш бэкенд возвращает "icon": "success" или "icon": "warning"
        if (data.icon === 'success') {
            return createApiResponse<null>(null, null, status, true);
        } else if (data.icon === 'warning') {
            return createApiResponse<null>(null, data.error || 'Ошибка смены пароля', 400, false);
        }
        
        return createApiResponse<null>(null, 'Ошибка смены пароля', status, false);
        
    } catch (error) {
        console.error('Change password error:', error);
        return createApiResponse<null>(null, 'Ошибка смены пароля', 500, false);
    }
};

export const refreshToken = async (): Promise<ApiResponse<TokenResponse>> => {
    try {
        const { data, status } = await apiInstance.post<{ accessToken: string }>(
            `api/auth/refresh`
        );
        
        if (status === 200 && data.accessToken) {
            const tokens: TokenResponse = {
                access: data.accessToken,
                refresh: '' // Бэкенд не возвращает новый refresh token в ответе
            };
            
            // Сохраняем новый access token
            const rememberMe = getRememberMeStatus();
            Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, tokens.access, {
                expires: rememberMe ? TOKEN_EXPIRY.REMEMBER : TOKEN_EXPIRY.ACCESS,
                secure: true,
                sameSite: 'strict'
            });
            
            return createApiResponse<TokenResponse>(tokens, null, status, true);
        }
        
        return createApiResponse<TokenResponse>(null, 'Ошибка обновления токена', status, false);
        
    } catch (error) {
        console.error('Refresh token error:', error);
        
        clearAuthData();
        
        return createApiResponse<TokenResponse>(
            null, 
            'Ошибка обновления токена. Пожалуйста, войдите снова', 
            401, 
            false
        );
    }
};

// ========== ОСНОВНЫЕ УТИЛИТЫ ==========

export const setAuthTokens = (access_token: string, refresh_token: string, rememberMe: boolean = false): void => {
    const expires = rememberMe ? TOKEN_EXPIRY.REMEMBER : TOKEN_EXPIRY.ACCESS;
    
    Cookies.set(COOKIE_KEYS.ACCESS_TOKEN, access_token, {
        expires,
        secure: true,
        sameSite: 'strict'
    });
    
    Cookies.set(COOKIE_KEYS.REFRESH_TOKEN, refresh_token, {
        expires: TOKEN_EXPIRY.REFRESH,
        secure: true,
        sameSite: 'strict'
    });
    
    // ✅ ВАЖНО: Обновляем заголовки apiInstance
    if (apiInstance.defaults.headers) {
        apiInstance.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    }
};

export const getAuthTokens = (): { accessToken: string | undefined; refreshToken: string | undefined } => {
    const accessToken = Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
    const refreshToken = Cookies.get(COOKIE_KEYS.REFRESH_TOKEN);
    
    return { accessToken, refreshToken };
};

export const logout = async (): Promise<ApiResponse<null>> => {
    try {
        const { refreshToken } = getAuthTokens();
        
        if (refreshToken) {
            try {
                // Ваш бэкенд не имеет endpoint для logout, но пытаемся очистить на стороне клиента
                await apiInstance.post(`api/auth/logout`, {
                    refreshToken: refreshToken
                });
            } catch (error) {
                console.warn('Logout API not available:', error);
            }
        }
        
        clearAuthData();
        updateAuthStore(null);
        
        return createApiResponse<null>(null, null, 200, true);
        
    } catch (error) {
        console.error('Logout error:', error);
        
        clearAuthData();
        updateAuthStore(null);
        
        return createApiResponse<null>(null, 'Ошибка при выходе', 500, false);
    }
};

export const clearAuthData = (): void => {
    Object.values(COOKIE_KEYS).forEach(key => {
        Cookies.remove(key);
    });
    
    localStorage.removeItem('auth_state');
};

export const isAuthenticated = (): boolean => {
    const accessToken = Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
    return !!accessToken;
};

export const getStoredUserData = (): AllUserData | null => {
    try {
        const userDataStr = Cookies.get(COOKIE_KEYS.USER_DATA);
        
        if (userDataStr) {
            return JSON.parse(userDataStr);
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing stored user data:', error);
        return null;
    }
};

export const getRememberMeStatus = (): boolean => {
    return Cookies.get(COOKIE_KEYS.REMEMBER_ME) === 'true';
};

// Инициализация состояния авторизации при загрузке приложения
export const initializeAuth = async (): Promise<void> => {
    try {
        const accessToken = Cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
        
        if (accessToken) {
            const userData = getStoredUserData();
            if (userData) {
                // Преобразуем AllUserData обратно в UserData для store
                const storeUserData: UserData = {
                    id: userData.user_id?.toString() || '',
                    email: userData.email || '',
                    username: userData.username || '',
                    full_name: userData.full_name || ''
                };
                
                updateAuthStore(storeUserData, accessToken, userData.rememberMe);
                console.log('User authenticated from stored data');
            } else {
                clearAuthData();
                updateAuthStore(null);
            }
        } else {
            updateAuthStore(null);
        }
    } catch (error) {
        console.error('Auth initialization error:', error);
        updateAuthStore(null);
    }
};

// Проверка авторизации с возможностью обновления токена
export const checkAndRefreshToken = async (): Promise<boolean> => {
    if (!isAuthenticated()) {
        updateAuthStore(null);
        return false;
    }
    
    try {
        // Простая проверка - если есть токен, считаем авторизованным
        const userData = getStoredUserData();
        const { accessToken } = getAuthTokens();
        
        if (userData && accessToken) {
            updateAuthStore(
                {
                    id: userData.user_id?.toString() || '',
                    email: userData.email || '',
                    username: userData.username || '',
                    full_name: userData.full_name || ''
                },
                accessToken,
                userData.rememberMe
            );
            return true;
        }
        
        // Если токен истек, пробуем обновить
        try {
            const refreshResult = await refreshToken();
            if (refreshResult.success && refreshResult.data) {
                const updatedUserData = getStoredUserData();
                if (updatedUserData) {
                    updateAuthStore(
                        {
                            id: updatedUserData.user_id?.toString() || '',
                            email: updatedUserData.email || '',
                            username: updatedUserData.username || '',
                            full_name: updatedUserData.full_name || ''
                        },
                        refreshResult.data.access,
                        updatedUserData.rememberMe
                    );
                    return true;
                }
            }
        } catch (refreshError) {
            console.warn('Token refresh failed:', refreshError);
        }
        
        updateAuthStore(null);
        return false;
        
    } catch (error) {
        console.error('Token check error:', error);
        updateAuthStore(null);
        return false;
    }
};


// Хук для удобного использования аутентификации
export const useAuth = () => {
    const {
        allUserData,
        loading,
        user: storeUser,
        isLoggedIn,
        setUser,
        setLoading,
        setError
    } = useAuthStore();
    
    return {
        // ✅ СОВМЕСТИМОСТЬ С HEADER
        user: allUserData, // для совместимости с Header
        currentUser: storeUser(), // альтернативное название
        loading,
        isAuthenticated: isLoggedIn(), // убрали лишние скобки
        error: useAuthStore.getState().error, // получаем error из store
        
        // Методы
        login: async (email: string, password: string, rememberMe: boolean = false) => {
            return await login(email, password, rememberMe);
        },
        
        logout: async () => {
            return await logout();
        },
        
        register: async (email: string, password: string, fullName?: string, username?: string) => {
            return await register(email, password, fullName, username);
        },
        
        // ✅ ДЛЯ HEADER
        getProfileData: () => {
            if (!allUserData) return null;
            
            return {
                name: allUserData.full_name || allUserData.username || 'Пользователь',
                email: allUserData.email || 'user@example.com',
                role: 'Пользователь',
                avatar: null,
                // Дополнительные поля для совместимости
                username: allUserData.username,
                full_name: allUserData.full_name,
                isDemo: allUserData.isDemo || false,
                rememberMe: allUserData.rememberMe || false
            };
        },
        
        // Вспомогательные методы
        updateUser: (userData: UserData | null, token?: string, rememberMe?: boolean) => {
            if (userData) {
                const allUserData = transformToAllUserData(userData, token, rememberMe);
                setUser(allUserData);
            } else {
                setUser(null);
            }
        },
        
        setAuthLoading: (isLoading: boolean) => {
            setLoading(isLoading);
        },
        
        // ✅ ДЛЯ ПРОВЕРКИ АВТОРИЗАЦИИ
        checkAuthStatus: async () => {
            return await checkAndRefreshToken();
        }
    };
};

export default {
    login,
    logout,
    register,
    requestPasswordReset,
    resetPassword,
    changePassword,
    refreshToken,
    setAuthTokens,
    getAuthTokens,
    clearAuthData,
    isAuthenticated,
    getStoredUserData,
    getRememberMeStatus,
    checkAndRefreshToken,
    initializeAuth,
    useAuth
};