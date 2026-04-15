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
  note: Note;
  title: string;
  content: string;
  versionedAt: string;
}
