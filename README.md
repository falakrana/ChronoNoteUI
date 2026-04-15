# Note App Frontend

A modern, responsive frontend for the Versioned Notes API built with React, TypeScript, and Vite.

## 🚀 Features

- **Note Management**: Create, read, update, and delete (soft/hard) notes.
- **Trash Functionality**: View deleted notes, restore them, or permanently delete them.
- **Version History**: Track and view previous versions of any note.
- **Modern UI**: Clean and intuitive user interface built with customized CSS and components.

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

- `src/components`: Reusable UI components.
- `src/api.ts`: API integration with the Spring Boot backend.
- `src/types.ts`: TypeScript interfaces for the Note models.
- `src/index.css`: Global styles and design system.
