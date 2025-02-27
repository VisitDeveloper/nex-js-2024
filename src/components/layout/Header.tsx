'use client';

import { Button, ListSetup, SwitchSimpleTheme } from 'components';
import { Home, InfoCircle, MessageEdit, MobileProgramming, NoteText } from 'iconsax-react';
import React, { JSX } from 'react'

import Header from 'components/elements/header';
import Link from 'next/link';

export interface RouteHeader {
  id: number;
  name: string;
  route: string;
  icon: React.ReactElement | JSX.Element | React.ReactNode;
}



export default function HeaderLayout({ ...props }) {


  const ArrayRouteHeader: Array<RouteHeader> = [
    {
      id: 0,
      name: 'Home',
      route: `/`,
      icon: <Home size="20" className="text-iconColor" />
    },
    {
      id: 1,
      name: 'Weblog',
      route: `/weblog`,
      icon: <MessageEdit size="20" className='text-iconColor' />
    },
    {
      id: 2,
      name: 'Applications',
      route: `/application-page`,
      icon: <MobileProgramming size="20" className='text-iconColor' />

    },
    {
      id: 3,
      name: 'About',
      route: `/about`,
      icon: <InfoCircle size="20" className='text-iconColor' />

    },
    {
      id: 4,
      name: 'Contact',
      route: `/contact-us`,
      icon: <NoteText size="20" className='text-iconColor' />

    },

  ]
  return (
    <>
      {/* mb-[100px] */}
      {/* Desktop */}
      <div className=" z-50 rounded-3xl mx-10 hidden md:block">
        <Header {...props}
          className="backdrop-blur-sm 
                    dark:bg-blackRgba fixed top-0 right-0 lg:right-[17px] left-0 rounded-3xl mt-2 h-[70px] flex
          justify-between items-center px-5 lg:px-10 z-50  mx-5 lg:mx-10 border-2 border-solid border-iconColor">
          <ListSetup alignItems="center" direction="row" justifyContent="start" className="gap-2 lg:gap-5">
            <span className="lg:text-4xl text-2xl font-thin">
              Logo |
            </span>

            {ArrayRouteHeader.map((item: RouteHeader) => {
              return (
                <>
                  <Link href={`${item.route}`} key={item.id} className="flex flex-row items-center gap-2">
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
            {/* <Link href={'/auth'} className='h-8 px-3 text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-solid border-[1px] border-iconColor bg-secondary text-secondary-foreground shadow-sm hover:bg-itemFormBackground '>Login</Link> */}
          </ListSetup>

        </Header>
      </div>


      {/* Mobile */}
      <div className='md:hidden dark:bg-blackRgba block z-50 backdrop-blur-sm fixed top-0 right-0 left-0 h-[60px] px-5'
      >
        <ListSetup alignItems='center' direction='row' justifyContent='between' className='gap-4 h-[60px]'>
          <span className="lg:text-4xl text-2xl font-thin">
            Logo
          </span>
          <div className='flex flex-row gap-2 items-center justify-center'>
            <span>
              <SwitchSimpleTheme />
            </span>
            {/* <Link href={'/auth'} className='h-8 px-3 text-xs inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-solid border-[1px] border-iconColor bg-secondary text-secondary-foreground shadow-sm hover:bg-itemFormBackground '>Login</Link> */}
          </div>
        </ListSetup>
      </div>
    </>
  )
}
