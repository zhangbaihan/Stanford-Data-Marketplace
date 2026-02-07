'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { datasetsApi, ApiError } from '@/lib/api';
import type { Dataset } from '@/lib/types';
import Header from '@/components/Header';

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

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDataset() {
      if (!params.id || typeof params.id !== 'string') {
        setError('Invalid dataset ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await datasetsApi.getById(params.id);
        setDataset(response.dataset);
      } catch (err) {
        console.error('Error fetching dataset:', err);
        if (err instanceof ApiError && err.status === 404) {
          setError('Dataset not found');
        } else {
          setError('Failed to load dataset. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchDataset();
  }, [params.id]);

  const handleDownload = async () => {
    if (!dataset) return;

    try {
      setIsDownloading(true);
      setDownloadError(null);
      
      const response = await datasetsApi.getDownloadUrl(dataset._id);
      
      // Open download URL in new tab
      window.open(response.downloadUrl, '_blank');
    } catch (err) {
      console.error('Error downloading:', err);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          // Not authenticated - redirect to login
          setDownloadError('Please sign in to download datasets.');
          // Could redirect to login: window.location.href = authApi.getLoginUrl();
        } else if (err.status === 403) {
          setDownloadError('You do not have permission to download this dataset.');
        } else {
          setDownloadError('Failed to generate download link. Please try again.');
        }
      } else {
        setDownloadError('An error occurred. Please try again.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-8"></div>
            <div className="space-y-6">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">{error || 'Dataset not found'}</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            Back to datasets
          </button>
        </div>
      </div>
    );
  }

  const displaySize = dataset.size || formatFileSize(dataset.fileSize);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to datasets
        </Link>
        <div className="mb-10">
          <div className="flex items-start gap-3 mb-4">
            <h1 className="text-4xl font-serif font-normal flex-1">{dataset.title}</h1>
            {dataset.version && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded whitespace-nowrap">
                v {dataset.version}
              </span>
            )}
          </div>
          
          {/* Download button */}
          {dataset.fileName && (
            <div className="mt-4">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isDownloading ? 'Preparing download...' : `Download ${dataset.fileName}`}
              </button>
              {downloadError && (
                <p className="mt-2 text-sm text-red-600">{downloadError}</p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-10">
          {/* Abstract */}
          <section>
            <h2 className="text-xl font-serif font-normal mb-3">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">
              {dataset.abstract || dataset.description}
            </p>
          </section>

          {/* Provenance */}
          {dataset.provenance && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Provenance</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">Creator: </span>
                  <span className="text-gray-700">{dataset.provenance.creator}</span>
                </div>
                {dataset.provenance.contributors && dataset.provenance.contributors.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">Contributors: </span>
                    <ul className="list-disc list-inside text-gray-700 mt-1 space-y-0.5">
                      {dataset.provenance.contributors.map((contributor, index) => (
                        <li key={index} className="text-sm">
                          {contributor.name} ({contributor.role})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {dataset.provenance.doi && (
                  <div>
                    <span className="text-sm font-medium text-gray-900">DOI: </span>
                    <span className="text-gray-700 font-mono text-sm">{dataset.provenance.doi}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Methodology */}
          {dataset.methodology && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Methodology</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {dataset.methodology}
              </div>
            </section>
          )}

          {/* Usage Notes */}
          {dataset.usageNotes && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Usage Notes</h2>
              <p className="text-gray-700 leading-relaxed">
                {dataset.usageNotes}
              </p>
            </section>
          )}

          {/* Dataset Info */}
          <section>
            <h2 className="text-xl font-serif font-normal mb-3">Dataset Information</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {dataset.tableCount > 0 && (
                <div>
                  <span className="text-gray-600">Tables: </span>
                  <span className="text-gray-900">{dataset.tableCount}</span>
                </div>
              )}
              {displaySize && (
                <div>
                  <span className="text-gray-600">Size: </span>
                  <span className="text-gray-900">{displaySize}</span>
                </div>
              )}
              {dataset.lastUpdated && (
                <div>
                  <span className="text-gray-600">Last Updated: </span>
                  <span className="text-gray-900">{dataset.lastUpdated}</span>
                </div>
              )}
              {dataset.fileCount > 0 && (
                <div>
                  <span className="text-gray-600">Files: </span>
                  <span className="text-gray-900">{dataset.fileCount}</span>
                </div>
              )}
              {dataset.downloadCount > 0 && (
                <div>
                  <span className="text-gray-600">Downloads: </span>
                  <span className="text-gray-900">{dataset.downloadCount}</span>
                </div>
              )}
              {dataset.uploadedBy && (
                <div>
                  <span className="text-gray-600">Uploaded by: </span>
                  <span className="text-gray-900">{dataset.uploadedBy.username}</span>
                </div>
              )}
            </div>
          </section>

          {/* Tags */}
          {dataset.tags && dataset.tags.length > 0 && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Tags</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {dataset.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Supporting Files */}
          {dataset.supportingFiles && dataset.supportingFiles.length > 0 && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Supporting Files</h2>
              <ul className="space-y-1.5">
                {dataset.supportingFiles.map((file, index) => (
                  <li key={index}>
                    <span className="text-gray-700 flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Links */}
          {dataset.links && dataset.links.length > 0 && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Links</h2>
              <ul className="space-y-1.5">
                {dataset.links.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-gray-900 underline transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* License */}
          {dataset.license && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">License</h2>
              <p className="text-gray-700 text-sm">{dataset.license}</p>
            </section>
          )}

          {/* Contact */}
          {dataset.contact && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Contact</h2>
              <p className="text-gray-700 text-sm">
                If you have questions or concerns, please contact{' '}
                <a 
                  href={`mailto:${dataset.contact.email}`}
                  className="text-gray-900 hover:underline"
                >
                  {dataset.contact.name} at {dataset.contact.email}
                </a>
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
