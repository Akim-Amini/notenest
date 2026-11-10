# NoteNest

NoteNest is a simple, colorful place to capture your thoughts, organize tasks, and keep important notes close at hand.

## Features

- Create text notes and interactive checklists.
- Pin important notes so they stay easy to find.
- Choose pastel colors and add tags to organize notes.
- Search notes, checklist items, and tags.
- Move notes to the trash and undo a deletion.
- Export a single note as Markdown or export all notes as a JSON backup. Import a JSON backup to restore notes.
- Switch between a phone-style preview and a desktop workspace.
- Toggle dark mode.
- Install NoteNest as a Progressive Web App (PWA) and use it offline after the app has loaded.

## Screenshots

<!-- Add screenshots of NoteNest here. -->

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/).

### Install and run

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd notes-taking-app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Create a production build:

   ```bash
   npm run build
   ```

## Note Storage and Backups

Your notes are saved in your browser's `localStorage` on the device and browser you use. They are not automatically synced elsewhere. Export JSON backups regularly so you can restore your notes if you clear browser data or switch devices.

## Author

Built by **Akim Amini**.
