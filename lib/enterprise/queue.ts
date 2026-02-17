export type QueueProvider = "BULLMQ" | "RABBITMQ" | "CLOUD_TASKS";

export interface QueueMessage<TPayload> {
  queue: string;
  name: string;
  payload: TPayload;
  idempotencyKey: string;
  delayMs?: number;
}

export interface QueueAdapter {
  provider: QueueProvider;
  enqueue<TPayload>(message: QueueMessage<TPayload>): Promise<void>;
}

class InProcessQueueAdapter implements QueueAdapter {
  provider: QueueProvider = "BULLMQ";

  async enqueue<TPayload>(message: QueueMessage<TPayload>): Promise<void> {
    console.info("[queue] enqueue", {
      provider: this.provider,
      queue: message.queue,
      name: message.name,
      idempotencyKey: message.idempotencyKey,
      delayMs: message.delayMs ?? 0,
      payload: message.payload,
    });
  }
}

export const queueAdapter: QueueAdapter = new InProcessQueueAdapter();
