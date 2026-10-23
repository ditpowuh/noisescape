import type {Message, ReceivingFunction} from "@/types/external";

const receivingFunctions = new Set<ReceivingFunction>();
let nativeReceiverRegistered = false;

function sendCommand(message: Message) {
  return window.external.sendMessage(JSON.stringify(message));
}

function receiveCommand(receivingFunction: ReceivingFunction) {
  if (!nativeReceiverRegistered) {
    window.external.receiveMessage((initialMessage: string) => {
      let parsedMessage: Message;

      try {
        parsedMessage = JSON.parse(initialMessage);
      }
      catch (error) {
        console.error("Failed to parse incoming message:", error);
        return;
      }

      receivingFunctions.forEach((handler) => {
        return handler(parsedMessage);
      });
    });
    nativeReceiverRegistered = true;
  }

  receivingFunctions.add(receivingFunction);

  return () => {
    receivingFunctions.delete(receivingFunction);
  }
}

export default {
  sendCommand,
  receiveCommand
};
