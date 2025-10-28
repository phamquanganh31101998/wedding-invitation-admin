# Wedding Invitation Administrator

A modern web application for managing wedding invitations, built with Next.js 15 and TypeScript.

## Features

- 🔐 Admin authentication with NextAuth.js
- 🎨 Beautiful UI with Ant Design
- 📱 Responsive design
- 🚀 Built with Next.js 15 and TypeScript
- 📝 Form validation with Formik and Yup
- 🌐 Ready for Vercel deployment

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **UI Library**: Ant Design
- **Form Handling**: Formik + Yup
- **Styling**: CSS + Ant Design
- **Database**: Ready for Neon integration
- **Deployment**: Vercel

## Getting Started

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Set up environment variables**:
   Copy `.env.local` and update the values:
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=password123
   ```

3. **Run the development server**:
   ```bash
   yarn dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login Credentials

- **Username**: admin
- **Password**: password123

## Project Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/     # NextAuth API routes
│   ├── dashboard/                  # Protected dashboard page
│   ├── login/                      # Login page
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page (redirects)
│   └── globals.css                 # Global styles
├── components/
│   └── SessionProvider.tsx         # NextAuth session provider
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn format` - Format code with Prettier

## Deployment

This project is ready for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Future Features

- Guest list management
- Invitation templates
- RSVP tracking
- Email notifications
- Database integration with Neon
- File upload for photos/documents

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request