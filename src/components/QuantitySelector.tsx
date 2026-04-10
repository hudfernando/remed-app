// components/QuantitySelector.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  initialQuantity?: number; // Agora, este é o nosso valor real vindo direto do carrinho
  onQuantityChange: (newQuantity: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  initialQuantity = 0,
  onQuantityChange,
  min = 0,
  max = 10000, // Limite de 10000 que configuramos anteriormente
  className,
}: QuantitySelectorProps) {
  
  // Mantemos o useState apenas para feedback visual da interface (UX)
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(initialQuantity.toString());

  const handleIncrease = () => {
    onQuantityChange(Math.min(initialQuantity + 1, max));
  };

  const handleDecrease = () => {
    onQuantityChange(Math.max(initialQuantity - 1, min));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value); // Apenas atualiza o texto temporário enquanto o usuário digita

    if (value === '') {
      onQuantityChange(min);
      return;
    }

    const numValue = Number.parseInt(value, 10);
    if (!Number.isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      onQuantityChange(clampedValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validações de segurança ao sair do campo
    if (initialQuantity < min) {
      onQuantityChange(min);
    } else if (initialQuantity > max) {
      onQuantityChange(max);
    }
    // Reseta o input visual para bater com o valor real do carrinho
    setInputValue(initialQuantity.toString());
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handleDecrease}
        className="h-8 w-8"
        disabled={initialQuantity <= min}
        aria-label="Diminuir quantidade"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={isFocused ? inputValue : initialQuantity}
        onChange={handleInputChange}
        onFocus={() => {
          setIsFocused(true);
          setInputValue(initialQuantity.toString());
        }}
        onBlur={handleBlur}
        className="w-24 text-center h-8 px-2"
        min={min}
        max={max}
        aria-label="Quantidade"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={handleIncrease}
        className="h-8 w-8"
        disabled={initialQuantity >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}