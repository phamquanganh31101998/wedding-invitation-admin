# Technology Stack

## Framework & Runtime

- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **React 18** with modern hooks and patterns
- **Node.js** runtime environment

## UI & Styling

- **Ant Design 5.x** as primary UI component library
- **CSS** for custom styling alongside Ant Design
- **Inter font** from Google Fonts
- Responsive design patterns

## Authentication & Session Management

- **NextAuth.js 4.x** for authentication
- Session-based authentication with environment credentials
- Protected route patterns using middleware

## Database & Data Layer

- **Neon Database** (PostgreSQL-compatible serverless)
- **@neondatabase/serverless** driver for optimal performance
- Connection pooling for better performance
- SQL-first approach with direct queries

## Form Handling & Validation

- **Formik** for form state management
- **Yup** for schema validation
- Type-safe form patterns

## Development Tools

- **ESLint** with Next.js configuration
- **Prettier** for code formatting
- **TypeScript** strict mode enabled
- **Yarn** as package manager

## Build & Deployment

- **Vercel** optimized configuration
- Environment variable management
- Server Components external packages optimization

## Common Commands

```bash
# Development
yarn dev              # Start development server
yarn build           # Build for production
yarn start           # Start production server

# Code Quality
yarn lint            # Run ESLint
yarn lint:fix        # Fix ESLint issues automatically
yarn format          # Format code with Prettier

# Package Management
yarn install         # Install dependencies
yarn add <package>   # Add new dependency
```

## Environment Configuration

- `.env.development.local` for local development
- `.env.example` as template
- Required variables: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DATABASE_URL`

## Note

- UI app route components do not contain business logic, only page-level concerns (refer to src/app/(authenticated)/tenants/page.tsx to understand how you should write code)
- Don't create test files
- Use NiceModal for Modal
- Try reuse existing components as much as possible
