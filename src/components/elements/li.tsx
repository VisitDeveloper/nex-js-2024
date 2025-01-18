import React,{JSX} from 'react';

interface LiProps extends React.HTMLProps<HTMLLIElement> {
    children?: React.ReactNode | React.ReactElement | JSX.Element
}

function LI({children ,...props}: LiProps) {
    return (
      <li {...props}>
          {children}
      </li>
    )
  }
export default LI