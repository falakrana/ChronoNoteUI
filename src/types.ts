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

