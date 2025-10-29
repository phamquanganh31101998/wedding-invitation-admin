# Project Structure & Organization

## Directory Layout

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth.js authentication endpoints
│   │   └── test-db/       # Database connection testing
│   ├── dashboard/         # Protected admin dashboard
│   ├── login/            # Authentication pages
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Home page (redirect logic)
│   └── globals.css       # Global styles
├── components/            # Reusable React components
│   └── SessionProvider.tsx
├── lib/                  # Utility libraries and configurations
│   ├── db.ts            # Database connection and utilities
│   └── schema.sql       # Database schema definitions
└── types/               # TypeScript type definitions
    └── next-auth.d.ts   # NextAuth type extensions
```

## Architectural Patterns

### App Router Structure

- Use `page.tsx` for route pages
- Use `layout.tsx` for shared layouts
- API routes in `app/api/` directory
- Server and Client Components separation

### Component Organization

- Place reusable components in `src/components/`
- Use TypeScript interfaces for component props
- Follow Ant Design component patterns
- Implement proper error boundaries

### Database Layer

- Centralized database connection in `src/lib/db.ts`
- SQL schema definitions in `src/lib/schema.sql`
- Use direct SQL queries with Neon serverless driver
- Implement proper error handling for database operations

### Authentication Flow

- NextAuth.js configuration in `api/auth/[...nextauth]/`
- Session provider wrapping in root layout
- Protected routes using session checks
- Redirect logic in home page component

## File Naming Conventions

- **Pages**: `page.tsx` (App Router convention)
- **Layouts**: `layout.tsx` (App Router convention)
- **Components**: PascalCase (e.g., `SessionProvider.tsx`)
- **Utilities**: camelCase (e.g., `db.ts`)
- **Types**: camelCase with `.d.ts` extension
- **API Routes**: `route.ts` (App Router convention)

## Import Patterns

- Use `@/` alias for src directory imports
- Prefer named imports over default imports where possible
- Group imports: external libraries, internal modules, relative imports
- Use TypeScript import types when importing only for types

## Code Organization Principles

- **Separation of Concerns**: Database logic in `lib/`, UI in `components/`, pages in `app/`
- **Type Safety**: Define interfaces for all data structures
- **Error Handling**: Implement try-catch blocks for async operations
- **Environment Configuration**: Use environment variables for sensitive data
- **Multi-tenant Architecture**: Tenant-based data isolation in database queries
