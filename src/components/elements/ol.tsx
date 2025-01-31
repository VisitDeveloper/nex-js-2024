import React,{JSX} from 'react';

interface OLProps extends React.OlHTMLAttributes<HTMLOListElement> {
    children?: React.ReactNode | React.ReactElement | JSX.Element
}

function OL({children ,...props}: OLProps) {
    return (
      <ol {...props}>
          {children}
      </ol>
    )
  }
export default OL