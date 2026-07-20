import { useContext } from "react";
import { CourrierContext } from "../context/courrier/index.ts";

export const useCourrier = () => {
  return useContext(CourrierContext);
};
