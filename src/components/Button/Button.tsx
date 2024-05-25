import { DetailedHTMLProps, FC } from "react";
import styles from './styles.module.css'

const Button: FC<DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = ({ children, ...props }) => {
  return <button {...props} className={styles.button}>{children}</button>;
};

export default Button;
