# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stock Price Dashboard Project

This is a React + TypeScript + Vite project for building a stock price dashboard with AI-powered analysis using the Claude API.

### Development Commands

```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Project Architecture

This is a modern React application built with:
- **Build Tool**: Vite for fast development and optimized builds
- **Language**: TypeScript with strict type checking enabled
- **Framework**: React 19 with hooks and functional components
- **Styling**: CSS modules (expandable to Tailwind CSS)
- **Linting**: ESLint with TypeScript, React Hooks, and React Refresh rules

### Key Configuration Files

- `vite.config.ts`: Vite configuration with React plugin
- `tsconfig.json`: TypeScript project references setup
- `tsconfig.app.json`: Main app TypeScript configuration with strict rules
- `tsconfig.node.json`: Node.js TypeScript configuration for build tools
- `eslint.config.js`: ESLint configuration with React and TypeScript rules

### Planned Architecture

The project will be structured as a client-side application with:
- **State Management**: Zustand for lightweight state management
- **API Integration**: Direct API calls to stock data providers and Claude API
- **Real-time Data**: WebSocket connections for live stock updates
- **UI Components**: Modern component library (Shadcn/ui planned)
- **Charts**: Interactive charts for stock data visualization
- **Storage**: Browser storage (LocalStorage/IndexedDB) for user preferences

### TypeScript Configuration

The project uses strict TypeScript settings including:
- `strict: true` - All strict type checking options
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `noFallthroughCasesInSwitch: true` - Error on fallthrough cases
- `noUncheckedSideEffectImports: true` - Error on side effect imports

### Development Notes

- The project uses ES modules (`"type": "module"` in package.json)
- React 19 is configured with the new JSX transform
- ESLint includes React Hooks rules for proper hook usage
- Vite provides fast HMR for efficient development
- Build output goes to `dist/` directory (ignored by ESLint)