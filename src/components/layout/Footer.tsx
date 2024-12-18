import Footer from 'components/elements/footer'
import React from 'react'


interface FooterLayoutProps {
    children?: React.ReactNode | JSX.Element | React.ReactElement;
}

export default function FooterLayout(props :FooterLayoutProps) {
  return (
    <Footer>footer{props.children}</Footer>
  )
}
