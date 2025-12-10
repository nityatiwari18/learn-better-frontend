# Learn Better Frontend

A modern React frontend for the Learn Better application - a platform for uploading and managing learning content.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client

## Features

- 🔐 User authentication (login/signup)
- 📊 Dashboard for authenticated users
- 📁 File upload functionality
- 🎨 Clean, responsive UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:nityatiwari18/learn-better-frontend.git
cd learn-better-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── api/           # API client and endpoints
├── components/    # Reusable UI components
│   ├── AuthModal      # Login/Signup modal
│   ├── Header         # Navigation header
│   ├── Layout         # Page layout wrapper
│   ├── Modal          # Base modal component
│   └── UploadModal    # File upload modal
├── pages/         # Page components
│   ├── Home           # Landing page
│   ├── About          # About page
│   └── Dashboard      # User dashboard
├── types/         # Type definitions
├── utils/         # Utility functions
└── App.jsx        # Main app component
```

## Backend

This frontend connects to the [Learn Better Service](https://github.com/nityatiwari18/Learn-Better-Service) backend API.

## License

MIT

