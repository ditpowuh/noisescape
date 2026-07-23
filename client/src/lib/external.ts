import type {Message} from "@/types/external";

function sendCommand(message: Message) {
  return window.external.sendMessage(JSON.stringify(message));
}

function receiveCommand(receivingFunction: (message: Message) => void) {
  const wrapperFunction = (initialMessage: string) => {
    try {
      const parsedMessage: Message = JSON.parse(initialMessage);
      receivingFunction(parsedMessage);
    }
    catch (error) {
      console.error("Failed to parse incoming message:", error);
    }
  }

  return window.external.receiveMessage(wrapperFunction);
}

export default {
  sendCommand,
  receiveCommand
};
