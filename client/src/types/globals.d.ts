declare global {
  interface External {
    sendMessage: (message: string) => void;
    receiveMessage: (callback: (initialMessage: string) => void) => void;
  }
}

export {};
