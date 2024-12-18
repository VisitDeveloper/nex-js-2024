import Header from 'components/elements/header';
import React from 'react'


interface HeaderLayoutProps {
    children?: React.ReactNode | JSX.Element | React.ReactElement;
}

export default function HeaderLayout(props :HeaderLayoutProps) {
  return (
    <Header>header{props.children}</Header>
  )
}
