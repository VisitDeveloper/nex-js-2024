import Section from 'components/elements/section';
import React from 'react'
import { DynamicObjectLiterals, ListSetup } from 'components'
import { Home, InfoCircle, MessageEdit, NoteText, Setting3 } from 'iconsax-react';
import Tooltip from 'components/pure-elements/toltip';
import MobileNavigation from './MobileNavigation';
export interface MainLayoutProps {
  children?: React.ReactNode | JSX.Element | React.ReactElement;
  className?: string;
}

export default function MainLayout(props: MainLayoutProps) {


  return (
    <Section className={`${props.className}`}>
      <DynamicObjectLiterals type='HeaderLayout' configKey={{
        className: ''
      }} />
      {props.children}
      <DynamicObjectLiterals type='FooterLayout' />
      <MobileNavigation/>
    </Section>
  )
}
