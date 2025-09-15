'use client';

import { CartSummary } from "../Cart/CartSummary";

interface ProductTableHeaderProps {
  displayedProducts: number;
  totalProducts: number;
}

export function ProductTableHeader({ displayedProducts, totalProducts }: ProductTableHeaderProps) {
  return (
    <div className="flex justify-between">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
      </h2>
      <CartSummary />
    </div>
  );
}