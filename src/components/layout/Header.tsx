import Header from 'components/elements/header';
import { ListSetup, SwitchSimpleTheme, Button, Div } from 'components';
import React from 'react'
import { Home, InfoCircle, MessageEdit, MobileProgramming, NoteText } from 'iconsax-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';


interface HeaderLayoutProps {
  children?: React.ReactNode | JSX.Element | React.ReactElement;
}

export default function HeaderLayout({ children, ...props }: HeaderLayoutProps) {
const {theme } = useTheme()
  return (
    <>
      <Div className="w-full h-screen  bg-cover bg-center bg-hero  relative">
        <Header {...props}
          style={{backgroundColor: theme === 'dark' ? "rgba(15, 15, 15, 0.6)" : 'rgba(255, 255, 255, 0.32)' }}
          //  header-glass dark:header-glass-dark
        className="backdrop-blur-sm fixed top-0 right-0 w-[100%] h-[60px] flex
         justify-between items-center px-10">
          <ListSetup alignItems="center" direction="row" justifyContent="start" className="gap-5">
            <span className="text-4xl font-thin">
              Logo |
            </span>

            <Link href={`/en`} className="flex flex-row items-center gap-2">
              <Home size="20" className="text-iconColor" />
              <div className="flex flex-col">
                <span className="relative group text-sm">
                  Home
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Link>

            <Link href={`/en`} className="flex flex-row items-center gap-2">
              <MessageEdit size="20" className='text-iconColor' />
              <div className="flex flex-col">
                <span className="relative group  text-sm">
                  Weblog
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Link>

            <Link href={`/en`} className="flex flex-row items-center gap-2">
              <MobileProgramming size="20" className='text-iconColor' />
              <div className="flex flex-col">
                <span className="relative group  text-sm">
                  Applications
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Link>

            <Link href={`/en`} className="flex flex-row items-center gap-2">
              <InfoCircle size="20" className='text-iconColor' />
              <div className="flex flex-col">
                <span className="relative group  text-sm">
                  About
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Link>

            <Link href={`/en`} className="flex flex-row items-center gap-2">
              <NoteText size="20" className='text-iconColor' />
              <div className="flex flex-col">
                <span className="relative group  text-sm">
                  Contact
                  <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                </span>
              </div>
            </Link>

          </ListSetup>

          <ListSetup alignItems="center" direction="row" justifyContent="end" className="gap-5">
            <span>
              <SwitchSimpleTheme />
            </span>
            <Button variant={"secondary"} size={"sm"}> Login</Button>
          </ListSetup>

        </Header>
      </Div>ّ
    </>
  )
}
