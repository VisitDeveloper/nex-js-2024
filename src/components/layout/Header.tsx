'use client';
import Header from 'components/elements/header';
import { ListSetup, SwitchSimpleTheme, Button, Div } from 'components';
import React, { JSX } from 'react'
import { Home, InfoCircle, MessageEdit, MobileProgramming, NoteText } from 'iconsax-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
// import { useParams } from 'next/navigation';




export interface RouteHeader {
  name: string;
  route: string;
  icon: React.ReactElement | JSX.Element | React.ReactNode;
}



export default function HeaderLayout({ ...props }) {
  // const params = useParams()

  const ArrayRouteHeader: Array<RouteHeader> = [
    {
      name: 'Home',
      route: `/`,
      icon: <Home size="20" className="text-iconColor" />
    },
    {
      name: 'Weblog',
      route: `/`,
      icon: <MessageEdit size="20" className='text-iconColor' />
    },
    {
      name: 'Applications',
      route: `/`,
      icon: <MobileProgramming size="20" className='text-iconColor' />

    },
    {
      name: 'About',
      route: `/about`,
      icon: <InfoCircle size="20" className='text-iconColor' />

    },
    {
      name: 'Contact',
      route: `/contact-us`,
      icon: <NoteText size="20" className='text-iconColor' />

    },

  ]
  const { theme } = useTheme()
  return (
    <>
      <Div className="mb-[100px] z-50 rounded-3xl mx-10 hidden md:block">
        <Header {...props}
          style={{ backgroundColor: theme === 'dark' ? "rgba(15, 15, 15, 0.6)" : 'rgba(255, 255, 255, 0.32)', border: theme === 'dark' ? '1px solid #2fe99f' : '1px solid #FF8A65' }}

          className="backdrop-blur-sm fixed top-0 right-0 left-0 rounded-3xl mt-2 h-[70px] flex
         justify-between items-center px-10 z-50  mx-10">
          <ListSetup alignItems="center" direction="row" justifyContent="start" className="gap-5">
            <span className="text-4xl font-thin">
              Logo |
            </span>

            {ArrayRouteHeader.map((item: RouteHeader) => {
              return (
                <>
                  <Link href={`${item.route}`} key={item.name} className="flex flex-row items-center gap-2">
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
