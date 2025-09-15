// hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { getProductsPage } from '@/http/get-products';
import type { Product } from '@/lib/types';

const PAGE_SIZE = 500;

export function useProducts() {
    return useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: async () => {
            const initialPage = await getProductsPage(1, PAGE_SIZE);
            const { totalCount } = initialPage;
            const totalPages = Math.ceil(totalCount / PAGE_SIZE);
            
            let combinedProducts = [...initialPage.items];

            if (totalPages > 1) {
                const pageNumbersToFetch = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
                const fetchPromises = pageNumbersToFetch.map(page => getProductsPage(page, PAGE_SIZE));
                const remainingPages = await Promise.all(fetchPromises);
                remainingPages.forEach(page => combinedProducts.push(...page.items));
            }
            return combinedProducts;
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false,
    });
}