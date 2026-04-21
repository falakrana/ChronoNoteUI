# Note App Frontend

A modern, responsive frontend for the Versioned Notes API built with React, TypeScript, and Vite.

## 🚀 Features

- **Authentication**: Secure signup and login system with persistent session management.
- **Note Management**: Create, read, update, and delete (soft/hard) notes with confirmation workflows.
- **Trash Functionality**: View deleted notes, restore them, or permanently delete them with safety checks.
- **Version History**: Track and view previous versions of any note with built-in diff viewing.
- **Modern UI**: Clean, interactive interface featuring:
  - **Dynamic Themes**: Seamless Dark and Light mode support.
  - **Mobile Responsive**: Fully optimized for mobile with a hamburger menu navigation.
  - **Micro-animations**: Smooth transitions using Framer Motion.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS / Components

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
Ensure the backend is running on `http://localhost:8080` (or update the API base URL in the source).
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📂 Project Structure

- `src/components`: Reusable UI components (Sidebar, NoteCard, Editor, etc.).
- `src/api.ts`: API integration for notes and authentication.
- `src/types.ts`: TypeScript interfaces for core data models.
- `src/index.css`: Comprehensive design system with dark mode tokens.
- `src/App.tsx`: Central application shell and state management.
