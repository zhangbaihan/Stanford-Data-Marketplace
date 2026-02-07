'use client';

import { useState, useEffect, useMemo } from 'react';
import { datasetsApi } from '@/lib/api';
import type { Dataset } from '@/lib/types';
import DatasetCard from '@/components/DatasetCard';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import Header from '@/components/Header';

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch datasets and tags on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch datasets and tags in parallel
        const [datasetsRes, tagsRes] = await Promise.all([
          datasetsApi.getAll({ limit: 100 }),
          datasetsApi.getTags(),
        ]);
        
        setDatasets(datasetsRes.datasets);
        setAllTags(tagsRes.tags);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load datasets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Client-side filtering for search and tags
  const filteredDatasets = useMemo(() => {
    return datasets.filter(dataset => {
      const matchesSearch = searchQuery === '' ||
        dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dataset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTags = selectedTags.size === 0 || 
        dataset.tags?.some(tag => selectedTags.has(tag));

      return matchesSearch && matchesTags;
    });
  }, [datasets, searchQuery, selectedTags]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed">
            Open Data is a platform for browsing and exploring datasets. 
            Discover and access a wide range of data collections for research and analysis.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <aside className="w-full md:w-64 flex-shrink-0">
            <div className="md:sticky md:top-8">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              <Filters
                allTags={allTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 pb-6 animate-pulse">
                    <div className="h-7 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Try Again
                </button>
              </div>
            ) : filteredDatasets.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">
                  {searchQuery || selectedTags.size > 0
                    ? 'No datasets match your search criteria.'
                    : 'No datasets available yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredDatasets.map((dataset) => (
                  <DatasetCard 
                    key={dataset._id} 
                    dataset={dataset}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
