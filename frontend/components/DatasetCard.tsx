import { Dataset } from '@/data/mockData';

interface DatasetCardProps {
  dataset: Dataset;
}

export default function DatasetCard({ dataset }: DatasetCardProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement actual download functionality
    console.log('Download dataset:', dataset.id);
  };

  return (
    <div className="border-b border-gray-200 pb-6">
      <div className="mb-2">
        <h2 className="text-xl sm:text-2xl font-serif font-normal mb-2">
          {dataset.title}
        </h2>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
          {dataset.description}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {dataset.tableCount} {dataset.tableCount === 1 ? 'table' : 'tables'}
          </span>
          {dataset.fileCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {dataset.fileCount} {dataset.fileCount === 1 ? 'file' : 'files'}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            {dataset.size}
          </span>
        </div>
        <button
          onClick={handleDownload}
          className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      </div>

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
    </div>
  );
}
