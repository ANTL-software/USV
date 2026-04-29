// hooks | libraries
import { ReactElement, ReactNode, useState, useCallback, useMemo } from "react";

// context
import { LoaderContext } from "./LoaderContext.tsx";

// components
import Loader from "../../views/components/loader/Loader";

interface ILoaderProviderProps {
  children: ReactNode;
}

function LoaderProvider({ children }: ILoaderProviderProps): ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const showLoader = useCallback((message: string = "Chargement...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("");
  }, []);

  const setLoaderMessage = useCallback((message: string) => {
    setLoadingMessage(message);
  }, []);

  const contextValue = useMemo(() => ({
    isLoading,
    loadingMessage,
    showLoader,
    hideLoader,
    setLoaderMessage,
  }), [isLoading, loadingMessage, showLoader, hideLoader, setLoaderMessage]);

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      {isLoading && (
        <Loader 
          overlay={true}
          message={loadingMessage}
         
        />
      )}
    </LoaderContext.Provider>
  );
}

export default LoaderProvider;