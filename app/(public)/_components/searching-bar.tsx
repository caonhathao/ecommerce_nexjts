'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useDebounce } from 'use-debounce';
import { Loader2, Search, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Keyboard navigation state
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);

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
      <div
        className={cn(
          'flex flex-row items-center gap-0 w-[85%] h-10 border rounded-lg pl-4 bg-card m-0 transition-all duration-300',
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

        <div className="flex-1 mb-0 relative">
          <Input
            placeholder={
              isAiMode
                ? "Describe it (e.g. 'Cheap gaming laptop under 1000')..."
                : t('search_placeholder')
            }
            value={query}
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
            className="w-full border-none shadow-none focus-visible:ring-0 focus:outline-none !bg-transparent px-0 h-9 pr-8"
          />
          {/* Clear Button (X) */}
          {query.length > 0 && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Separator
          orientation="vertical"
          className="mx-0 bg-secondary h-[60%]"
        />

        <Button
          variant="ghost"
          onClick={() => handleSearch(query)}
          disabled={isSearching}
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

      {/* Suggestions Dropdown */}
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
                  'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between group cursor-pointer border-b border-border/40 last:border-0 transition-colors',
                  index === selectedIndex
                    ? 'bg-secondary'
                    : 'hover:bg-secondary/50'
                )}
                onMouseEnter={() => setSelectedIndex(index)} // Sync mouse hover with selection state
                onClick={() => {
                  setQuery(item.title);
                  handleSearch(item.title);
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-text group-hover:text-primary transition-colors truncate">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
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
