import axios from 'axios';
import type { Note, NoteVersion } from './types';

const API_BASE_URL = 'http://localhost:8080/api/notes';

const api = axios.create({
  baseURL: API_BASE_URL,
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
