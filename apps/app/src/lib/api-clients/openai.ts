import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const createAssistant = async (id: string, vaga: string) => {
  console.log('🚀 ~ createAssistant ~ vaga:', vaga);
  const assistant = await openai.beta.assistants.create({
    name: `${id} - Assistente Cuidly`,
    instructions: `Você é um assistente de seleção de babás da Cuidly. Você vai conversar com a babá via WhatsApp, verificar se ela tem interesse na vaga, se o perfil dela é aderente a vaga e tirar todas as dúvidas.

A vaga é a seguinte:
    *PLANTÃO 8H | FIXO TODOS OS DOMINGOS | SANTANA DE PARNAÍBA-SP*

*VALOR DO PLANTÃO: R$160,00 POR DIA*
Pagamento por Pix, em até 4h pós plantão

*DIAS:* Todos os Domingos
*HORÁRIO:* Das 8h às 16h
*LOCALIZAÇÃO:* Alphaville Residencial 11 - Tamboré, Santana de Parnaíba-SP

*PACIENTE:* 
* Mulher +80 anos.
* Cadeirante e tem mobilidade limitada nos braços, mas consegue comer sozinha.
* Lúcida.

*ROTINA*
* Auxiliar nas necessidades diárias (banho, troca de fraldas).
* Hidratação da pele para prevenção de escaras.
* Preparar e servir refeições.
* Usar cadeira de banho.
* Ajudá-la a ligar TV e pegar sol pela manhã.

*PERFIL DA CUIDADORA*
* Calma, que não fale muito (paciente prefere ambiente silencioso)
* Certificado de Cuidadora
* Mais de 3 anos de experiência


*** INSTRUÇÕES ***
- Faça uma pergunta de cada vez
- Seja simples, pois a maioria das babas são semi-analfabetas
- Pergunte se ela tem interesse na vaga
- Pergunte se ela tem alguma dúvida
- Se tiver o perfil aderente a vaga, peça que envie os seguintes documentos: RG ou CNH (foto legível), Certificado de Cuidadora e/ou Auxiliar de Enfermagem, Pix e foto de rosto (de preferência sorrindo)`,
    model: 'gpt-4-turbo-preview',
  });

  return assistant.id;
};

export const askGPT = async (
  assistantId: string,
  threadId: string,
  message: string,
): Promise<string> => {
  // aguarda run ativo (se houver)
  const lastRun = await openai.beta.threads.runs.list(threadId, { limit: 1 });

  if (lastRun.data.length && lastRun.data[0].status !== 'completed') {
    const runId = lastRun.data[0].id;
    let attempts = 0;

    while (attempts < 30) {
      const runStatus = await openai.beta.threads.runs.retrieve(
        threadId,
        runId,
      );
      if (runStatus.status === 'completed') break;

      if (
        runStatus.status === 'failed' ||
        runStatus.status === 'cancelled' ||
        runStatus.status === 'expired'
      ) {
        console.log('⚠️ run falhou ou expirou:', runStatus.status);
        return 'Houve um erro ao processar a resposta. Tente novamente.';
      }

      if (attempts === 29) {
        console.log('⏱ run demorou demais, cancelando…');
        await openai.beta.threads.runs.cancel(threadId, runId);
        return 'Estamos com instabilidade no atendimento agora. Tente novamente em alguns minutos.';
      }

      await new Promise((r) => setTimeout(r, 1000));
      attempts++;
    }
  }

  // agora sim adiciona a nova mensagem
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: assistantId,
  });

  // aguarda a resposta desse novo run
  let attempts = 0;
  while (attempts < 30) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

    if (runStatus.status === 'completed') break;

    if (
      runStatus.status === 'failed' ||
      runStatus.status === 'cancelled' ||
      runStatus.status === 'expired'
    ) {
      console.log('⚠️ novo run falhou:', runStatus.status);
      return 'Houve um erro ao processar a resposta. Tente novamente.';
    }

    if (attempts === 29) {
      console.log('⏱ novo run demorou demais, cancelando…');
      await openai.beta.threads.runs.cancel(threadId, run.id);
      return 'Estamos com instabilidade no atendimento agora. Tente novamente em alguns minutos.';
    }

    await new Promise((r) => setTimeout(r, 1000));
    attempts++;
  }

  const messages = await openai.beta.threads.messages.list(threadId, {
    limit: 1,
  });

  const last = messages.data[0];
  const response = last.content.find((c) => c.type === 'text');

  return response?.text?.value || '';
};
