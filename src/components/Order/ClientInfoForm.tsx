// components/Order/ClientInfoForm.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ClientInfoFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  formData: {
    cnpj: string;
    email: string;
    prazo: string;
    observacao: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function ClientInfoForm({ onSubmit, isSubmitting, formData, onChange }: ClientInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ *</Label>
        <Input id="cnpj" type="text" value={formData.cnpj} onChange={onChange} required disabled={isSubmitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={formData.email} onChange={onChange} required disabled={isSubmitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="prazo">Prazo de Pagamento *</Label>
        <Input id="prazo" type="text" value={formData.prazo} onChange={onChange} placeholder="Ex: 21 dias" required disabled={isSubmitting} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações *</Label>
        <Textarea
          id="observacao"
          value={formData.observacao}
          onChange={onChange}
          placeholder="Insira aqui qualquer observação relevante para o seu pedido."
          required
          disabled={isSubmitting}
          className="min-h-[100px]"
        />
      </div>
    </form>
  );
}