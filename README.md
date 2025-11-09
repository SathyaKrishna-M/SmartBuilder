# KnowSpark

**Ask smart. Learn beautifully.**

An AI-powered knowledge workspace that transforms your questions into beautifully structured knowledge cards using Google's Gemini 2.5 Flash API.

## Features

- 🗂️ **Multiple Projects** - Create, organize, and manage multiple knowledge projects
- 💬 **AI-Powered Answers** - Get structured, sectioned answers from Gemini 2.5 Flash
- 🔁 **Regenerate Responses** - Regenerate individual answers anytime
- ✏️ **Edit & Reorder** - Edit questions, reorder cards, and delete as needed
- 🌐 **Share Projects** - Share your projects as public, read-only pages
- 🎨 **Dark Mode** - Beautiful light and dark themes
- 💾 **Local Storage** - Everything stored locally, completely free
- 📱 **Responsive Design** - Works beautifully on all devices

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management (optional)
- **React Markdown** for formatted text
- **Google Gemini 2.5 Flash API** for AI responses (direct REST API integration)
- **localStorage** for data persistence

## Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- A Google Gemini API key (get one free at [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd SmartBuilder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Create a Project**: Click "New Project" and give it a name
2. **Ask Questions**: Type your question in the input field at the bottom
3. **View Answers**: Answers appear as structured cards with sections
4. **Regenerate**: Click the regenerate button on any card to get a new answer
5. **Edit & Reorder**: Hover over cards to see edit, move, and delete options
6. **Share**: Click the "Share" button to get a public link to your project

## Project Structure

```
├── app/
│   ├── api/
│   │   └── ask/
│   │       └── route.ts          # Gemini API handler
│   ├── [projectId]/
│   │   └── page.tsx              # Project workspace
│   ├── share/
│   │   └── [id]/
│   │       └── page.tsx          # Public share page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard
│   └── globals.css               # Global styles
├── components/
│   ├── project-sidebar.tsx       # Sidebar with project list
│   ├── project-header.tsx        # Header with share and theme toggle
│   ├── question-card.tsx         # Individual Q&A card
│   ├── question-input.tsx        # Question input component
│   └── theme-provider.tsx        # Theme context provider
├── lib/
│   ├── ai.ts                     # Gemini API integration
│   ├── storage.ts                # localStorage helpers
│   └── utils.ts                  # Utility functions
└── types/
    └── index.ts                  # TypeScript type definitions
```

## Data Models

### Project
```typescript
{
  id: string;
  title: string;
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}
```

### Question
```typescript
{
  id: string;
  text: string;
  answer: Answer | null;
  createdAt: number;
}
```

### Answer
```typescript
{
  id: string;
  title: string;
  sections: { [key: string]: string };
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your `NEXT_PUBLIC_GEMINI_API_KEY` environment variable
4. Deploy!

The app will work completely client-side with localStorage, so no backend is needed.

## Future Enhancements

- [ ] Firebase/Supabase integration for cloud storage
- [ ] User authentication
- [ ] Collaborative projects
- [ ] Export to PDF/Markdown
- [ ] Search functionality
- [ ] Tags and categories
- [ ] Version history for answers

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
