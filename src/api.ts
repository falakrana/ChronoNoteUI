import axios from 'axios';
import type { AuthPayload, AuthResponse, Note, NoteVersion } from './types';

const NOTES_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/notes';
const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:8080/api/auth';
const AUTH_TOKEN_STORAGE_KEY = 'noteapp_auth_token';

export const authStorage = {
  getToken: () => window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
  setToken: (token: string) => window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token),
  clearToken: () => window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
};

const noteClient = axios.create({
  baseURL: NOTES_API_BASE_URL,
});

noteClient.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (!token) {
    return config;
  }
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const authClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
});

export const authApi = {
  signup: async (payload: AuthPayload) => {
    const response = await authClient.post<AuthResponse>('/signup', payload);
    return response.data;
  },
  login: async (payload: AuthPayload) => {
    const response = await authClient.post<AuthResponse>('/login', payload);
    return response.data;
  },
};

export const noteApi = {
  getAllNotes: async () => {
    const response = await noteClient.get<Note[]>('');
    return response.data;
  },
  getTrashNotes: async () => {
    const response = await noteClient.get<Note[]>('/trash');
    return response.data;
  },
  getNoteById: async (id: number) => {
    const response = await noteClient.get<Note>(`/${id}`);
    return response.data;
  },
  createNote: async (note: Note) => {
    const response = await noteClient.post<Note>('', note);
    return response.data;
  },
  updateNote: async (id: number, note: Note) => {
    const response = await noteClient.put<Note>(`/${id}`, note);
    return response.data;
  },
  softDelete: async (id: number) => {
    await noteClient.delete(`/${id}`);
  },
  restoreNote: async (id: number) => {
    await noteClient.put(`/${id}/restore`);
  },
  hardDelete: async (id: number) => {
    await noteClient.delete(`/${id}/permanent`);
  },
  getNoteHistory: async (id: number) => {
    const response = await noteClient.get<NoteVersion[]>(`/${id}/history`);
    return response.data;
  },
};
