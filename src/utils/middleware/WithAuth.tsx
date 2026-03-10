import { useEffect, ReactElement, ComponentType } from "react";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { useUserContext } from "../../hooks/useUserContext.ts";

export default function WithAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
): (props: P) => ReactElement | null {
  return function AuthenticatedComponent(props: P): ReactElement | null {
    const navigate: NavigateFunction = useNavigate();
    const { user, isAuthenticated, isLoading } = useUserContext();

    useEffect((): void => {
      if (!isLoading && !isAuthenticated) {
        navigate("/auth");
      }
    }, [isAuthenticated, isLoading, navigate]);

    if (isLoading) {
      return <div>Chargement...</div>;
    }

    return isAuthenticated && user ? <WrappedComponent {...props} /> : null;
  };
}
