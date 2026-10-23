export interface Message {
  name: string;
  [key: string]: unknown;
}

export type ReceivingFunction = (message: Message) => void;
