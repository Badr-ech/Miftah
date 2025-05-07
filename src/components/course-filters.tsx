'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CourseCategory } from '@/types';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface CourseFiltersProps {
  initialQuery?: string;
  initialCategory?: CourseCategory | 'all';
}

export function CourseFilters({ initialQuery = '', initialCategory = 'all' }: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category && category !== 'all') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const categories: (CourseCategory | 'all')[] = ["all", "Primary", "Middle", "Secondary"];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 border rounded-lg bg-card shadow">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses by title or description..."
          className="pl-10 w-full h-10"
          defaultValue={initialQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2 md:w-auto w-full">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Category:</span>
        <Select defaultValue={initialCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full md:w-[180px] h-10">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
