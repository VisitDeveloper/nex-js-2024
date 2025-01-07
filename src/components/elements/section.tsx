import React,{JSX} from 'react';

interface SectionProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    children?: React.ReactNode | React.ReactElement | JSX.Element
}

function Section({children ,...props}: SectionProps) {
    return (
      <section {...props}>
          {children}
      </section>
    )
  }
export default Section