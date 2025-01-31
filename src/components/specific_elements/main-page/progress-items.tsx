'use client'
import { useScroll } from 'hooks/useScroll';
import React from 'react'
import { motion } from 'motion/react'
import { ThreeElementitemVariants, threeElementsVariants } from 'config/animation';
import { MobileProgramming, Profile2User, Timer1, UserOctagon } from 'iconsax-react';
import CountUp from 'react-countup';

function ProgressItems() {
    const [element, controls] = useScroll();
    return (
        <motion.div
            variants={threeElementsVariants}
            animate={controls}
            initial="hidden"
            className="grid grid-cols-12 mx-10 mb-20 mt-20 rounded-3xl py-10 gap-4 justify-center items-center md:h-52 h-auto   text-black dark:text-white"
            ref={element}>
            <motion.div variants={ThreeElementitemVariants} className='flex flex-col gap-2 items-center col-span-12 md:col-span-3  bg-miniBackground  shadow-lg  py-5 rounded-3xl'>
                <div>
                    <Timer1 size="32" className='text-iconColor' />
                </div>
                <div className='font-bold text-xl'>Years Experience</div>
                <div>
                    <CountUp className='font-bold text-2xl' end={6} duration={7} />
                </div>

            </motion.div>
            <motion.div variants={ThreeElementitemVariants} className='flex flex-col gap-2 items-center col-span-12 md:col-span-3  bg-miniBackground  shadow-lg  py-5 rounded-3xl' >
                <div>
                    <Profile2User size="32" className='text-iconColor' />
                </div>
                <div className='font-bold text-xl'>Team Members</div>
                <div><CountUp className='font-bold text-2xl' end={12} duration={5} /></div>

            </motion.div>
            <motion.div variants={ThreeElementitemVariants} className='flex flex-col gap-2 items-center col-span-12 md:col-span-3  bg-miniBackground  shadow-lg  py-5 rounded-3xl'>
                <div>
                    <UserOctagon size="32" className='text-iconColor' />
                </div>
                <div className='font-bold text-xl'>Clients</div>
                <div><CountUp className='font-bold text-2xl' end={200} duration={10} /></div>

            </motion.div>
            <motion.div variants={ThreeElementitemVariants} className='flex flex-col gap-2 items-center col-span-12 md:col-span-3  bg-miniBackground  shadow-lg  py-5 rounded-3xl'>
                <div>
                    <MobileProgramming size="32" className='text-iconColor' />
                </div>
                <div className='font-bold text-xl'>Complete Project</div>
                <div><CountUp className='font-bold text-2xl' end={10} duration={10} /></div>

            </motion.div>
        </motion.div>
    )
}
export default ProgressItems