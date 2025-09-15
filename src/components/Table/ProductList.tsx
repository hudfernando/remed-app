// app/(app)/components/Table/ProductList.tsx
'use client';

import { useMemo } from 'react';
import { ProductTableHeader } from './ProductTableHeader';
import { ProductSearchFilters } from './ProductSearchFilters';
import { ProductTableBody } from './ProductTableBody';
import { ProductTableSkeleton } from './ProductTableSkeleton';
import { ProductTableError } from './ProductTableError';
import { Loader2 } from 'lucide-react';

// Nossos novos hooks
import { useProducts } from '@/hooks/useProducts';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export function ProductList() {
    const { filters, setFilters } = useProductFilters();
    const { data: allProducts = [], isFetching, isError, error } = useProducts();

    const filteredProducts = useMemo(() => {
        let currentFiltered = allProducts;
        if (filters.searchTerm) {
            currentFiltered = currentFiltered.filter(p => p.descricao.toLowerCase().includes(filters.searchTerm.toLowerCase()));
        }
        if (filters.codeFilter) {
            currentFiltered = currentFiltered.filter(p => String(p.codigo).includes(filters.codeFilter));
        }
        if (filters.fabricFilter) {
            currentFiltered = currentFiltered.filter(p => p.descricaoFab.toLowerCase().includes(filters.fabricFilter.toLowerCase()));
        }
        return currentFiltered;
    }, [allProducts, filters]);
    
    const { ref, visibleItems, hasMore } = useInfiniteScroll(filteredProducts, isFetching, filters);

    if (isFetching) return <ProductTableSkeleton />;
    if (isError) return <ProductTableError error={error} />;

    return (
        <div className="w-full max-w-8xl mx-auto p-2 bg-white rounded-lg shadow-md">
            <ProductTableHeader displayedProducts={filteredProducts.length} totalProducts={allProducts.length} />
            <ProductSearchFilters onFilterChange={setFilters} />
            <ProductTableBody products={visibleItems} />
            
            <div ref={ref} className="h-10" />

            {hasMore && (
                <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                    <span className="ml-2 text-gray-500">Carregando mais...</span>
                </div>
            )}
        </div>
    );
}