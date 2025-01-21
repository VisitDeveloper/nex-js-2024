import React from 'react'
import { motion } from 'motion/react'
import { Hierarchy } from 'iconsax-react'
import ContactForm from './contact-form'


export default function LeftHalf() {
    return (
        <>
            <div className='rounded-3xl shadow-lg bg-miniBackground w-full md:w-1/2 p-4'>
                <motion.div className='font-thin text-3xl mt-5 flex flex-row gap-2 items-center justify-start'>
                    <Hierarchy size="30" className='text-iconColor' />
                    Communicaton channel
                </motion.div>
                <motion.div className='w-full h-[2px] bg-iconColor mt-[0px]'></motion.div>
                <div className='mt-5 flex flex-col gap-6'>
                    <ContactForm/>
                </div>
            </div>
        </>
    )
}
