// hooks/useProductFilters.ts
import { useState } from 'react';
import type { Filters } from '@/lib/types';

export function useProductFilters() {
    const [filters, setFilters] = useState<Filters>({
        searchTerm: '',
       // codeFilter: '',
        fabricFilter: '',
    });
    return { filters, setFilters };
}