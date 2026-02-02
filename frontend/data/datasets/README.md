# Dataset Storage Structure

This directory contains datasets stored locally with their metadata.

## Structure

Each dataset should have:
- A metadata JSON file: `{dataset-id}/metadata.json`
- Raw data files (optional): `{dataset-id}/data/`

## Metadata Format

The metadata.json file should follow this structure:

```json
{
  "id": "unique-dataset-id",
  "title": "Dataset Title",
  "description": "Brief description",
  "abstract": "Full abstract text",
  "tableCount": 1,
  "fileCount": 0,
  "size": "144 GB",
  "version": "3.0",
  "tags": ["tag1", "tag2"],
  "lastUpdated": "2026-01-30",
  "provenance": {
    "creator": "Creator Name",
    "contributors": [
      { "name": "Contributor Name", "role": "Role" }
    ],
    "doi": "10.57761/xxxx-xxxx"
  },
  "methodology": "Full methodology text...",
  "usageNotes": "Usage notes...",
  "supportingFiles": [
    { "name": "file.txt", "type": "text" }
  ],
  "links": [
    { "name": "Link Name", "url": "https://..." }
  ],
  "license": "License text",
  "contact": {
    "name": "Contact Name",
    "email": "email@example.com"
  }
}
```

## Adding a New Dataset

1. Create a new directory: `{dataset-id}/`
2. Add `metadata.json` with the dataset information
3. (Optional) Add raw data files in `{dataset-id}/data/`
4. The dataset will automatically appear in the application
