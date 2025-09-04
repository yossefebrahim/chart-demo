# Correlation Matrix Heatmap

A minimal React application that renders a correlation matrix heatmap with interactive features, built with React, Vite, and TailwindCSS.

## Features

- **Lower-triangular correlation matrix** with color-coded cells
- **Interactive tooltips** showing asset pairs and correlation values
- **Color gradient legend** from high correlation (dark blue) to low correlation (light blue)
- **Period selection toggle** (specific period vs overall period)
- **Row/column highlighting** on hover
- **Responsive design** with modern UI styling

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Custom color interpolation** - No heavy chart libraries

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── App.jsx              # Main component with heatmap logic
├── main.jsx             # React app entry point
├── index.css            # Global styles with Tailwind
├── data/
│   └── corr.json        # Correlation matrix data
└── utils/
    └── colors.js        # Color interpolation utilities
```

## Data Format

The correlation data should follow this structure in `src/data/corr.json`:

```json
{
  "period": "2025Q1",
  "assets": ["Asset 1", "Asset 2", ...],
  "matrix": [
    [1.00, null, null, ...],
    [0.89, 1.00, null, ...],
    [0.70, 0.49, 1.00, ...],
    ...
  ]
}
```

- `matrix` is a lower-triangular matrix where `matrix[i][j]` is null when `j > i`
- Correlation values should be in the range [-1, 1]
- Diagonal values should be 1.00

## Color Mapping

The heatmap uses a custom color interpolation:
- **High correlation** (close to 1): Dark blue `#0046D4`
- **Low correlation** (close to -1): Light blue `#CCDAF6`
- Values are mapped from [-1, 1] to [0, 1] using `(value + 1) / 2`

## Customization

### Changing Colors

Edit the color values in `src/utils/colors.js`:

```javascript
export function colorFor(value) {
  const t = Math.max(0, Math.min(1, (value + 1) / 2));
  return lerpColor('#0046D4', '#CCDAF6', 1 - t);
}
```

### Updating Data

Replace the contents of `src/data/corr.json` with your correlation matrix data following the same structure.

## License

MIT
