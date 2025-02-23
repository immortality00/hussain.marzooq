# Hussain Marzooq Portfolio

A modern, responsive portfolio website built with Next.js and deployed on Netlify.

## Project Overview

This portfolio showcases my professional work, skills, and experiences using modern web technologies. The website is built with performance, accessibility, and user experience in mind.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (Latest version)
- **Styling**: TailwindCSS
- **Language**: TypeScript
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Storage
  - Analytics
- **Deployment**: Netlify
- **Version Control**: Git/GitHub

## Project Structure

```
src/
├── app/                    # App router directory
│   ├── page.tsx           # Home page
│   ├── admin/             # Admin section
│   │   ├── login/        # Admin login
│   │   │   └── page.tsx
│   │   └── dashboard/    # Admin dashboard
│   │       └── page.tsx
│   ├── about/             # About page
│   │   └── page.tsx
│   ├── photography/       # Photography page
│   │   └── page.tsx
│   ├── film/             # Film page
│   │   └── page.tsx
│   ├── webdev/           # Web Development page
│   │   └── page.tsx
│   ├── nfts/             # NFTs page
│   │   └── page.tsx
│   ├── dance/            # Dance page
│   │   └── page.tsx
│   ├── layout.tsx        # Root layout with navigation
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   │   └── header/      
│   │       └── Navigation.tsx  # Main navigation component
│   └── sections/        # Page sections
├── lib/                 # Library code
│   ├── context/         # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── firebase/        # Firebase configuration
│   │   ├── config.ts    # Client-side Firebase config
│   │   ├── admin.ts     # Server-side Firebase Admin
│   │   └── utils.ts     # Firebase utility functions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   └── actions/        # Server actions
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

### Pages Structure

The portfolio consists of the following pages:

- **Home** (`/`): Landing page with portfolio overview
- **About** (`/about`): Personal information and background
- **Photography** (`/photography`): Photography portfolio
- **Film** (`/film`): Film and video projects
- **Web Development** (`/webdev`): Web development projects
- **NFTs** (`/nfts`): NFT collections and projects
- **Dance** (`/dance`): Dance performances and projects

### Navigation

The site includes a responsive navigation system that:
- Provides easy access to all main sections
- Highlights the current active page
- Adapts to different screen sizes
- Features smooth hover transitions
- Uses Next.js 13+ App Router for optimal performance

### Latest Updates (2024-02-23)
- Added all main portfolio pages with placeholder content
- Implemented responsive navigation system
- Set up base layout and styling structure
- Configured Next.js 13+ App Router
- Added TypeScript support throughout the project
- Added secure admin authentication system
- Implemented protected admin routes
- Created admin dashboard with logout functionality
- Added authentication middleware
- Set up Firebase Auth integration
- Enhanced admin dashboard with content management sections
- Added quick stats overview
- Implemented section-specific navigation
- Created reusable auth protection hook

## Development Workflow

The project follows a structured development workflow to ensure code quality and stable deployments:

### Branch Strategy
- `main` - Production branch, connected to Netlify deployment
- `development` - Main development branch where all features are tested before production
- Feature branches - Created from `development` for specific features/fixes

### Development Process
1. All development work happens in feature branches
2. Changes are merged to `development` for testing
3. Once approved, changes are merged to `main` for production deployment

## Project Status

- 🟢 Production: Live on Netlify
- 🔄 Active Development: In progress
- 📦 Dependencies: Up to date

## Local Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deployment

The project is deployed on Netlify with automatic deployments from the `main` branch.

### Production URL
[Live Website URL]

### Deployment Status
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-NETLIFY-BADGE/deploy-status)](https://app.netlify.com/sites/YOUR-SITE/deploys)

## Updates Log

### Latest Updates (YYYY-MM-DD)
- Initial repository setup
- Development and production branches established
- README documentation created

## Contributing

This is a personal portfolio project. While it's public for viewing, contributions are currently not accepted.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Firebase Configuration

The project uses Firebase for backend services. To set up Firebase:

1. Create a `.env.local` file in the root directory with the following variables:
```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""

# Firebase Admin (Server-side)
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""
```

2. Get these values from your Firebase Console:
   - Create a new project in Firebase Console
   - Enable required services (Auth, Firestore, Storage)
   - Get Web App configuration
   - Generate service account key for Admin SDK

3. Firebase features available:
   - Authentication
   - Firestore Database
   - Cloud Storage
   - Analytics (browser-only)
   - Admin SDK (server-side)

### Firebase Utility Functions

The project includes utility functions for common Firebase operations:
- `getDocument`: Fetch a single document from Firestore
- `getCollection`: Query collections with filtering and ordering
- `uploadFile`: Upload files to Firebase Storage

## Authentication System

The project includes a secure authentication system for admin access:

### Admin Routes
- `/admin/login` - Secure login page
- `/admin/dashboard` - Protected admin dashboard

### Security Features
- Firebase Authentication integration
- Protected routes with middleware
- Secure session management
- Automatic redirects for unauthorized access
- Client-side route protection
- Server-side authentication validation

### Authentication Flow
1. Admin accesses `/admin/login`
2. Credentials verified through Firebase Auth
3. Successful login redirects to dashboard
4. Failed attempts show error messages
5. Protected routes check auth status
6. Logout redirects to login page

### Implementation Details
- Uses Firebase Authentication
- Context-based auth state management
- TypeScript for type safety
- Middleware for route protection
- Responsive UI with Tailwind CSS

### Admin Dashboard Features

The admin dashboard provides a comprehensive interface for content management:

#### Content Management Sections
- Photography Portfolio Management
- Film Projects Management
- Web Development Projects
- NFT Collections
- Dance Performances

#### Dashboard Components
- Secure navigation bar with user info and logout
- Quick access cards for each content section
- Statistics overview
- Responsive grid layout
- Section-specific management interfaces

#### Security Implementation
- Custom `useAuthProtection` hook for route protection
- Automatic redirection for unauthenticated users
- Session persistence
- Secure logout functionality

### Latest Updates (2024-02-23)
- Added secure admin authentication system
- Implemented protected admin routes
- Created admin dashboard with logout functionality
- Added authentication middleware
- Set up Firebase Auth integration
- Enhanced admin dashboard with content management sections
- Added quick stats overview
- Implemented section-specific navigation
- Created reusable auth protection hook
