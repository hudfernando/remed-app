// hooks/useInfiniteScroll.ts
import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Product } from '@/lib/types';

const INITIAL_VISIBLE_COUNT = 100;
const LOAD_MORE_COUNT = 100;

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useInfiniteScroll(items: Product[], isFetching: boolean, dependency: any) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const { ref, inView } = useInView({ threshold: 0 });

    useEffect(() => {
        if (inView && !isFetching) {
            setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, items.length));
        }
    }, [inView, items.length, isFetching]);

    // Reseta a contagem quando os filtros mudam
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [dependency]);

    const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
    
    return { ref, visibleItems, hasMore: visibleCount < items.length };
}