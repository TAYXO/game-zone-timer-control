
import { useContext } from "react";
import { POSContext } from "./POSProvider";
import { POSContextType } from "./types";

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
