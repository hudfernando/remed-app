'use server';

import { Product, PaginatedResult } from '@/lib/types'; // Você precisará adicionar 'PaginatedResult' aos seus tipos
import { api } from './api';


/**
 * Busca UMA ÚNICA página de produtos da nova API paginada.
 * @param pageNumber - O número da página a ser buscada.
 * @param pageSize - O número de itens por página.
 * @returns Um objeto com os produtos da página e metadados de paginação.
 */
export async function getProductsPage(
  pageNumber: number = 1,
  pageSize: number = 500
): Promise<PaginatedResult<Product>> {
  try {
    // A chamada de API agora inclui os parâmetros de paginação na URL
    const response: PaginatedResult<Product> = await api
      .get(`Produto/produtos?pagina=${pageNumber}&tamanhoPagina=${pageSize}`)
      .json<PaginatedResult<Product>>();

    // A sanitização agora acontece no backend, então podemos confiar mais nos dados.
    // Se ainda precisar de alguma sanitização no front, faça aqui.
    console.log(`[API Fetch] Página ${pageNumber} carregada com ${response.items.length} produtos.`);
    return response;
    
  } catch (error) {
    console.error(`Erro ao buscar a página ${pageNumber} de produtos:`, error);
    throw new Error('Falha ao buscar a página de produtos.');
  }
}