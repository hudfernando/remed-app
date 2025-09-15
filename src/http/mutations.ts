// http/mutations.ts
import { OrderData } from "@/lib/types";

export const sendOrderEmail = async (orderData: OrderData) => {
    const response = await fetch('/api/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro desconhecido ao enviar o pedido.');
    }

    return response.json();
};