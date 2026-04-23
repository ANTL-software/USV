import { createContext } from "react";

interface ILoaderContextProps {
  isLoading: boolean;
  loadingMessage: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  setLoaderMessage: (message: string) => void;
}

export const LoaderContext = createContext<ILoaderContextProps>({
  isLoading: false,
  loadingMessage: "",
  showLoader: () => {},
  hideLoader: () => {},
  setLoaderMessage: () => {},
});