import axios from 'axios';
import type { AuthPayload, AuthResponse, Folder, Note, NoteVersion } from './types';

const NOTES_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/notes';
const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:8080/api/auth';
const FOLDERS_API_BASE_URL =
  import.meta.env.VITE_FOLDERS_API_BASE_URL ?? 'http://localhost:8080/api/folders';
const AUTH_TOKEN_STORAGE_KEY = 'noteapp_auth_token';

export const authStorage = {
  getToken: () => window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
  setToken: () => window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, 'true'), // Store a dummy value to keep login state across reloads
  clearToken: () => window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
};

const noteClient = axios.create({
  baseURL: NOTES_API_BASE_URL,
  withCredentials: true,
});

const authClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  withCredentials: true,
});

const folderClient = axios.create({
  baseURL: FOLDERS_API_BASE_URL,
  withCredentials: true,
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
  logout: async () => {
    await authClient.post('/logout');
  }
};

export const noteApi = {
  getAllNotes: async (params?: { folderId?: number; rootOnly?: boolean }) => {
    const response = await noteClient.get<Note[]>('', { params });
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

export const folderApi = {
  getAllFolders: async () => {
    const response = await folderClient.get<Folder[]>('');
    return response.data;
  },
  createFolder: async (folder: Pick<Folder, 'name' | 'parentFolderId'>) => {
    const response = await folderClient.post<Folder>('', folder);
    return response.data;
  },
  updateFolder: async (id: number, folder: Pick<Folder, 'name' | 'parentFolderId'>) => {
    const response = await folderClient.put<Folder>(`/${id}`, folder);
    return response.data;
  },
  deleteFolder: async (id: number) => {
    await folderClient.delete(`/${id}`);
  },
  getTrashFolders: async () => {
    const response = await folderClient.get<Folder[]>('/trash');
    return response.data;
  },
  restoreFolder: async (id: number) => {
    await folderClient.put(`/${id}/restore`);
  },
  hardDeleteFolder: async (id: number) => {
    await folderClient.delete(`/${id}/permanent`);
  },
};
