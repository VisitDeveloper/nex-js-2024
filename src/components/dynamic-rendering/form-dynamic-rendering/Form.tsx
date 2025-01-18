import React, { JSX } from 'react';
import { Row } from "components/index";
interface FormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  children?: React.ReactNode | React.ReactElement | JSX.Element;
}

function Form({ children, ...props }: FormProps) {
  return (
    <form {...props}>
      <Row>{children}</Row>
    </form>
  );
}
export default Form;