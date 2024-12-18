import React from "react";
import { Div } from "components/index";

interface RowProps {
    children?: React.ReactNode | React.ReactElement | JSX.Element;
    className?: string;
}

function Row({children, className} : RowProps) {
  return <Div className={`${className} grid grid-cols-12`}>
    {children}
  </Div>;
}
export default Row