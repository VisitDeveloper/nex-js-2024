import React,{JSX} from 'react';

interface H5Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>{
    children ?: React.ReactElement | React.ReactNode | JSX.Element;
}

function H5({children , ...props} : H5Props) {
  return (
    <h5 {...props}>
        {children}
    </h5>
  )
}
export default H5