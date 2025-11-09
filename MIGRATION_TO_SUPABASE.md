# Migration to Supabase-Only Storage

## Overview

KnowSpark has been migrated from localStorage to **Supabase-only storage** with **mandatory authentication**. All project operations now require user authentication and data is stored exclusively in Supabase.

## Key Changes

### ✅ Authentication Required
- **All project operations require authentication**
- Users cannot create, view, or modify projects without signing in
- Login/signup pages are integrated into the app flow
- Automatic redirect to login page when accessing projects without auth

### ✅ Supabase-Only Storage
- **localStorage completely removed** from project storage
- All projects are stored in Supabase database
- Data is user-specific (Row Level Security enforces isolation)
- No local fallback - Supabase is the single source of truth

### ✅ User-Specific Data
- Each user only sees their own projects
- Projects are automatically filtered by `user_id`
- Row Level Security (RLS) policies enforce data isolation
- No cross-user data access possible

## Updated Components

### Storage Layer (`lib/storage.ts`)
- **All functions now require authentication**
- `getAllProjects()` - Loads from Supabase for authenticated user
- `saveProject()` - Saves directly to Supabase
- `createProject()` - Requires auth, saves to Supabase
- `deleteProject()` - Requires auth, deletes from Supabase
- All functions throw error if user is not authenticated

### Authentication
- **AuthProvider** - Manages user session state
- **AuthButton** - Shows login button or user email + logout
- **Login/Signup pages** - Full authentication UI
- **Auto-redirect** - Redirects to login when auth required

### UI Updates
- **Home page** - Shows "Sign In to Get Started" when not authenticated
- **Project sidebar** - Shows "Please sign in" message when not authenticated
- **Project page** - Requires authentication to view
- **Share page** - Requires authentication (user-specific)
- **Create project buttons** - Redirect to login if not authenticated

## Database Schema

```sql
create table public.projects (
  id uuid primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  data jsonb not null,
  created_at timestamp,
  updated_at timestamp
);
```

### Row Level Security Policies
- Users can only SELECT their own projects
- Users can only INSERT projects with their own user_id
- Users can only UPDATE their own projects
- Users can only DELETE their own projects

## Migration Steps

### 1. Set Up Supabase
1. Create Supabase project at https://supabase.com
2. Get project URL and anon key
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

### 2. Run Database Migration
1. Go to Supabase SQL Editor
2. Run `supabase/migrations/001_create_projects_table.sql`
3. Verify RLS policies are active

### 3. Test Authentication
1. Start dev server: `npm run dev`
2. Navigate to home page
3. Click "Sign In" button
4. Create account or sign in
5. Verify projects load from Supabase

## Breaking Changes

### ⚠️ localStorage Removed
- **No more local storage** - All data is in Supabase
- **No offline support** - Requires internet connection
- **No local fallback** - Supabase is required

### ⚠️ Authentication Required
- **Cannot create projects without auth**
- **Cannot view projects without auth**
- **Must sign in to use the app**

### ⚠️ User Isolation
- **Each user has separate projects**
- **No shared projects** (unless implemented later)
- **Projects are private by default**

## Benefits

### ✅ Cloud Storage
- Data stored in cloud database
- Access from any device
- Automatic backups
- Scalable infrastructure

### ✅ User Security
- Row Level Security enforces data isolation
- Each user's data is private
- Secure authentication with Supabase

### ✅ Multi-Device Sync
- Projects sync across devices automatically
- Real-time updates
- No manual sync needed

## Limitations

### ❌ No Offline Support
- Requires internet connection
- Cannot work offline
- All operations require Supabase connection

### ❌ No Local Cache
- No localStorage caching
- Every operation hits Supabase
- Slower than local storage (network latency)

### ❌ Authentication Required
- Cannot use app without account
- Must sign up/sign in to create projects
- No anonymous usage

## Future Enhancements

### Potential Improvements
1. **Offline Support** - Add service worker for offline caching
2. **Local Cache** - Cache projects in IndexedDB for faster access
3. **Public Sharing** - Implement public share links (requires share_tokens table)
4. **Collaboration** - Allow multiple users to collaborate on projects
5. **Real-time Updates** - Use Supabase Realtime for live collaboration

## Troubleshooting

### Issue: "Authentication required" error
- **Solution**: Sign in to your account
- Verify Supabase credentials are set in `.env.local`
- Check that auth is working in Supabase dashboard

### Issue: Projects not loading
- **Solution**: Check browser console for errors
- Verify database table exists and RLS policies are set
- Check that user is authenticated
- Verify Supabase connection is working

### Issue: Cannot create projects
- **Solution**: Ensure you're signed in
- Check that RLS policies allow INSERT for authenticated users
- Verify Supabase credentials are correct

## Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google (if configured)
- [ ] Create a project (requires auth)
- [ ] View projects list (requires auth)
- [ ] Edit project (requires auth)
- [ ] Delete project (requires auth)
- [ ] Add question to project (requires auth)
- [ ] View project details (requires auth)
- [ ] Verify projects are user-specific
- [ ] Verify cannot access other users' projects
- [ ] Sign out and verify cannot access projects
- [ ] Verify redirect to login when not authenticated

## Support

For issues:
1. Check browser console for errors
2. Verify Supabase setup is correct
3. Check that RLS policies are configured
4. Verify environment variables are set
5. Check Supabase dashboard for database errors

