'use client'
import React from 'react'
import { motion } from 'motion/react'
import { Hierarchy } from 'iconsax-react'
import { LeftHalfContact, RightHalfContact } from 'components'



export default function ContactUs() {

    return (
        <div className='mx-5 my-10 p-5 flex flex-col md:flex-row items-start justify-between  gap-4 mt-[100px]'>
            <LeftHalfContact />
            <RightHalfContact />
        </div>
    )
}
