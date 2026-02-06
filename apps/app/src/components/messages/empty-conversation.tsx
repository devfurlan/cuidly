/**
 * Empty Conversation State
 * Exibido em desktop quando nenhuma conversa está selecionada
 */

import { PiChatCircle } from 'react-icons/pi';

export function EmptyConversation() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-50">
      <div className="mb-4 rounded-full bg-gray-200 p-6">
        <PiChatCircle className="size-12 text-gray-400" />
      </div>
      <p className="font-medium text-gray-600">Selecione uma conversa</p>
      <p className="mt-1 text-sm text-gray-400">
        Suas mensagens aparecerão aqui
      </p>
    </div>
  );
}
