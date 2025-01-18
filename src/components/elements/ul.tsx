import React,{JSX} from 'react';

interface ULProps extends React.HTMLProps<HTMLUListElement> {
  children?: React.ReactNode | React.ReactElement | JSX.Element
}

function UL({ children, ...props }: ULProps) {
  return (
    <ul {...props}>
      {children}
    </ul>
  )
}
export default UL