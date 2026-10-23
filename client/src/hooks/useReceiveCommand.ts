import {useEffect, useRef} from "react";

import external from "@/lib/external";

import type {Message} from "@/types/external";

export default function useReceiveCommand(receivingFunction: (message: Message) => void) {
  const receivingFunctionRef = useRef(receivingFunction);

  useEffect(() => {
    receivingFunctionRef.current = receivingFunction;
  });

  useEffect(() => {
    return external.receiveCommand((message) => {
      return receivingFunctionRef.current(message);
    });
  }, []);
}
