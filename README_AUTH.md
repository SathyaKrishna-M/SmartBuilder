# KnowSpark - Supabase Authentication & Cloud Storage Integration

## Overview

KnowSpark has been upgraded to support multi-user authentication and cloud storage using Supabase. The app now supports:

- ✅ Email/password authentication
- ✅ Google OAuth authentication
- ✅ Per-user project storage in Supabase
- ✅ Automatic sync between localStorage and Supabase
- ✅ Offline persistence (localStorage as fallback)
- ✅ Real-time sync status indicators

## Architecture

### Authentication Flow

1. **Sign Up/Login**: Users can create accounts or sign in with email/password or Google
2. **Session Management**: Supabase handles session persistence and token refresh
3. **Auto-Sync**: Projects automatically sync when users sign in
4. **Offline Support**: All operations work offline using localStorage as fallback

### Data Storage

- **localStorage**: Primary storage for offline support and fast access
- **Supabase**: Cloud storage for cross-device sync and backup
- **Sync Strategy**: Projects are merged on login, keeping the most recent version

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
```

### 4. Set Up Database

Run the SQL migration in Supabase SQL Editor:

```sql
-- See supabase/migrations/001_create_projects_table.sql
```

This creates:
- `projects` table with Row Level Security
- Policies for user-specific data access
- Indexes for performance
- Automatic `updated_at` timestamp updates

### 5. Enable Google OAuth (Optional)

1. Go to Authentication > Providers in Supabase
2. Enable Google provider
3. Configure OAuth credentials from Google Cloud Console
4. Add redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

## Key Features

### Authentication

- **Email/Password**: Traditional sign up and login
- **Google OAuth**: One-click Google sign-in
- **Session Persistence**: Automatic session restoration on page reload
- **Secure Logout**: Clears session and local sync data

### Cloud Storage

- **Automatic Sync**: Projects sync to cloud when user is authenticated
- **Debounced Writes**: Cloud writes are debounced (1 second) to reduce API calls
- **Merge Strategy**: Latest updated project wins in case of conflicts
- **Offline First**: localStorage is always the source of truth

### User Experience

- **Sync Status**: Visual indicator shows sync status (Syncing/Synced)
- **Auth Button**: Shows user email and logout option when authenticated
- **Seamless Flow**: Works offline, syncs when online
- **Error Handling**: Graceful fallback to localStorage on errors

## File Structure

```
lib/
  supabase/
    client.ts              # Supabase client configuration
    auth.ts                # Authentication functions
    projects.ts            # Cloud project operations
    sync.ts                # Sync logic between local and cloud
    database.types.ts      # TypeScript types for database

components/
  auth/
    auth-provider.tsx      # Auth context and provider
    auth-button.tsx        # Auth UI component

app/
  auth/
    login/
      page.tsx            # Login page
    signup/
      page.tsx            # Signup page
    callback/
      route.ts            # OAuth callback handler

supabase/
  migrations/
    001_create_projects_table.sql  # Database schema
```

## API Reference

### Authentication Functions

```typescript
// Sign up with email/password
await signUp(email, password)

// Sign in with email/password
await signIn(email, password)

// Sign in with Google
await signInWithGoogle()

// Sign out
await signOut()

// Get current user
await getCurrentUser()
```

### Project Storage Functions

```typescript
// Save project (automatically syncs to cloud if authenticated)
await saveProject(project)

// Load projects from cloud
await loadProjectsFromCloud(userId)

// Sync local and cloud projects
await syncLocalWithCloud(userId)
```

### Storage Functions (Updated)

All storage functions now support async operations and automatically sync to cloud:

```typescript
// Create project
await createProject(title)

// Save project
await saveProject(project)

// Delete project
await deleteProject(id)

// Add question
await addQuestionToProject(projectId, questionText)

// Update answer
await updateQuestionAnswer(projectId, questionId, answer)

// Delete question
await deleteQuestion(projectId, questionId)

// Update question text
await updateQuestionText(projectId, questionId, text)

// Reorder questions
await reorderQuestions(projectId, questionIds)
```

## Security

### Row Level Security (RLS)

All database operations are protected by RLS policies:

- Users can only view their own projects
- Users can only insert/update/delete their own projects
- All policies use `auth.uid()` to enforce user isolation

### API Keys

- `anon` key is safe to use in client-side code (protected by RLS)
- Never commit `.env.local` to version control
- All API requests are automatically authenticated via Supabase

## Troubleshooting

### Sync Not Working

1. Check that user is authenticated (look for email in header)
2. Verify Supabase environment variables are set correctly
3. Check browser console for errors
4. Verify database table and policies are set up correctly

### Authentication Issues

1. Verify Supabase project URL and anon key are correct
2. Check that email confirmation is disabled (for development)
3. Verify OAuth redirect URIs are configured correctly
4. Check browser console for detailed error messages

### Database Issues

1. Verify migration SQL was executed successfully
2. Check RLS policies are enabled and correct
3. Verify user has proper permissions in Supabase dashboard
4. Check Supabase logs for detailed error messages

## Migration from Local Storage Only

Existing users with localStorage data will automatically have their projects synced to cloud when they:

1. Sign up or log in
2. Their local projects will be merged with any cloud projects
3. The most recently updated version of each project will be kept

## Next Steps

- Add project sharing between users
- Implement real-time collaboration
- Add project export/import functionality
- Implement project versioning
- Add project templates

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Check Supabase dashboard for database errors
4. Review the setup guide in `SUPABASE_SETUP.md`

