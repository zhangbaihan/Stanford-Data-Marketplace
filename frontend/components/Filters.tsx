interface FiltersProps {
  allTags: string[];
  selectedTags: Set<string>;
  onTagsChange: (tags: Set<string>) => void;
}

export default function Filters({
  allTags,
  selectedTags,
  onTagsChange,
}: FiltersProps) {
  const handleTagToggle = (tag: string, checked: boolean) => {
    const newSet = new Set(selectedTags);
    if (checked) {
      newSet.add(tag);
    } else {
      newSet.delete(tag);
    }
    onTagsChange(newSet);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3 text-gray-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Tags
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {allTags.map((tag) => (
            <label key={tag} className="flex items-center cursor-pointer hover:text-gray-900 transition-colors">
              <input
                type="checkbox"
                checked={selectedTags.has(tag)}
                onChange={(e) => handleTagToggle(tag, e.target.checked)}
                className="mr-2 cursor-pointer"
              />
              <span className="text-sm text-gray-700">{tag}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
