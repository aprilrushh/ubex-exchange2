const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3035';

export const register = async (userData) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    // 더미 데이터 모드에서는 성공 응답 반환
    return { success: true, message: 'Registration successful' };
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
};

export const login = async (credentials) => {
  if (process.env.REACT_APP_USE_DUMMY_DATA === 'true') {
    // 더미 데이터 모드에서는 성공 응답 반환
    return {
      success: true,
      data: {
        token: 'dummy-token',
        user: {
          id: 1,
          username: credentials.email,
          email: credentials.email
        }
      }
    };
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
}; 