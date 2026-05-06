export interface ScanResult {
  product_name: string;
  brand: string;
  quantity: number;
  unit: string;
  category: string;
  normal_price: number;
  promo_price: number;
  market: string;
  club_name: string;
  is_promotion: boolean;
  analysis: string;
}

export async function scanProductImage(base64Image: string): Promise<ScanResult> {
  const response = await fetch('/api/ai/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: base64Image }),
  });

  if (!response.ok) {
    throw new Error('Falha ao escanear produto');
  }

  return response.json();
}

export async function processVoiceCommand(command: string) {
  const response = await fetch('/api/ai/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: command }),
  });

  if (!response.ok) {
    throw new Error('Falha ao processar comando de voz');
  }

  return response.json();
}
