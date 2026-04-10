// app/cart/page.tsx
'use client';

import { useCart } from '@/context/CartContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { QuantitySelector } from '@/components/QuantitySelector';
import Link from 'next/link';
import { CartItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function CartPage() {
  const { cartItems, removeItemFromCart, updateItemQuantity, calculateTotal } = useCart();
  const totalValue = calculateTotal();

  return (
    // 1. Alterado para max-w-[1200px] para alinhar com o cabeçalho e dar muito espaço
    <div className="container mx-auto p-4 sm:p-8 max-w-[1200px] bg-white rounded-lg shadow-md mt-16 mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">Seu Carrinho de Compras</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500 text-lg py-10">
          <p>Seu carrinho está vazio.</p>
          <Link href="/">
            <Button className="mt-4">Voltar às Compras</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border rounded-md mb-6 shadow-sm">
            {/* 2. Removido o min-w-[800px] e ajustado o layout da tabela */}
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-auto">Produto</TableHead>
                  <TableHead className="text-right whitespace-nowrap px-4">Preço Unitário</TableHead>
                  <TableHead className="text-center w-[180px]">Quantidade</TableHead>
                  <TableHead className="text-right whitespace-nowrap px-4">Subtotal</TableHead>
                  <TableHead className="text-center w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item: CartItem) => (
                  <TableRow key={item.codigo} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm sm:text-base py-4">
                      <span className={!item.emEstoque ? "text-red-500 font-semibold" : ""}>
                         {item.descricao} {!item.emEstoque && "(Sem Estoque)"}
                      </span>
                    </TableCell> 
                    <TableCell className="text-right whitespace-nowrap px-4">
                      {formatCurrency(item.predesc || item.preco)} 
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <QuantitySelector
                          initialQuantity={item.quantity}
                          onQuantityChange={(newQuantity) => updateItemQuantity(item.codigo, newQuantity)} 
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap px-4">
                      {formatCurrency(
                        (item.predesc || item.preco) * item.quantity 
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemFromCart(item.codigo)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 border-t border-gray-200 gap-4">
            <Link href="/" className="order-2 sm:order-1 w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Continuar Comprando</Button>
            </Link>
            <div className="flex flex-col sm:flex-row items-center gap-4 order-1 sm:order-2 w-full sm:w-auto">
              <span className="text-2xl font-bold text-gray-800 whitespace-nowrap">
                Total: {formatCurrency(totalValue)}
              </span>
              <Link href="/order" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">Finalizar Pedido</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}