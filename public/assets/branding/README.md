# Branding Assets

This directory contains the branding assets for SmartBuilder / KnowSpark.

## Files

- **logo.svg** - Main logo in SVG format (512x512px)
  - Deep black background (`#050505`)
  - Electric blue gradient diamond icon (`#3B82F6` to `#1E40FF`)
  - Represents "knowledge core / spark"

## Usage

### Favicon

The favicon is generated from `logo.svg` using the script:

```bash
npm run generate-favicon
```

This creates `public/favicon.ico` with multiple sizes (16x16, 32x32, 48x48).

### Logo in App

Use the logo SVG directly:

```tsx
import Image from 'next/image';

<Image 
  src="/assets/branding/logo.svg" 
  alt="SmartBuilder Logo" 
  width={120} 
  height={120} 
/>
```

### Colors

- **Primary Blue**: `#3B82F6`
- **Electric Blue**: `#1E40FF`
- **Background**: `#050505` (dark mode)
- **Background Light**: `#F9FAFB` (light mode)

## Future Branding

To update branding:

1. Edit `logo.svg` in this directory
2. Run `npm run generate-favicon` to regenerate favicon
3. Update color tokens in `tailwind.config.ts` if needed

