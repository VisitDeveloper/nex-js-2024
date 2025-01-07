import React,{JSX} from 'react';

interface H2Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H2({children , ...props} : H2Props) {
  return (
    <h2 {...props}>
        {children}
    </h2>
  )
}
export default H2