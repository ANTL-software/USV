// styles
import "./authPage.scss";

// hooks | libraries
import { ReactElement, useState } from "react";

// components
import Header from "../../components/header/Header";
import SignInForm from "../../components/signInForm/SignInForm.tsx";
import Footer from "../../components/footer/Footer";

export default function AuthPage(): ReactElement {
  const [identifiant, setIdentifiant] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  return (
    <div id="authPage" className="authPageContainer">
      <Header />
      <main>
        <SignInForm
          identifiant={identifiant}
          password={password}
          setIdentifiant={setIdentifiant}
          setPassword={setPassword}
        />
      </main>
      <Footer />
    </div>
  );
}
