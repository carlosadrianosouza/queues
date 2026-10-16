/**
 * Extrai o grupo de destino (back, play, messages, gateway) a partir do
 * eventSourceARN da fila SQS que disparou a Lambda.
 *
 * Formato do ARN: arn:aws:sqs:us-east-1:123456789:sbq-back-affiliates
 * Nome da fila: sbq-back-affiliates → grupo: "back"
 *
 * O grupo é o primeiro segmento após "sbq-" no nome da fila.
 */
export const getGroupByEventSource = (eventSourceARN: string): string => {
  // Extrai o nome da fila do ARN (última parte após ":")
  const queueName = eventSourceARN.split(":").pop();

  if (!queueName) {
    throw new Error(
      `Não foi possível extrair nome da fila do ARN: ${eventSourceARN}`
    );
  }

  // Remove prefixo "sbq-" e captura o grupo (primeiro segmento antes do próximo "-")
  const match = /^sbq-(\w+)-/.exec(queueName);

  if (!match || !match[1]) {
    throw new Error(
      `Nome da fila '${queueName}' não segue o padrão sbq-{grupo}-{nome}`
    );
  }

  return match[1];
};
