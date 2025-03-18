# Authentication System

## Overview

This project uses [NextAuth.js](https://next-auth.js.org/) as the primary authentication system. While there are some Firebase Auth components available for legacy support, new code should use NextAuth.js exclusively.

## Authentication Flow

1. Users authenticate via the login form, which connects to the NextAuth.js API endpoints
2. Upon successful authentication, NextAuth.js creates a JWT token and stores it in an HTTP-only cookie
3. The token includes a reference to a refresh token stored in the database
4. The middleware checks for the presence of the NextAuth.js session cookie to protect routes
5. When the token expires, it is automatically refreshed using the refresh token

## Security Features

- **JWT with short expiry**: Access tokens expire after 1 hour
- **Refresh token rotation**: Each refresh token can only be used once
- **Token reuse detection**: If a refresh token is used more than once, all tokens for that user are invalidated
- **CSRF Protection**: All state-modifying API requests require a valid CSRF token
- **Rate limiting**: Login attempts are rate-limited to prevent brute force attacks
- **Content Security Policy**: Strict CSP headers are set to prevent XSS attacks

## How to Add Authentication to a New Route

1. Add the route to the matcher in `middleware.ts` 
2. Check for authentication in the route handler:

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  // Proceed with authenticated request
}
```

## Migrating from Firebase Auth

If you're working with legacy code that uses Firebase Auth:

1. Check if the route needs both authentication systems by examining the middleware
2. When possible, refactor to use NextAuth.js exclusively
3. For routes that still need Firebase Auth, check for the `firebase-auth-token` cookie

## Auth-Related Files

- `src/lib/auth/authOptions.ts` - NextAuth.js configuration
- `src/middleware.ts` - Route protection and security headers
- `src/app/api/auth` - Auth API endpoints 