
import Section from 'components/elements/section';
import React from 'react'
import MobileNavigation from './MobileNavigation';
import { motion } from 'motion/react'
import { useParams } from 'next/navigation';
export interface MainLayoutProps {
  children?: React.ReactNode | JSX.Element | React.ReactElement;
  className?: string;
}

export default function MainLayout(props: MainLayoutProps) {
  return (
    <Section className={`${props.className}`}>
      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1,
          y: 0
        }}

        exit={{ opacity: 0 }}
        transition={{
          duration: 1
        }}>
        {props.children}
      </motion.div>
      <MobileNavigation />
    </Section>
  )
}
