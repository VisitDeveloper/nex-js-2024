
import React,{JSX} from 'react';

interface H3Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H3({children , ...props} : H3Props) {
  return (
    <h3 {...props}>
        {children}
    </h3>
  )
}
export default H3
