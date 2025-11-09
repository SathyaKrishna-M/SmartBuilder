# Supabase Setup Guide for KnowSpark

This guide will help you set up Supabase for KnowSpark's authentication and cloud storage.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. KnowSpark project cloned locally

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in your project details:
   - **Name**: KnowSpark (or any name you prefer)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the region closest to your users
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your KnowSpark project (if it doesn't exist)
2. Add the following environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

## Step 4: Create the Database Table

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase/migrations/001_create_projects_table.sql`
4. Click "Run" to execute the SQL
5. You should see a success message

## Step 5: Enable Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to **Authentication** > **Providers** in your Supabase dashboard
2. Find "Google" and click to enable it
3. You'll need to:
   - Create a Google OAuth application in Google Cloud Console
   - Get your Client ID and Client Secret
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
4. Enter your Client ID and Client Secret in Supabase
5. Save the changes

## Step 6: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000
3. Click "Sign In" in the header
4. Try creating an account with email/password
5. Try signing in with Google (if configured)
6. Create a project and verify it saves to Supabase:
   - Go to **Table Editor** > **projects** in Supabase
   - You should see your project data

## Step 7: Verify Row Level Security

1. In Supabase dashboard, go to **Table Editor** > **projects**
2. Try viewing the data - you should only see projects for the currently authenticated user
3. Try creating a project from the app and verify it appears in the table

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Make sure `.env.local` exists and contains the correct variables
- Restart your development server after adding environment variables
- Check that variable names are exactly as shown (case-sensitive)

### Issue: "Error saving project to cloud"
- Check that the database table was created successfully
- Verify Row Level Security policies are set up correctly
- Check the browser console for detailed error messages

### Issue: Google OAuth not working
- Verify redirect URIs are correctly configured
- Check that Google OAuth credentials are correct
- Make sure the provider is enabled in Supabase

### Issue: Projects not syncing
- Check that you're signed in (check the header for your email)
- Verify the sync status indicator in the header
- Check browser console for any errors
- Try manually refreshing the page

## Security Notes

- The `anon` key is safe to use in client-side code (it's protected by Row Level Security)
- Never commit `.env.local` to version control
- Row Level Security ensures users can only access their own data
- All API requests are automatically authenticated via Supabase

## Next Steps

- Customize the authentication flow as needed
- Add more features like project sharing
- Set up email templates in Supabase for better user experience
- Configure backup and recovery strategies in Supabase

## Support

If you encounter any issues:
1. Check the Supabase documentation: https://supabase.com/docs
2. Check the browser console for error messages
3. Verify all environment variables are set correctly
4. Make sure the database migrations ran successfully

