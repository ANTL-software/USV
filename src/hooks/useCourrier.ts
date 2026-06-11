import { useContext } from "react";
import { CourrierContext } from "../context/courrier/CourrierContext.tsx";

export const useCourrier = () => {
  return useContext(CourrierContext);
};
