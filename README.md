# Hussain Marzooq Portfolio

A modern, responsive portfolio website built with Next.js and deployed on Netlify, featuring advanced animations, micro-interactions, and a cohesive design system.

## Project Overview

This portfolio showcases my professional work, skills, and experiences using modern web technologies. The website is built with performance, accessibility, and user experience in mind, incorporating award-worthy design elements and interactions.

## Features

### 1. Design System
- **Typography**: Dual font system with Playfair Display for headlines and Inter for body text
- **Color System**: Carefully crafted color scales for primary and accent colors
- **Spacing**: Standardized spacing system for consistent layouts
- **Animations**: Comprehensive animation system with custom timing functions
- **Glass Effects**: Optimized glassmorphism with varying intensities

### 2. Interactive Elements
- **Custom Cursor**: Responsive cursor with trailing dot and hover effects
- **Sound System**: Subtle audio feedback for interactions (hover, click, success, error)
- **Micro-interactions**: Carefully crafted animations for buttons, links, and cards
- **Page Transitions**: Smooth transitions between pages using Framer Motion

### 3. Visual Effects
- **Parallax Backgrounds**: Depth-creating parallax effects on scroll
- **Glass Panels**: Beautiful glassmorphic UI elements with optimized performance
- **Dynamic Gradients**: Animated gradient backgrounds and borders
- **Particle Effects**: Subtle particle animations for enhanced visual interest

### 4. Performance Optimizations
- Optimized glass effects and animations
- Efficient image loading and caching
- Debounced event listeners
- Hardware-accelerated animations

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (Latest version)
- **Styling**: 
  - TailwindCSS with custom design system
  - Framer Motion for animations
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
├── app/                    # Next.js app directory
├── components/
│   ├── admin/             # Admin dashboard components
│   ├── effects/           # Visual effects components
│   ├── layout/            # Layout components
│   ├── portfolio/         # Portfolio-related components
│   ├── sections/          # Page section components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── context/          # React context providers
│   ├── firebase/         # Firebase configuration
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
└── types/               # TypeScript type definitions
```

## Design System

### Typography Scale
- `display-1`: 4.5rem - Hero headlines
- `display-2`: 3.75rem - Section headlines
- `display-3`: 3rem - Large titles
- `heading-1`: 2.25rem - Section headers
- `heading-2`: 1.875rem - Subsection headers
- `heading-3`: 1.5rem - Card titles
- `body-large`: 1.125rem - Featured text
- `body`: 1rem - Body text
- `small`: 0.875rem - Captions

### Animation System
- Custom timing functions for different interaction types
- Standardized animation durations and curves
- Hardware-accelerated transforms
- Optimized performance considerations

### Glass Effects
- Multiple blur intensities for different contexts
- Optimized backdrop filters
- Strategic usage of hardware acceleration

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/portfolio.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# ... other Firebase config variables
```

4. Run the development server:
```bash
npm run dev
```

## Deployment

The site is automatically deployed to Netlify on push to the main branch. The deployment process includes:
- Build optimization
- Asset compression
- Environment variable configuration
- Serverless function deployment

## Contributing

While this is a personal portfolio, suggestions and feedback are welcome. Please open an issue to discuss potential improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspiration from award-winning websites
- Framer Motion for powerful animations
- TailwindCSS for utility-first styling
- Firebase for backend services
- Netlify for hosting and deployment

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
- Added portfolio management system with CRUD operations
- Implemented Firestore collections for portfolio categories
- Added real-time updates for portfolio items
- Created reusable PortfolioManager component
- Added category metadata management system
- Implemented about text for each portfolio category
- Added parallel data loading for improved performance
- Implemented contact form with Netlify serverless function
- Added form validation and error handling
- Integrated contact submissions with Firestore
- Added inquiries management system in admin dashboard
- Implemented inquiry status tracking (new/archived)
- Added inquiry deletion functionality
- Enhanced security with protected routes for inquiries
- Enhanced UI with consistent styling and layout system
- Added responsive navigation with mobile support
- Implemented loading states and placeholders
- Added "Coming Soon" states for empty sections
- Created footer with contact and social links
- Integrated Montserrat font for improved typography
- Added hover effects and transitions for better UX
- Implemented responsive grid layouts

## Portfolio Management System

The project includes a comprehensive portfolio management system:

### Features
- Category-based organization:
  - Photography
  - Film
  - Web Development
  - NFTs
  - Dance
- CRUD operations for portfolio items
- Real-time updates
- Category-specific views
- Basic form validation
- Confirmation for deletions
- Loading states and error handling

### Category Metadata
Each category includes:
- Customizable about text
- Last update tracking
- Real-time updates
- Parallel data loading
- Error handling
- Loading states

### Data Structure
Each portfolio item contains:
- Title
- Description
- Creation timestamp
- Last update timestamp

Category metadata contains:
- About text description
- Last update timestamp
- Category-specific information

### Implementation Details
- Uses Firebase Firestore for data storage
- TypeScript interfaces for type safety
- Reusable components for portfolio management
- Real-time data synchronization
- Optimized queries with ordering
- Parallel data fetching
- Error boundary implementation
- Loading state management

### Security Rules
- Protected write operations
- Public read access
- User-based access control
- Timestamp validation
- Data structure validation
- Metadata protection

### Admin Dashboard Features

The admin dashboard provides a comprehensive interface for content management:

