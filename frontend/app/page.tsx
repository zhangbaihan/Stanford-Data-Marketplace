'use client';

import { useState } from 'react';
import { mockDatasets } from '@/data/mockData';
import DatasetCard from '@/components/DatasetCard';
import SearchBar from '@/components/SearchBar';
import Filters from '@/components/Filters';
import Logo from '@/components/Logo';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get all unique tags
  const allTags = Array.from(new Set(mockDatasets.flatMap(d => d.tags)));

  const filteredDatasets = mockDatasets.filter(dataset => {
    const matchesSearch = dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.size === 0 || 
      dataset.tags.some(tag => selectedTags.has(tag));

    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Logo />
        </div>
      </header>

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
            <div className="space-y-6">
              {filteredDatasets.map((dataset) => (
                <DatasetCard 
                  key={dataset.id} 
                  dataset={dataset}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
