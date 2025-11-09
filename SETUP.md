# Setup Guide for KnowSpark

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Get Your Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy your API key
   - **Note**: The app uses `gemini-2.5-flash` model by default (fast and free tier friendly)
   - You can override the model by setting `NEXT_PUBLIC_GEMINI_MODEL` in `.env.local`

3. **Create Environment File**
   - Create a file named `.env.local` in the root directory
   - Add your API key:
     ```
     NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open Your Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Start creating projects and asking questions!

## Troubleshooting

### API Key Issues

If you see an error about the API key:
- Make sure `.env.local` is in the root directory (not in `app/` or any subdirectory)
- Ensure the variable name is exactly `NEXT_PUBLIC_GEMINI_API_KEY`
- Restart your development server after adding the API key
- Check that there are no extra spaces or quotes around the API key
- Verify your API key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Model Issues

If you see "model not found" errors:
- The app uses `gemini-2.5-flash` by default (works with free/student API keys)
- You can change the model by adding `NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-pro` to your `.env.local`
- Available models: `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- Some models may require paid API access

### Build Issues

If you encounter build errors:
- Make sure you're using Node.js 18 or higher
- Delete `node_modules` and `.next` folders, then run `npm install` again
- Check that all dependencies are installed correctly

### Storage Issues

- All data is stored in your browser's localStorage
- Data persists across sessions
- To clear all data, clear your browser's localStorage for localhost:3000
- Data is browser-specific (won't sync across devices/browsers)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `NEXT_PUBLIC_GEMINI_API_KEY` environment variable in Vercel's project settings
4. Deploy!

The app works completely client-side with localStorage, so no backend database is needed.

## Features

- ✅ Multiple projects
- ✅ AI-powered structured answers
- ✅ Regenerate individual answers
- ✅ Edit questions and reorder cards
- ✅ Share projects as public pages
- ✅ Dark/light mode
- ✅ Local storage (no backend needed)
- ✅ Responsive design

Enjoy using KnowSpark! 🚀
