# Responsive Grid Layout with Pagination

A modern, flexible React component that displays content in a responsive grid layout with advanced pagination features. Built with TypeScript and designed to adapt to different screen sizes seamlessly.

## Features

- Responsive Design
  -  3-column layout on desktop (≥1024px)
  -  2-column layout on tablet (≥640px)
  -  1-column layout on mobile (<640px)

- Dynamic Grid System
  - Automatically adjusts card density based on screen size
  - Featured cards with enhanced styling and additional content
  - Smooth transitions between layouts
- Advanced Pagination
  - Configurable page sizes (10, 25, 50 items per page)
  - Intelligent page number navigation with ellipsis for large datasets
  - Loading animations for page transitions

## Getting started

```bash
# Clone the repository
git clone https://github.com/ronaldomaiacorrea/grid-layout.git

# Navigate to project directory
cd grid-layout

# Install dependencies
pnpm install

# Start the development server
pnpm run dev
```
## How It Works

### Dynamic Grid Generation
The component automatically detects the screen width and adjusts its layout accordingly:

```javascript
// Determine number of columns based on screen size
const getGridColumns = () => {
  if (windowWidth >= 1024) return 3 // Large screens - 3 columns
  if (windowWidth >= 640) return 2  // Medium screens - 2 columns
  return 1                          // Small screens - 1 column
}
```

### Demo Data
The project includes a sample data generator that creates 100 cards with:

- Randomized titles from design and technology topics
- Chronologically ordered dates
- Placeholder images

### Customization
You can easily modify:
- Card appearance and content
- Grid layout behavior
- Pagination styles and options

### Dependencies
- React
- TypeScript
- Lucide React (for icons)

### Browser Support
- Chrome, Firefox, Safari, Edge (latest versions)
- Responsive design works across all modern devices

### License
MIT

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
