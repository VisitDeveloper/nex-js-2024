import React,{JSX} from 'react';

interface H6Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H6({children , ...props} : H6Props) {
  return (
    <h6 {...props}>
        {children}
    </h6>
  )
}
export default H6