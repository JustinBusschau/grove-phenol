import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:23001';

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      throw new Error(axiosError.response?.data?.message || 'Login failed');
    } else if (error && typeof error === 'object' && 'request' in error) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error('Login failed - please try again');
    }
  }
}

export async function logout(): Promise<void> {
  // Clear token from localStorage
  localStorage.removeItem('phenol_token');
  localStorage.removeItem('phenol_user');
}

export function getToken(): string | null {
  return localStorage.getItem('phenol_token');
}

export function getUser(): User | null {
  const userStr = localStorage.getItem('phenol_user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveAuthData(token: string, user: User): void {
  localStorage.setItem('phenol_token', token);
  localStorage.setItem('phenol_user', JSON.stringify(user));
}
