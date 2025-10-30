# Product Overview

Wedding Invitation Administrator is a modern web application for managing wedding invitations and RSVPs. The system supports multi-tenant architecture where each wedding couple gets their own tenant space.

## Core Features

- Admin authentication and session management
- Multi-tenant wedding management (bride/groom pairs)
- RSVP collection and tracking
- Wedding venue and theme customization
- Guest relationship categorization

## Target Users

- Wedding planners and administrators
- Couples managing their own wedding invitations
- Event management companies

## Key Business Logic

- Each tenant represents a unique wedding with bride/groom names, date, and venue
- RSVPs are linked to tenants with attendance status (yes/no/maybe)
- Theme customization with primary/secondary colors
- Guest relationships are tracked for better organization

## Authentication Model

- Simple admin-based authentication using NextAuth.js
- Environment-based credentials for initial setup
- Session-based access control for protected routes
