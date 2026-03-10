// styles
import "../authForm/authForm.scss";

// hooks | library
import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

// custom types
interface ISignInFormProps {
  identifiant: string;
  password: string;
  setIdentifiant: (value: string) => void;
  setPassword: (value: string) => void;
}

// context
import { useUserContext } from "../../hooks/useUserContext.ts";
import type { LoginCredentials } from "../../utils/types/user.types.ts";

// utils
import { handleAuthError } from "../../utils/scripts/authErrorHandling.ts";

// components
import Button from "../button/Button.tsx";

export default function SignInForm({
  identifiant,
  password,
  setIdentifiant,
  setPassword,
}: Readonly<ISignInFormProps>): ReactElement {
  const navigate: NavigateFunction = useNavigate();
  const { login, user, isLoading } = useUserContext();
  const [error, setError] = useState<string>("");

  const handleSubmit = async (): Promise<void> => {
    setError("");
    const credentials: LoginCredentials = {
      identifiant,
      password,
    };

    try {
      await login(credentials);
    } catch (error: unknown) {
      const errorMessage = handleAuthError(error);
      setError(errorMessage);
    }
  };

  useEffect((): void => {
    if (user) {
      navigate("/home");
    }
  }, [user]);

  return (
    <form
      id={"authForm"}
      onSubmit={(e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        handleSubmit().finally();
      }}
    >
      <h2>Se connecter</h2>
      <div className={"inputContainer"}>
        <label htmlFor={"identifiant"}>Identifiant</label>
        <input
          id={"identifiant"}
          type={"text"}
          value={identifiant}
          autoComplete={"username"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setIdentifiant(e.target.value)
          }
        />
      </div>
      <div className={"inputContainer"}>
        <label htmlFor={"password"}>Mot de passe</label>
        <input
          id={"password"}
          type={"password"}
          value={password}
          autoComplete={"current-password"}
          onChange={(e: ChangeEvent<HTMLInputElement>): void =>
            setPassword(e.target.value)
          }
        />
      </div>
      {error && (
        <div className="errorMessage">
          {error}
        </div>
      )}
      <div className={"buttonContainer"}>
        <Button
          style="seaGreen"
          children={isLoading ? "Connexion..." : "Connexion"}
          type="submit"
          disabled={isLoading}
        />
      </div>
    </form>
  );
}
