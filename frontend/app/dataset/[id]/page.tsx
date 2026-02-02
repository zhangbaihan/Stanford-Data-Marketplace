'use client';

import { useParams, useRouter } from 'next/navigation';
import { mockDatasets } from '@/data/mockData';
import Logo from '@/components/Logo';

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dataset = mockDatasets.find(d => d.id === params.id);

  if (!dataset) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif mb-4">Dataset not found</h1>
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 underline"
          >
            datasets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => router.push('/')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              datasets
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-4xl font-serif font-normal flex-1">{dataset.title}</h1>
            {dataset.version && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded whitespace-nowrap">
                v {dataset.version}
              </span>
            )}
          </div>
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

          {/* Methodology */}
          <section>
            <h2 className="text-xl font-serif font-normal mb-3">Methodology</h2>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
              {dataset.methodology}
            </div>
          </section>

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
              <div>
                <span className="text-gray-600">Tables: </span>
                <span className="text-gray-900">{dataset.tableCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Size: </span>
                <span className="text-gray-900">{dataset.size}</span>
              </div>
              <div>
                <span className="text-gray-600">Last Updated: </span>
                <span className="text-gray-900">{dataset.lastUpdated}</span>
              </div>
              {dataset.fileCount > 0 && (
                <div>
                  <span className="text-gray-600">Files: </span>
                  <span className="text-gray-900">{dataset.fileCount}</span>
                </div>
              )}
            </div>
          </section>

          {/* Tags */}
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

          {/* Supporting Files */}
          {dataset.supportingFiles && dataset.supportingFiles.length > 0 && (
            <section>
              <h2 className="text-xl font-serif font-normal mb-3">Supporting Files</h2>
              <ul className="space-y-1.5">
                {dataset.supportingFiles.map((file, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file.name}
                    </a>
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
