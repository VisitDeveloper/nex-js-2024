import Footer from 'components/elements/footer'
import ListSetup from 'components/wrapper-elements/ListSetup';
import Row from 'components/wrapper-elements/Row';
import { Copyright, Div, Span } from 'components/index';
import React from 'react'
import Link from 'next/link';
import { Call, Facebook, Home, InfoCircle, Instagram, Location, Mobile, NoteText, Send2, Sms, Whatsapp } from 'iconsax-react';


export default function FooterLayout({...props }) {
  return (
    <>
      <Footer {...props} className='mb-24'>

        <div className='dark:bg-slate-800 dark:text-white  bg-slate-100  text-black h-auto py-8 '>

        <Row className='px-10 gap-4'>
          <div className='md:col-span-4 col-span-12'>
            <ListSetup className='gap-4' alignItems='start' direction='col' justifyContent='start'  >
              <div className='font-thin text-3xl mt-5'>
                Address
              </div>
              <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-[-18px]'></Span>

              <ListSetup direction='col' justifyContent='start' alignItems='start'>
                <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                  <Location size="20" color="#FF8A65" />
                  <div className='text-lg'>
                    Location
                  </div>
                </ListSetup>
                <span className='text-sm'>
                  description dolores autdolore veritatis porro
                </span>
              </ListSetup>
              <ListSetup direction='col' justifyContent='start' alignItems='start'>
                <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                  <Sms size="20" color="#FF8A65" />
                  <div className='text-lg'>
                    E-mail
                  </div>
                </ListSetup>
                <span className='text-sm'>
                  textemail@yahoo.com
                </span>
              </ListSetup>
              <ListSetup direction='col' justifyContent='start' alignItems='start'>
                <ListSetup direction='row' justifyContent='start' alignItems='center' className='gap-2'>
                  <Call size="20" color="#FF8A65" />
                  <div className='text-lg'>
                    Telephone
                  </div>
                </ListSetup>
                <span className='text-sm'>
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

              <Link href={`/en`} className='flex flex-row items-center gap-2'>
                <Home size="20" />
                Home
              </Link>
              <Link href={`/en`} className='flex flex-row items-center gap-2'>
                <InfoCircle size="20" />
                About
              </Link>
              <Link href={`/en`} className='flex flex-row items-center gap-2'>
                <NoteText size="20" />
                Contact us
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
        <div className='px-10 gap-2 mt-8 flex flex-row-reverse '>
          <Span>
            - Social Media 
          </Span>
          <ListSetup alignItems='center' justifyContent='start' direction='row' className='gap-2'>
            <div className='cursor-pointer'>
              <Instagram size="20" color="#FF8A65" />
            </div>
            <div className='cursor-pointer'>
              <Whatsapp size="20" color="#FF8A65" />
            </div>
            <div className='cursor-pointer'>
              <Send2 size="20" color="#FF8A65" />
            </div>
            <div className='cursor-pointer'>
              <Facebook size="20" color="#FF8A65" />
            </div>
          </ListSetup>
        </div>
        </div>
      <Copyright />
      </Footer>

    </>
  )
}
