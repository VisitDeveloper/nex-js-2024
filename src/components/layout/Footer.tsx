import Footer from 'components/elements/footer'
import ListSetup from 'components/wrapper-elements/ListSetup';
import Row from 'components/wrapper-elements/Row';
import { Span } from 'components/index';
import React from 'react'
import Link from 'next/link';
import { Call, Facebook, Home, InfoCircle, Instagram, Location, MessageEdit, MobileProgramming, NoteText, Send2, Sms, Whatsapp } from 'iconsax-react';


export default function FooterLayout({ ...props }) {
  return (
    <>
      <Footer {...props} className='mb-24'>
        <div className=' dark:text-white  bg-miniBackground  text-black h-auto py-8 mx-10 shadow-lg rounded-3xl'>
          <Row className='px-10 gap-4'>
            <div className='md:col-span-4 col-span-12'>
              <ListSetup className='gap-4' alignItems='start' direction='col' justifyContent='start'  >
                <div className='font-thin text-3xl mt-5'>
                  Address
                </div>
                <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-[-18px]'></Span>

                <ListSetup direction='col' justifyContent='start' alignItems='start'>
                  <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                    <Location size="20" className='text-iconColor' />
                    <div className='text-lg'>
                      Location
                    </div>
                  </ListSetup>
                  <span className='text-sm text-[#8d8d8e]'>
                    description dolores autdolore veritatis porro
                  </span>
                </ListSetup>
                <ListSetup direction='col' justifyContent='start' alignItems='start'>
                  <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                    <Sms size="20" className='text-iconColor' />
                    <div className='text-lg '>
                      E-mail
                    </div>
                  </ListSetup>
                  <span className='text-sm text-[#8d8d8e]'>
                    textemail@yahoo.com
                  </span>
                </ListSetup>
                <ListSetup direction='col' justifyContent='start' alignItems='start'>
                  <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                    <Call size="20" className='text-iconColor' />
                    <div className='text-lg '>
                      Telephone
                    </div>
                  </ListSetup>
                  <span className='text-sm text-[#8d8d8e]'>
                    +1-50-044-5450
                  </span>
                </ListSetup>

              </ListSetup>
            </div>

            <div className='md:col-span-4 col-span-12'>
              <ListSetup className='gap-4' alignItems='start' direction='col' justifyContent='start'  >
                <div className='font-thin text-3xl mt-5'>
                  Links
                </div>
                <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200  mt-[-18px]'></Span>

                <Link href={`/en`} className="flex flex-row items-center gap-2">
                  <Home size="20" className="text-iconColor" />
                  <div className="flex flex-col">
                    <span className="relative group">
                      Home
                      <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Link>

                <Link href={`/en`} className="flex flex-row items-center gap-2">
                  <MessageEdit size="20" className='text-iconColor' />
                  <div className="flex flex-col">
                    <span className="relative group">
                      Weblog
                      <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Link>

                <Link href={`/en`} className="flex flex-row items-center gap-2">
                  <MobileProgramming size="20" className='text-iconColor' />
                  <div className="flex flex-col">
                    <span className="relative group">
                      Applications
                      <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Link>

                <Link href={`/en`} className="flex flex-row items-center gap-2">
                  <InfoCircle size="20" className='text-iconColor' />
                  <div className="flex flex-col">
                    <span className="relative group">
                      About
                      <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Link>

                <Link href={`/en`} className="flex flex-row items-center gap-2">
                  <NoteText size="20" className='text-iconColor' />
                  <div className="flex flex-col">
                    <span className="relative group">
                      Contact
                      <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Link>

              </ListSetup>

            </div>

            <div className='md:col-span-4 col-span-12'>
              <ListSetup className='gap-4' alignItems='center' direction='col' justifyContent='center'  >
                <div className='font-thin text-3xl mt-5'>
                  Logo
                </div>
                {/* <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200  mt-[-18px]'></Span> */}

                Name Project
              </ListSetup>

            </div>

          </Row>

          <div className='flex flex-col md:flex-row-reverse justify-between items-center '>
            
            
            <div className='px-10 gap-2 mt-8 flex flex-row-reverse '>
              <Span>
                - Social Media
              </Span>
              <ListSetup alignItems='center' justifyContent='start' direction='row' className='gap-2'>
                <div className='cursor-pointer'>
                  <Instagram size="20" className='text-iconColor' />
                </div>
                <div className='cursor-pointer'>
                  <Whatsapp size="20" className='text-iconColor' />
                </div>
                <div className='cursor-pointer'>
                  <Send2 size="20" className='text-iconColor' />
                </div>
                <div className='cursor-pointer'>
                  <Facebook size="20" className='text-iconColor' />
                </div>
              </ListSetup>
            </div>
            <div className='px-10 gap-2 mt-8 text-xs font-bold'>
              © 2025 Stroy Reader. All rights reserved.
            </div>
          </div>


        </div>

      </Footer>

    </>
  )
}
