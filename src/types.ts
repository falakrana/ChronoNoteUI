export interface Note {
  id?: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
  deleted?: boolean;
}

export interface NoteVersion {
  id: number;
  noteId: number;
  title: string;
  content: string;
  versionNumber: number;
  timestamp: string;
}

export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tenantId: string;
  email: string;
}
