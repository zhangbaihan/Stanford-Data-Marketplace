import Link from 'next/link';
import type { Dataset } from '@/lib/types';

interface DatasetCardProps {
  dataset: Dataset;
}

// Format file size to human-readable format
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  // Use the display size if provided, otherwise format from fileSize
  const displaySize = dataset.size || formatFileSize(dataset.fileSize);
  const datasetId = dataset._id;

  return (
    <Link href={`/dataset/${datasetId}`} className="block">
      <div className="border-b border-gray-200 pb-6 hover:bg-gray-50 -mx-4 px-4 py-4 transition-colors cursor-pointer">
        <div className="mb-2">
          <h2 className="text-xl sm:text-2xl font-serif font-normal mb-2 text-gray-900 hover:text-gray-700">
            {dataset.title}
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
            {dataset.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            {dataset.tableCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {dataset.tableCount} {dataset.tableCount === 1 ? 'table' : 'tables'}
              </span>
            )}
            {dataset.fileCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {dataset.fileCount} {dataset.fileCount === 1 ? 'file' : 'files'}
              </span>
            )}
            {displaySize && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                {displaySize}
              </span>
            )}
            {dataset.lastUpdated && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dataset.lastUpdated}
              </span>
            )}
          </div>
        </div>

        {dataset.tags && dataset.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {dataset.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
