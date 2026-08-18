import { useEffect, ReactElement, ComponentType } from "react";
import { useNavigate, NavigateFunction, useLocation } from "react-router-dom";
import { useUserContext } from '../../hooks/index.ts';
import { getFirstAllowedPath, hasAccessToPath } from '../scripts/index.ts';

export default function WithAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
): (props: P) => ReactElement | null {
  return function AuthenticatedComponent(props: P): ReactElement | null {
    const navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading } = useUserContext();

    useEffect((): void => {
      if (!isLoading) {
        if (!isAuthenticated) {
          navigate("/auth");
        } else if (user) {
          const currentPath = location.pathname;
          const hasAccess = hasAccessToPath(user, currentPath);
          if (!hasAccess) {
            const redirectPath = getFirstAllowedPath(user);
            navigate(redirectPath);
          } else if (currentPath === '/home' || currentPath === '/') {
            const redirectPath = getFirstAllowedPath(user);
            if (redirectPath !== '/home') navigate(redirectPath);
          }
        }
      }
    }, [isAuthenticated, isLoading, navigate, user, location.pathname]);

    if (isLoading) {
      return <div>Chargement...</div>;
    }

    return isAuthenticated && user && hasAccessToPath(user, location.pathname) ? (
      <WrappedComponent {...props} />
    ) : null;
  };
}
