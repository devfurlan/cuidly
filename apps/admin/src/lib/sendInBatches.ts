import { sendMessage } from '@/lib/zap';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const messages = [
  'Olá! Temos uma nova vaga de cuidadora perto de você.',
  'Oi! Surgiu uma vaga de cuidadora na sua região.',
  'Tudo bem? Apareceu uma vaga de cuidadora próxima a você.',
];

export const sendVagaToList = async (phones: string[], vaga: string) => {
  for (let i = 0; i < phones.length; i++) {
    const phone = phones[i];
    const textoBase = messages[i % messages.length];
    const message = `${textoBase}\n\n${vaga}\n\nDeseja saber mais?`;

    await sendMessage(phone, message);
    await delay(8000);
  }
};
