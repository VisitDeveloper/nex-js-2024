
'use client'
import { Button, Input } from 'components'
import Image from 'next/image'
import React from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "components/pure-elements/select"
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerTrigger } from 'components/pure-elements/drawer'
import { Apple, GooglePlay } from 'iconsax-react'
import Link from 'next/link';

import { useTheme } from 'next-themes'

export default function Application() {
  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const { theme } = useTheme()
  return (
    <div className=' mt-[100px] mb-20 '>
      <form className='mb-10 mx-10 flex flex-col sm:flex-row gap-2 items-center bg-miniBackground rounded-3xl  p-4'>
        <div className='w-full sm:w-3/4 flex flex-row gap-2 items-center'>
          <div className='sm:w-2/4 w-full'>
            <Input placeholder='Search' type='search' />
          </div>
          <div className='w-2/4'>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Action</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='w-full sm:w-1/4 flex flex-row-reverse items-center sm:justify-start justify-between gap-2'>
          <Button variant={"secondary"} size={"sm"} className='w-fit'> Search</Button>
          <div className='flex gap-2'>
            <span>
              row
            </span>
            <span>
              col
            </span>
          </div>
        </div>
      </form>
      <div className='flex flex-row gap-4 lg:justify-start lg:items-start justify-center items-center flex-wrap mx-10  ' >
        {testArray.map((item: number) => {
          return (
            <>
              <div className='bg-miniBackground shadow-lg rounded-3xl w-full sm:w-48 md:w-56 h-[250px] flex flex-col p-4'>
                <div className='avatar'>
                  <Image width={56} height={56} className="size-14 rounded" src={'/coffee.jpg'} alt="Medium avatar" />
                </div>
                <span className='text-2xl font-bold mt-1'>
                  Name {item}
                </span>
                <span className='text-justify  tracking-[-0.05rem] leading-4 mt-2' style={{ wordSpacing: '0px' }}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum laudantium temporibus quos.
                </span>
                <span className='flex flex-row-reverse mt-2'>
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary">Open Drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        {/* data {item} */}
                        <div className='flex flex-col justify-center items-center gap-2 h-[300px]'>
                          <div>
                            <Image width={56} height={56} className="size-14 rounded" src={'/coffee.jpg'} alt="Medium avatar" />
                          </div>
                          <div>
                            Name
                          </div>
                          <div className='flex flex-row gap-2 items-center justify-center '>

                            <Link href={'/'} className='flex flex-row gap-1 border-2 border-solid border-black dark:border-white rounded-lg p-1'>
                              <div>
                                <Apple size="50" className='dark:text-white text-black' />
                              </div>
                              <div className='flex flex-col gap-2 dark:text-white text-black'>
                                <span className='text-sm'>
                                  Download on the
                                </span>
                                <span className='text-lg'>
                                  Apple Store
                                </span>
                              </div>
                            </Link>

                            <Link href={'/'} className='flex flex-row gap-1 border-2 border-solid border-black dark:border-white rounded-lg p-1'>
                              <div>
                                <GooglePlay size="50" className='dark:text-white text-black' />
                              </div>
                              <div className='flex flex-col gap-2 dark:text-white text-black'>
                                <span className='text-sm'>
                                  GET IT ON
                                </span>
                                <span className='text-lg'>
                                  Google Play
                                </span>
                              </div>
                            </Link>

                          </div>
                        </div>
                        <DrawerFooter >
                          {/* <Button variant={'secondary'} className='w-full'>Submit</Button> */}
                          <DrawerClose asChild>
                            <Button variant="outline" className='w-full'>Close</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </span>
              </div>
            </>
          )
        })}
      </div>

    </div>
  )
}
