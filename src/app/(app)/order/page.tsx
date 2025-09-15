'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientInfoForm } from '@/components/Order/ClientInfoForm';
import { OrderSummary } from '@/components/Order/OrderSummary';
import { OrderActions } from '@/components/Order/OrderActions';
import { sendOrderEmail } from '@/http/mutations';
import { getCookie } from '@/lib/cookies';
import type { OrderData, CartItem } from '@/lib/types';

// CORREÇÃO 1: Adicionar os novos campos à interface do estado do formulário
interface OrderFormData {
  cnpj: string;
  email: string;
  prazo: string;
  observacao: string;
}

export default function OrderPage() {
    // CORREÇÃO 2: Adicionar os novos campos ao estado inicial
    const [formData, setFormData] = useState<OrderFormData>({
        cnpj: '',
        email: '',
        prazo: '',
        observacao: ''
    });

    const { cartItems, calculateTotal, clearCart } = useCart();
    const totalValue = calculateTotal();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Lógica para preencher o CNPJ a partir dos cookies
    useEffect(() => {
        const savedCnpj = getCookie('cnpj');
        if (savedCnpj) {
            setFormData(prev => ({ ...prev, cnpj: savedCnpj }));
        }
    }, []);

    // Lógica de mutação (useMutation) permanece a mesma
    const { mutate: finalizeOrder, isPending: isSubmitting } = useMutation({
        mutationFn: sendOrderEmail,
        onSuccess: () => {
            toast.success('Pedido finalizado com sucesso! Notificação enviada via e-mail.');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            clearCart();
            router.push('/');
        },
        onError: (err) => {
            toast.error(`Erro ao enviar pedido: ${err.message}`);
        },
    });


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleFinalizeOrder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Validação agora inclui os novos campos
        if (!formData.cnpj || !formData.email || !formData.prazo || !formData.observacao) {
            toast.error('Por favor, preencha todos os campos obrigatórios (*).');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Por favor, insira um e-mail válido.');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Seu carrinho está vazio.');
            return;
        }
        
        // CORREÇÃO 3: Incluir os novos campos ao criar o objeto a ser enviado
        const orderData: OrderData = {
            subject: 'Novo Pedido',
            cnpj: formData.cnpj,
            email: formData.email,
            prazo: formData.prazo,
            observacao: formData.observacao,
            products: cartItems.map((item: CartItem) => ({
                codigo: item.codigo,
                descricao: item.descricao,
                quantidade: item.quantity,
                valorUnitario: item.predesc || item.preco,
                valorTotal: (item.predesc || item.preco) * item.quantity,
            })),
            total: Math.round(totalValue * 100) / 100,
        };
        console.log("Dados FINAIS enviados para o backend:", orderData)
        finalizeOrder(orderData);
    };

    // O resto do componente JSX não precisa de alterações
    if (cartItems.length === 0 && !isSubmitting) {
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

    return (
        <div className="container mx-auto p-8 max-w-4xl bg-gray-50 rounded-lg shadow-md mt-16 mb-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">Finalizar Pedido</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Cliente</CardTitle>
                        <CardDescription>Preencha os dados para finalizar a compra.</CardDescription>
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