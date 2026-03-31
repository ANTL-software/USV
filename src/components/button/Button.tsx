// styles
import "./button.scss";

// types
import { ReactElement, ReactNode, MouseEvent } from "react";

interface IButtonProps {
  style: "orange" | "white" | "grey" | "green" | "red" | "back" | "seaGreen" | "gradient";
  children: ReactNode;
  type?: "submit" | "reset" | "button";
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export default function Button({
  style,
  children,
  type = "button",
  disabled = false,
  onClick,
  className = ""
}: Readonly<IButtonProps>): ReactElement {
  const buttonClassName = `${style}Button ${className}`.trim();

  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
