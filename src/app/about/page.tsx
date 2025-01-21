
'use client'
import React from 'react'
import { motion } from 'motion/react';
import { MainLayout, Span } from 'components';
import Image from 'next/image';
import { InfoCircle, MoreSquare } from 'iconsax-react';
import { fadeAnime, introduceitemVariants, introduceVariants, photoAnime } from 'config/animation';

export default function About() {

  return (
    <>
      <MainLayout>
        <motion.div className='flex flex-col md:flex-row  gap-4 items-start justify-between mb-6 mx-10 mt-10'>
          <motion.div initial="hidden"
            animate="show"
            variants={photoAnime} >
            <Image src={'/coffee.jpg'} alt='coffee' width={500} height={300} className='rounded-3xl shadow-lg' />
          </motion.div>

          <motion.div initial="closed"
            animate="open"
            variants={introduceVariants} className='w-full bg-miniBackground h-fit md:h-[355px] rounded-3xl shadow-lg p-10 flex flex-col items-start justify-start'>
            <motion.div variants={introduceitemVariants} className='font-thin text-3xl mt-5 flex flex-row gap-2 items-center justify-start'>
              <InfoCircle size="30" className='text-iconColor' />
              About us
            </motion.div>
            <motion.div variants={introduceitemVariants} className='w-full h-[2px] bg-iconColor mt-[0px]'></motion.div>

            <motion.div variants={introduceitemVariants} className='mt-6'>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis, neque eius assumenda nisi enim fugit modi aliquam nemo at cupiditate doloribus! Quae soluta error commodi temporibus maiores eos ad omnis.
            </motion.div>

          </motion.div>
        </motion.div>

        <motion.div variants={fadeAnime}
          initial="hidden"
          animate="show" className='mx-10 bg-miniBackground hi-fit p-5 my-4 rounded-3xl shadow-lg'>
          <motion.div className='font-thin text-3xl mt-5 flex flex-row gap-2 items-center justify-start'>
            <MoreSquare size="30" className='text-iconColor' />
            More Content
          </motion.div>
          <motion.div className='w-full h-[2px] bg-iconColor mt-[0px]'></motion.div>

          <motion.div className='mt-6'>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis, neque eius assumenda nisi enim fugit modi aliquam nemo at cupiditate doloribus! Quae soluta error commodi temporibus maiores eos ad omnis.
          </motion.div>

        </motion.div>
      </MainLayout>
    </>

  )
}
