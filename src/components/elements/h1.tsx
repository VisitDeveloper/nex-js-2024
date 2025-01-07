import React,{JSX} from 'react';

interface H1Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H1({children , ...props} : H1Props) {
  return (
    <h1 {...props}>
        {children}
    </h1>
  )
}
export default H1