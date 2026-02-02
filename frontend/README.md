# Open Data - Dataset Browser

A minimal, functional prototype for browsing datasets with a clean, minimalist aesthetic inspired by Physical Intelligence (π) and the information structure of Stanford's Data Farm.

## Features

- Clean, minimalist design with serif typography
- Dataset browsing with search functionality
- Filter by tags
- Dataset detail pages with full metadata (provenance, methodology, usage notes)
- Hover effects and icons for visual cues
- Local dataset storage structure with metadata JSON files
- Responsive layout with sidebar filters

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/
│   ├── globals.css       # Global styles with Tailwind
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dataset browsing page
├── components/
│   ├── DatasetCard.tsx   # Dataset card component
│   ├── SearchBar.tsx    # Search input component
│   └── Filters.tsx      # Filter sidebar component
├── data/
│   └── mockData.ts      # Mock dataset data
└── package.json
```

## Adding Custom Datasets

To add a new dataset:

1. Create a new directory in `data/datasets/{dataset-id}/`
2. Add a `metadata.json` file following the structure in `data/datasets/README.md`
3. (Optional) Add raw data files in `data/datasets/{dataset-id}/data/`
4. The dataset will appear in the application

Example structure:
```
data/datasets/
  └── my-dataset/
      ├── metadata.json
      └── data/
          └── raw-data.csv
```

## Customization

- Edit `data/mockData.ts` to modify the dataset listings
- Add datasets using the local storage structure in `data/datasets/`
- Update styles in `app/globals.css` or component files
- Modify the layout in `app/page.tsx`

## Dataset Detail Pages

Each dataset has a dedicated detail page showing:
- Abstract
- Provenance (creator, contributors, DOI)
- Methodology
- Usage notes
- Dataset information (tables, size, last updated)
- Tags
- Supporting files
- Links
- License
- Contact information
