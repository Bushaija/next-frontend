# Database & TanStack Query Setup Guide

This guide will help you set up Drizzle ORM with Neon Postgres and TanStack Query for your Next.js signup system.

## 📦 Installation

First, install the required dependencies using bun:

```bash
# Install the missing dependencies
bun add @neondatabase/serverless @tanstack/react-query bcryptjs @types/bcryptjs

# Or install all dependencies
bun install
```

## 🗄️ Database Setup

### 1. Environment Variables
Make sure your `.env` file has the Neon database connection string:

```env
NEON_DB_CONNECTION_STRING='postgresql://hiv_tracker_db_owner:npg_cPTm4CyG0wes@ep-lucky-river-a8samy2s-pooler.eastus2.azure.neon.tech/hiv_tracker_db?sslmode=require'
```

### 2. Generate and Push Schema
Run these commands to set up your database:

```bash
# Generate migration files
bun run db:generate

# Push schema to database (for development)
bun run db:push

# Optional: Open Drizzle Studio to view your database
bun run db:studio
```

## 🏗️ Project Structure

The setup includes these key files:

```
lib/
├── db/
│   ├── config.ts          # Database connection
│   ├── schema.ts          # User table schema & validation
│   └── migrations/        # Generated migration files
├── api/
│   └── auth.ts           # API client functions
├── hooks/
│   └── use-auth.ts       # TanStack Query hooks
└── providers/
    └── query-provider.tsx # TanStack Query provider
```

## 🔧 Usage Examples

### 1. Using the TanStack Query Version (Recommended)

Replace your current signup page with the TanStack Query version:

```tsx
// In your route file, use the new component
import RegisterPageWithQuery from "./page-with-query";

export default RegisterPageWithQuery;
```

### 2. API Endpoints Available

- **POST** `/api/auth/register` - User registration
  - Validates input with Zod
  - Checks for existing users
  - Hashes passwords with bcrypt
  - Returns user data (excluding password)

### 3. TanStack Query Hook Usage

```tsx
import { useRegisterForm } from "@/lib/hooks/use-auth";

function MyComponent() {
  const { register, isLoading, error } = useRegisterForm();
  
  const handleSubmit = async (data) => {
    const result = await register(data);
    if (result.success) {
      // Handle success
    } else {
      // Handle errors
    }
  };
}
```

## 🎯 Key Features

### Database Schema
- ✅ UUID primary keys
- ✅ Email uniqueness constraints
- ✅ Password hashing with bcrypt
- ✅ Location data (province, district, hospital)
- ✅ Timestamps and email verification flags

### API Features
- ✅ Zod validation
- ✅ Proper error handling
- ✅ Type-safe responses
- ✅ Duplicate email detection
- ✅ Secure password hashing

### TanStack Query Integration
- ✅ Optimistic updates
- ✅ Automatic error handling
- ✅ Loading states
- ✅ Retry logic
- ✅ Development tools

## 🔄 Migration vs Form Actions

You have two approaches to choose from:

### Option 1: Pure TanStack Query (Recommended)
- Uses the `page-with-query.tsx` component
- Direct API calls via TanStack Query
- Better error handling and loading states
- More predictable state management

### Option 2: Server Actions + TanStack Query
- Use the enhanced server actions in `register-action-new.ts`
- Combines Next.js form actions with TanStack Query
- Good for progressive enhancement

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify your `NEON_DB_CONNECTION_STRING` is correct
   - Ensure your Neon database is accessible

2. **Migration Issues**
   - Try `bun run db:push` instead of `db:generate` for development
   - Check that your schema file has no syntax errors

3. **TypeScript Errors**
   - Make sure all dependencies are installed
   - Run `bun install` to ensure all types are available

### Useful Commands

```bash
# Check database schema
bun run db:studio

# Reset and push schema (development only)
bun run db:push

# Check package installation
bun install --dry-run

# Run the development server
bun run dev
```

## 🚀 Next Steps

1. **Install dependencies**: `bun install`
2. **Push database schema**: `bun run db:push`
3. **Test the registration flow**: Use the new `page-with-query.tsx`
4. **Add authentication**: Extend with login/logout functionality
5. **Add more features**: Email verification, password reset, etc.

## 📝 Notes

- The setup uses Neon's serverless Postgres for scalability
- Passwords are hashed with bcrypt (12 rounds)
- TanStack Query provides excellent developer experience
- All API responses are type-safe with TypeScript
- The schema is extensible for future features

Happy coding! 🎉 