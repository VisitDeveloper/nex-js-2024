import React,{JSX} from 'react';

interface H4Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H4({children , ...props} : H4Props) {
  return (
    <h4 {...props}>
        {children}
    </h4>
  )
}
export default H4