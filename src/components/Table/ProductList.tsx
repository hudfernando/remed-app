'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProductsPage } from '@/http/get-products'; // Importa a nova função
import type { Product, Filters } from '@/lib/types';
import { ProductTableHeader } from './ProductTableHeader';
import { ProductSearchFilters } from './ProductSearchFilters';
import { ProductTableBody } from './ProductTableBody';
import { ProductTableSkeleton } from './ProductTableSkeleton';
import { ProductTableError } from './ProductTableError';
import { useInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';

const INITIAL_VISIBLE_COUNT = 100; // Quantidade de produtos visíveis inicialmente
const LOAD_MORE_COUNT = 100; // Quantidade a carregar ao rolar
const PAGE_SIZE = 500; // O tamanho da página que a API retorna

export function ProductList() {
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    codeFilter: '',
    fabricFilter: '',
  });

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  // Query orquestradora para buscar TODOS os produtos de forma paginada
  const { data: allProducts = [], isFetching, isError, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Iniciando busca de produtos...');

      // 1. Busca a primeira página para obter o total e os primeiros itens
      const initialPage = await getProductsPage(1, PAGE_SIZE);
      const totalCount = initialPage.totalCount;
      const totalPages = Math.ceil(totalCount / PAGE_SIZE);
      
      const combinedProducts = [...initialPage.items];

      // 2. Se houver mais páginas, busca todas em paralelo
      if (totalPages > 1) {
        const pageNumbersToFetch: number[] = [];
        for (let i = 2; i <= totalPages; i++) {
          pageNumbersToFetch.push(i);
        }

        console.log(`Buscando ${pageNumbersToFetch.length} páginas restantes em background...`);
        
        // Cria um array de promises, uma para cada página restante
        const fetchPromises = pageNumbersToFetch.map(pageNumber =>
          getProductsPage(pageNumber, PAGE_SIZE)
        );

        // Executa todas as buscas em paralelo
        const remainingPages = await Promise.all(fetchPromises);

        // Combina os resultados
        remainingPages.forEach(page => {
          combinedProducts.push(...page.items);
        });
      }

      console.log(`Busca finalizada. Total de ${combinedProducts.length} produtos carregados.`);
      return combinedProducts;
    },
    staleTime: 1000 * 60 * 60, // Cache de 1 hora. Evita recarregar essa massa de dados.
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // A lógica de filtro permanece a mesma e funcionará sobre o array completo
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

  // A lógica do infinite scroll para VISUALIZAÇÃO também permanece a mesma
  useEffect(() => {
    if (inView && !isFetching) { // Só carrega mais se não estiver em uma busca
      setVisibleCount(prevCount => Math.min(prevCount + LOAD_MORE_COUNT, filteredProducts.length));
    }
  }, [inView, filteredProducts.length, isFetching]);

  // Reseta a contagem visível quando os filtros mudam
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [filters]);

  const productsToShow = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // Exibe o esqueleto de carregamento enquanto a busca completa (todas as páginas) estiver em andamento
  if (isFetching) {
    return <ProductTableSkeleton />;
  }

  if (isError) {
    return <ProductTableError error={error} />;
  }

  return (
    <div className="w-full max-w-8xl mx-auto p-2 bg-white rounded-lg shadow-md">
      <ProductTableHeader displayedProducts={filteredProducts.length} totalProducts={allProducts.length} />
      <ProductSearchFilters onFilterChange={setFilters} />
      <ProductTableBody products={productsToShow} />

      {/* Gatilho para o infinite scroll */}
      <div ref={ref} className="h-10" />

      {/* Indicador de que mais itens estão sendo adicionados à tela */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center items-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Carregando mais...</span>
        </div>
      )}
    </div>
  );
}