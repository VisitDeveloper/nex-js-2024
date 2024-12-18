import Header from 'components/elements/header';
import React from 'react'


interface HeaderLayoutProps {
    children?: React.ReactNode | JSX.Element | React.ReactElement;
}

export default function HeaderLayout({children , ...props} :HeaderLayoutProps) {
  return (
    <Header {...props}>
      {children}
    </Header>
  )
}
