'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { motion } from 'motion/react'
import { fadeAnime } from 'config/animation'

export default function NotFound() {
    return (
        <motion.div variants={fadeAnime}
            initial="hidden"
            animate="show" className='bg-miniBackground my-10 mx-10 rounded-3xl shadow-lg flex flex-col justify-center gap-2 px-4'>
            <h1 className="text-4xl text-center mt-10">404 Not found</h1>
            <Image src={'/not.png'} alt='not-found image ' width={300} height={200} className='mx-auto' />
            <h1 className="text-3xl text-center my-3">I have bad news for you</h1>
            <p className='text-lg text-center'>The page you are looking for might be removed or is temporarily unavailable</p>
            <Link href="/" className='p-2 mb-10 mx-auto border-solid border-[1px] border-iconColor bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'>Return Home</Link>
        </motion.div>
    )
}
