// lib/cookies.ts
'use client';

/**
 * Lê um valor específico de um cookie do navegador.
 * @param name O nome do cookie a ser lido.
 * @returns O valor do cookie ou uma string vazia se não for encontrado.
 */
export function getCookie(name: string): string {
  if (typeof document === 'undefined') {
    return ''; // Retorna vazio se estiver no lado do servidor
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || '';
  }
  return '';
}