#### Content Management Sections
- Photography Portfolio Management
- Film Projects Management
- Web Development Projects
- NFT Collections
- Dance Performances

#### Category Management
- Custom about text for each category
- Real-time preview
- Auto-saving functionality
- Error handling
- Loading states
- Success notifications

#### Dashboard Components
- Secure navigation bar with user info and logout
- Quick access cards for each content section
- Statistics overview
- Responsive grid layout
- Section-specific management interfaces
- Category metadata editor
- Portfolio items manager

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

## Security Features

The project implements multiple layers of security:

### Authentication Security
- Firebase Authentication integration
- Session-based authentication management
- Automatic session expiry after 1 hour
- Activity-based session refresh
- Remember me functionality
- Account lockout after 5 failed attempts (15-minute duration)

### Middleware Protection
- Comprehensive security headers:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection
  - Strict-Transport-Security
  - Content-Security-Policy
  - Referrer-Policy
- Rate limiting for login attempts
- IP-based request tracking
- Cross-Site Request Forgery (CSRF) protection
- Secure routing and redirection

### Session Management
- Client-side session tracking
- Activity monitoring
- Automatic logout on inactivity
- Session validation every minute
- Secure session storage
- Session cleanup on logout

### Route Protection
- Protected admin routes
- Authentication state verification
- Secure middleware checks
- Automatic redirects for unauthorized access
- Additional security checks for admin routes

### Latest Security Updates (2024-02-23)
- Implemented session management system
- Added rate limiting for login attempts
- Enhanced security headers
- Added IP-based tracking
- Implemented account lockout system
- Added activity monitoring
- Enhanced route protection

## Contact Form System

The project includes a serverless contact form system:

### Features
- Serverless function handling with Netlify Functions
- Firebase Firestore integration for storing submissions
- Form validation and error handling
- Loading states and success messages
- Optional fields for phone and dance style
- Real-time form feedback

### Implementation Details
- Uses Netlify Functions for serverless backend
- TypeScript for type safety
- Firebase Admin SDK for secure database access
- Client-side form validation
- Server-side data validation
- Error boundary implementation
- Loading state management

### Security Features
- Server-side validation
- Protected write operations
- Rate limiting (via Netlify)
- Data sanitization
- Error handling
- Secure environment variables

### Contact Form Fields
- Name (required)
- Email (required)
- Phone (optional)
- Dance Style (optional)
- Message (required)

### Serverless Architecture
- Netlify Functions for backend processing
- Firebase Admin SDK for database operations
- Environment variable management
- Error handling and logging
- Success/failure responses
- TypeScript type definitions

### Inquiries Management System

The project includes a comprehensive inquiries management system:

#### Features
- View all contact form submissions
- Sort inquiries by date
- Filter by status (new/archived)
- Archive/restore functionality
- Secure deletion with confirmation
- Protected admin-only access
- Real-time updates

#### Implementation Details
- Firestore integration for data storage
- TypeScript interfaces for type safety
- Protected routes with authentication
- Status management system
- Parallel data loading
- Error handling
- Loading states

#### Security Features
- Admin-only access
- Protected API endpoints
- Secure deletion
- Data validation
- Access control rules
- Activity logging

## UI Components and Styling

The project implements a comprehensive styling system:

### Layout System
- Consistent layout with header and footer
- Responsive container widths
- Proper spacing and padding
- Mobile-first approach
- Flexible grid system

### Navigation Features
- Responsive navigation bar
- Mobile menu support
- Active state indicators
- Smooth hover transitions
- Icon integration
- Collapsible mobile menu

### Design Elements
- Consistent color scheme
- Typography system using Montserrat
- Card-based layouts
- Loading states and animations
- Empty state placeholders
- Hover effects
- Shadow hierarchy

### Responsive Design
- Mobile-first approach
- Breakpoint-based layouts
- Flexible grids
- Adaptive typography
- Responsive spacing
- Touch-friendly interactions

### Component Features
- Loading skeletons
- Empty state messages
- Error handling states
- Success indicators
- Interactive elements
- Consistent spacing

### Footer Features
- Responsive grid layout
- Contact information
- Social media links
- Quick navigation
- Copyright information
- Hover effects

## Latest Updates (2024-02-24)

### Security Enhancements
- Updated Content Security Policy (CSP) to properly allow Firebase connections
- Added secure headers for better protection
- Implemented proper CORS and frame protection
- Enhanced Firebase connection security

### Firebase Integration Improvements
- Simplified Firestore initialization for better reliability
- Removed complex persistent cache configuration
- Enhanced error handling for network issues
- Improved offline mode handling

### Code Optimizations
- Updated Firebase configuration structure
- Enhanced error handling in portfolio data fetching
- Improved loading states and error messages
- Added network status indicators

### Security Headers
The application now includes comprehensive security headers:
```javascript
- X-DNS-Prefetch-Control
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security
- Content-Security-Policy (with Firebase domains)
```

### Firebase Configuration
Updated Firebase configuration structure with proper environment variable handling:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
```

### Environment Setup
To set up the project locally:

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in your Firebase configuration values
4. Install dependencies: `npm install`
5. Run development server: `npm run dev`

### Security Best Practices
- Environment variables are properly handled
- Sensitive data is excluded from version control
- Security headers are implemented
- Firebase security rules are in place
- CSP is configured for Firebase services
