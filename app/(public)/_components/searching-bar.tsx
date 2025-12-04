'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Camera, Loader2, Search, Sparkles, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';

interface Suggestion {
  id: string;
  title: string;
  category: { name: string };
  images: { url: string }[];
}

const SearchingBar = () => {
  const t = useTranslations('layout');
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAiMode, setIsAiMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch with AbortController (Fixes race conditions)
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true);
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`,
          { signal }
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          if (data.length > 0) setShowSuggestions(true);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoadingSuggestions(false);
        }
      }
    };

    fetchSuggestions();

    // Cleanup: Abort the fetch if the user types again immediately
    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSearch = (term: string) => {
    if (!term.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    setSelectedIndex(-1); // Reset selection

    const params = new URLSearchParams();
    params.set('q', term);

    if (isAiMode) {
      params.set('ai', 'true');
    }

    router.push(`/search?${params.toString()}`);

    setTimeout(() => setIsSearching(false), 2000);
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so user can select same file again if needed
    e.target.value = '';

    setIsAnalyzingImage(true);
    setQuery(''); // Clear text input while analyzing

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/search/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to analyze image');

      const data = await res.json();
      const detectedQuery = data.query;

      // Update UI with the detected text
      setQuery(detectedQuery);

      // Auto-trigger search with AI mode enabled
      setIsAiMode(true);

      const params = new URLSearchParams();
      params.set('q', detectedQuery);
      params.set('ai', 'true');
      router.push(`/search?${params.toString()}`);
    } catch (error) {
      console.error(error);
      toast.error('Could not identify product in image');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // If a suggestion is selected via arrows, search for that
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        const selectedTerm = suggestions[selectedIndex].title;
        setQuery(selectedTerm); // Update input visually
        handleSearch(selectedTerm);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full relative z-50" ref={containerRef}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageSelect}
        className="hidden"
        accept="image/*"
      />

      <div
        className={cn(
          'flex flex-row items-center gap-0 w-full h-10 border rounded-lg pl-4 bg-card m-0 transition-all duration-300',
          isAiMode
            ? 'border-purple-500 ring-1 ring-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
            : 'border-secondary'
        )}
      >
        {/* AI Toggle Button */}
        <button
          onClick={() => setIsAiMode(!isAiMode)}
          className={cn(
            'mr-2 p-1.5 rounded-md transition-all duration-300 hover:scale-105 active:scale-95',
            isAiMode
              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
          title="Toggle AI Smart Search"
        >
          <Sparkles size={16} className={cn(isAiMode && 'fill-current')} />
        </button>

        <div className="flex-1 mb-0 relative flex items-center">
          <Input
            placeholder={
              isAnalyzingImage
                ? 'Analyzing image...'
                : isAiMode
                  ? "Describe it (e.g. 'Cheap gaming laptop')..."
                  : t('search_placeholder')
            }
            value={query}
            disabled={isAnalyzingImage}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (val.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                setSelectedIndex(-1);
              } else {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full border-none shadow-none focus-visible:ring-0 focus:outline-none !bg-transparent px-0 h-9 pr-16" // Added pr-16 for space
          />

          {/* Action Buttons Container (Camera + Clear) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Camera Button */}
            {!query && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzingImage}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
                title="Search by Image"
              >
                {isAnalyzingImage ? (
                  <Loader2 size={16} className="animate-spin text-purple-500" />
                ) : (
                  <Camera size={16} />
                )}
              </button>
            )}

            {/* Clear Button */}
            {query.length > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <Separator
          orientation="vertical"
          className="mx-0 bg-secondary h-[60%]"
        />

        <Button
          variant="ghost"
          onClick={() => handleSearch(query)}
          disabled={isSearching || isAnalyzingImage}
          className={cn(
            'h-full rounded-none rounded-r-md px-6 cursor-pointer',
            isAiMode
              ? 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              : 'text-primary hover:bg-muted'
          )}
        >
          {isSearching ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            t('search_button')
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown (Keep existing code) */}
      {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
        <div className="absolute top-12 left-0 w-[85%] bg-popover border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="py-1">
            {isLoadingSuggestions && suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading...</span>
              </div>
            )}

            {suggestions.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm flex items-center justify-between group cursor-pointer border-b border-border/40 last:border-0 transition-colors',
                  index === selectedIndex
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent/50'
                )}
                onMouseMove={() => {
                  if (selectedIndex !== index) setSelectedIndex(index);
                }}
                onClick={() => {
                  setQuery(item.title);
                  handleSearch(item.title);
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-border/50 bg-background">
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-md bg-secondary/50 flex-shrink-0',
                        index === selectedIndex
                          ? 'text-accent-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      <Search className="w-5 h-5" />
                    </div>
                  )}

                  <span
                    className={cn(
                      'truncate transition-colors font-medium',
                      index === selectedIndex
                        ? 'text-accent-foreground'
                        : 'text-foreground'
                    )}
                  >
                    {item.title}
                  </span>
                </div>

                <span className="text-[10px] font-medium text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap ml-2">
                  {item.category.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchingBar;
