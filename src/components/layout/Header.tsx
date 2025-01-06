'use client'
import Header from 'components/elements/header';
import { ListSetup, SwitchSimpleTheme, Button, Div } from 'components';
import React from 'react'
import { Home, InfoCircle, MessageEdit, MobileProgramming, NoteText } from 'iconsax-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useParams } from 'next/navigation';


interface HeaderLayoutProps {
  children?: React.ReactNode | JSX.Element | React.ReactElement;
}

interface RouteHeader {
  name: string;
  route: string;
  icon: React.ReactElement | JSX.Element | React.ReactNode;
}



export default function HeaderLayout({ children, ...props }: HeaderLayoutProps) {
  const params = useParams()

  const ArrayRouteHeader: Array<RouteHeader> = [
    {
      name: 'Home',
      route: `/en`,
      icon: <Home size="20" className="text-iconColor" />
    },
    {
      name: 'Weblog',
      route: `/en`,
      icon: <MessageEdit size="20" className='text-iconColor' />
    },
    {
      name: 'Applications',
      route: `/en`,
      icon: <MobileProgramming size="20" className='text-iconColor' />

    },
    {
      name: 'About',
      route: `/${params.lng}/about`,
      icon: <InfoCircle size="20" className='text-iconColor' />

    },
    {
      name: 'Contact',
      route: `/en`,
      icon: <NoteText size="20" className='text-iconColor' />

    },

  ]
  const { theme } = useTheme()
  return (
    <>
      <Div className="mb-[100px] z-50">
        <Header {...props}
          style={{ backgroundColor: theme === 'dark' ? "rgba(15, 15, 15, 0.6)" : 'rgba(255, 255, 255, 0.32)' }}
          
          className="backdrop-blur-sm fixed top-0 right-0 w-[100%] h-[60px] flex
         justify-between items-center px-10 z-50">
          <ListSetup alignItems="center" direction="row" justifyContent="start" className="gap-5">
            <span className="text-4xl font-thin">
              Logo |
            </span>

            {ArrayRouteHeader.map((item: RouteHeader) => {
              return (
                <>
                  <Link href={`${item.route}`} className="flex flex-row items-center gap-2">
                    {item.icon}
                    <div className="flex flex-col">
                      <span className="relative group  text-sm">
                        {item.name}
                        <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                      </span>
                    </div>
                  </Link>
                </>
              )
            })}

          </ListSetup>

          <ListSetup alignItems="center" direction="row" justifyContent="end" className="gap-5">
            <span>
              <SwitchSimpleTheme />
            </span>
            <Button variant={"secondary"} size={"sm"}> Login</Button>
          </ListSetup>

        </Header>
      </Div>
    </>
  )
}
