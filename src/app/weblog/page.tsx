'use client'
import { Button, Input } from 'components'
import { Element3, RowVertical } from 'iconsax-react'
import React, { useEffect, useState } from 'react'

export default function Weblog() {

    const [listOrCardActivate, setListOrCardActivate] = useState<boolean>(false);
    useEffect(() => {
        console.log('listOrCardActivate', listOrCardActivate)
    }, [listOrCardActivate])

    return (
        <div className='mt-[100px] flex flex-row gap-4  mb-10 mx-10 '>
            <div className='w-1/3 sticky top-[100px] left-10 h-[500px] bg-miniBackground rounded-3xl shadow-lg px-4'>
                Search box
            </div>


            <div className='flex flex-col gap-4 w-2/3'>
                {/* upper search  */}
                <div className='flex flex-col rounded-3xl shadow-lg px-4 py-2 bg-miniBackground'>
                    <Input placeholder='Search' type='search' className='bg-itemFormBackground' />
                    <div className='flex flex-row gap-2 items-center'>
                        <div className='flex flex-row gap-1 mt-2'>
                            <span className={`${listOrCardActivate === false ? 'bg-itemFormBackground rounded-md' : ''} p-1 '`}
                                onClick={() => setListOrCardActivate(false)}>
                                <Element3 size="17" className='text-iconColor cursor-pointer ' />
                            </span>
                            <span className={`${listOrCardActivate === true ? 'bg-itemFormBackground rounded-md' : ''} p-1 '`} onClick={() => setListOrCardActivate(true)}>
                                <RowVertical size="17" className='text-iconColor cursor-pointer' />
                            </span>
                        </div>
                        <div className='flex flex-row items-center gap-1 mt-2 bg-itemFormBackground w-fit p-0 rounded-md'>
                            <span className='hover:bg-iconColor hover:text-white duration-500 hover:duration-500 cursor-pointer px-2 rounded-md'>
                                low
                            </span>
                            <span className='hover:bg-iconColor hover:text-white duration-500 hover:duration-500 cursor-pointer px-2 rounded-md'>
                                high
                            </span>

                        </div>
                    </div>
                </div>

                {/* content */}
                <div className='rounded-3xl shadow-lg px-4 py-2 bg-miniBackground'>

                    <div className={`${listOrCardActivate === true ? 'flex-col' : 'flex-row'} w-full flex`}>
                        <div>
                            item 1
                        </div>
                        <div>
                            item 1
                        </div>
                        <div>
                            item 1
                        </div>



                    </div>
                </div>
            </div>


        </div>
    )
}
