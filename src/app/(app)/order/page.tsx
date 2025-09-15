'use client';

import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CartItem } from '@/lib/types';
import { useQueryClient } from '@tanstack/react-query';
import { useGlobalLoading } from '@/context/GlobalLoadingContext';
import { ClientInfoForm } from '@/components/Order/ClientInfoForm';
import { OrderSummary } from '@/components/Order/OrderSummary';
import { OrderActions } from '@/components/Order/OrderActions';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OrderData } from '@/lib/types';

interface OrderFormData {
  cnpj: string;
  email: string;
  observacoes: string;
}

export default function OrderPage() {
  const [formData, setFormData] = useState<OrderFormData>({ cnpj: '', email: '', observacoes: '' });
  const { cartItems, calculateTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { setLoading } = useGlobalLoading();
  const totalValue = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto p-8 max-w-xl text-center mt-16 bg-white rounded-lg shadow-md">
        <Card>
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-4">Seu carrinho está vazio!</h1>
            <p className="text-lg text-gray-600 mb-6">Não há itens para finalizar o pedido.</p>
            <Button onClick={() => router.push('/')}>Voltar às Compras</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFinalizeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoading(true);
    toast.info('Enviando pedido via e-mail...', { duration: 3000 });

    // Validação reforçada
    if (!formData.cnpj || !formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Por favor, preencha todos os campos obrigatórios (CNPJ e um e-mail válido).');
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Adicione pelo menos um item ao carrinho.');
      setIsSubmitting(false);
      setLoading(false);
      return;
    }

    // Montar o JSON normalizado
    const orderData: OrderData = {
      subject: 'Novo Pedido',
      cnpj: formData.cnpj,
      email: formData.email,
      products: cartItems.map((item: CartItem) => ({
        codigo: item.codigo,
        descricao: item.descricao, // Garantir que 'descricao' seja único por item
        quantidade: item.quantity,
        valorUnitario: item.predesc || item.preco,
        valorTotal: (item.predesc || item.preco) * item.quantity,
      })),
      total: Math.round(totalValue * 100) / 100,
    };

    console.log('Dados enviados para o backend:', JSON.stringify(orderData, null, 2));

    try {
      const response = await fetch('/api/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success('Pedido finalizado com sucesso! Notificação enviada via e-mail.');
        queryClient.invalidateQueries({ queryKey: ['products'] });
        clearCart();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        toast.error(`Erro ao enviar notificação via e-mail: ${data.error || 'Erro desconhecido'}`);
        console.error('Erro da API de e-mail:', data.error);
      }
    } catch (err) {
      toast.error('Erro de conexão ou requisição ao enviar notificação.');
      console.error('Erro de rede:', err);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      router.push('/');
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl bg-gray-50 rounded-lg shadow-md mt-16 mb-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Finalizar Pedido</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>Preencha seus dados para finalizar a compra.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientInfoForm
              onSubmit={handleFinalizeOrder}
              isSubmitting={isSubmitting}
              formData={formData}
              onChange={handleInputChange}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
            <CardDescription>Confira os itens do seu carrinho.</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderSummary cartItems={cartItems} totalValue={totalValue} />
          </CardContent>
          <CardFooter>
            <OrderActions onFinalizeOrder={handleFinalizeOrder} isSubmitting={isSubmitting} cartItems={cartItems} />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}