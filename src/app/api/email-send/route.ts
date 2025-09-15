// src/app/api/send-email/route.ts

import { NextResponse } from 'next/server';
import { OrderData } from '@/lib/types';
import { api } from '@/http/api';
import { HTTPError } from 'ky';


export async function POST(request: Request) {
  try {
    // Receber os dados do frontend
    const body: OrderData = await request.json();
    console.log('Dados recebidos do frontend:', JSON.stringify(body, null, 2));

    const { subject, cnpj, email, products, total } = body;

    // Validar se os dados foram recebidos
    if (!subject || !cnpj || !email || !products || !Array.isArray(products) || products.length === 0 || total === undefined) {
      return NextResponse.json(
        { error: 'Dados incompletos. subject, cnpj, email, products (não vazio) e total são obrigatórios.' },
        { status: 400 }
      );
    }

    // Validar formato dos produtos
    const invalidProduct = products.some(
      (product) =>
        !product.codigo ||
        !product.descricao ||
        typeof product.quantidade !== 'number' ||
        typeof product.valorUnitario !== 'number' ||
        typeof product.valorTotal !== 'number'
    );
    if (invalidProduct) {
      return NextResponse.json(
        { error: 'Formato inválido para os produtos. Todos os campos (codigo, descricao, quantidade, valorUnitario, valorTotal) são obrigatórios.' },
        { status: 400 }
      );
    }

    // Enviar os dados para a API backend usando Ky
    const data = await api
      .post('Email/EnvioEmail', {
        json: {
          subject,
          cnpj,
          email,
          products,
          total,
        },
        timeout: 10000, // Timeout de 10 segundos
      })
      .json();

    console.log('Dados enviados para a API backend com sucesso:', data);
    return NextResponse.json({ message: 'Dados enviados com sucesso para a API backend!', data });
  } catch (error) {
    console.error('Erro na API Route de envio de e-mail:', error);
    if (error instanceof HTTPError) {
      const errorResponse = await error.response.text();
      console.error('Detalhes do erro da API backend:', errorResponse);
      return NextResponse.json(
        { error: 'Erro ao enviar para a API backend.', details: errorResponse || 'Sem detalhes adicionais' },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: 'Erro interno do servidor.', details: (error as Error).message },
      { status: 500 }
    );
  }
}