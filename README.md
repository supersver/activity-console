# Activity Console

A [Next.js](https://nextjs.org) application for managing and displaying task activities. Built with React, Redux Toolkit, TypeScript, and Tailwind CSS.

## Prerequisites

- Node.js 18+ or later
- npm, yarn, pnpm, or bun package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd activity-console
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_WS_URL=ws://localhost:4000/ws
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Commands

### Development

- **`npm run dev`** - Start the development server with hot-reload on [http://localhost:3000](http://localhost:3000)

### Production

- **`npm run build`** - Build the application for production
- **`npm run start`** - Start the production server

### Testing

- **`npm run test`** - Run all tests once using Jest
- **`npm run test:watch`** - Run tests in watch mode for continuous development

### Code Quality

- **`npm run lint`** - Run ESLint to check code quality

## Project Structure

```
src/
├── app/                    # Next.js app router and global styles
├── components/             # Reusable UI components
├── features/               # Feature-based modules
│   └── tasks/              # Task management feature
│       ├── api/            # API functions
│       ├── cache/          # Caching logic
│       ├── components/     # Task-specific components
│       ├── hooks/          # Custom React hooks
│       ├── store/          # Redux store and selectors
│       ├── types/          # TypeScript type definitions
│       └── utils/          # Utility functions
├── lib/                    # Shared utilities (hooks, store)
└── providers/              # Context providers and app setup
```

## Tech Stack

- **Framework**: Next.js 16.2.9
- **UI Library**: React 19.2.4
- **State Management**: Redux Toolkit 2.12.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Testing**: Jest 30.4.2, React Testing Library
- **Linting**: ESLint 9

## Development Workflow

1. Start the development server: `npm run dev`
2. Make changes to files in `src/` - the page will auto-update
3. Run tests with `npm run test` or `npm run test:watch`
4. Check code quality with `npm run lint`
5. Build for production with `npm run build`
6. Test the production build with `npm run start`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
