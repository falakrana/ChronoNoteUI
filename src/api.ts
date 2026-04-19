import axios from 'axios';
import type { Note, NoteVersion } from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/notes';
const TENANT_HEADER_NAME = import.meta.env.VITE_TENANT_HEADER_NAME ?? 'X-Tenant-Id';
const TENANT_STORAGE_KEY = 'noteapp_tenant_id';

const resolveTenantId = () => {
  const envTenantId = import.meta.env.VITE_TENANT_ID?.trim();
  if (envTenantId) {
    return envTenantId;
  }

  const savedTenantId = window.localStorage.getItem(TENANT_STORAGE_KEY)?.trim();
  if (savedTenantId) {
    return savedTenantId;
  }

  const generatedTenantId = `tenant-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(TENANT_STORAGE_KEY, generatedTenantId);
  return generatedTenantId;
};

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};
  config.headers[TENANT_HEADER_NAME] = resolveTenantId();
  return config;
});

export const noteApi = {
  getAllNotes: async () => {
    const response = await api.get<Note[]>('');
    return response.data;
  },
  getTrashNotes: async () => {
    const response = await api.get<Note[]>('/trash');
    return response.data;
  },
  getNoteById: async (id: number) => {
    const response = await api.get<Note>(`/${id}`);
    return response.data;
  },
  createNote: async (note: Note) => {
    const response = await api.post<Note>('', note);
    return response.data;
  },
  updateNote: async (id: number, note: Note) => {
    const response = await api.put<Note>(`/${id}`, note);
    return response.data;
  },
  softDelete: async (id: number) => {
    await api.delete(`/${id}`);
  },
  restoreNote: async (id: number) => {
    await api.put(`/${id}/restore`);
  },
  hardDelete: async (id: number) => {
    await api.delete(`/${id}/permanent`);
  },
  getNoteHistory: async (id: number) => {
    const response = await api.get<NoteVersion[]>(`/${id}/history`);
    return response.data;
  },
};
