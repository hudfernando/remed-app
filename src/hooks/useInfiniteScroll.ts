import { useState, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import type { Product } from '@/lib/types';

const INITIAL_VISIBLE_COUNT = 100;
const LOAD_MORE_COUNT = 100;

// CORREÇÃO: Tornamos a função genérica com <T> e tipamos a dependência como T.
export function useInfiniteScroll<T>(items: Product[], isFetching: boolean, dependency: T) {
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
    const { ref, inView } = useInView({ threshold: 0 });

    useEffect(() => {
        if (inView && !isFetching) {
            setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, items.length));
        }
    }, [inView, items.length, isFetching]);

    // Reseta a contagem quando os filtros (a dependência) mudam
    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_COUNT);
    }, [dependency]); // O useEffect observa a dependência T

    const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
    
    return { ref, visibleItems, hasMore: visibleCount < items.length };
}