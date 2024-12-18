import Section from 'components/elements/section';
import React from 'react'
import {DynamicObjectLiterals} from 'components'

export interface MainLayoutProps {
    children?: React.ReactNode | JSX.Element | React.ReactElement;
    className?: string;
}

export default function MainLayout(props :MainLayoutProps) {
     
  return (
    <Section className={`${props.className}`}>
        <DynamicObjectLiterals type='HeaderLayout' />
        {props.children}
        <DynamicObjectLiterals type='FooterLayout'/>
    </Section>
  )
}
