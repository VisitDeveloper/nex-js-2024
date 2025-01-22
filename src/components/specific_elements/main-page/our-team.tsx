import ListSetup from 'components/wrapper-elements/ListSetup'
import { useScroll } from 'hooks/useScroll';
import { Facebook, Instagram, Send2, Whatsapp } from 'iconsax-react'
import Image from 'next/image'
import React from 'react'
import { motion } from 'motion/react'
import { ThreeElementitemVariants, threeElementsVariants } from 'config/animation';

export default function OurTeam() {
    const [element, controls] = useScroll();
    return (
        <motion.div
            variants={threeElementsVariants}
            animate={controls}
            initial="hidden"
            ref={element}
            className='flex flex-col gap-2 items-center justify-center bg-miniBackground mx-10 my-20 rounded-3xl shadow-lg'>
            <div className='p-5 font-thin text-2xl text-black dark:text-white'>
                Our <span className='text-iconColor font-bold'>Team</span>
            </div>

            <div className='flex flex-col lg:flex-row gap-4 justify-center items-center w-11/12 mx-10 p-5 '>
                {/* border-2 border-solid border-iconColor */}
                <motion.div variants={ThreeElementitemVariants} className='shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center'>
                    <div className='avatar'>
                        <Image width={80} height={80} className="size-20 rounded" src={'/coffee.jpg'} alt="Medium avatar" />

                    </div>
                    <div className='font-bold'>
                        Atousa
                    </div>
                    <div className='font-bold'>
                        Business
                    </div>
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

                </motion.div>
                <motion.div variants={ThreeElementitemVariants} className='shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center'>
                    <div className='avatar'>
                        <Image width={80} height={80} className="size-20 rounded" src={'/coffee.jpg'} alt="Medium avatar" />

                    </div>
                    <div className='font-bold'>
                        Iman
                    </div>
                    <div className='font-bold'>
                        Marketing
                    </div>
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

                </motion.div>
                <motion.div variants={ThreeElementitemVariants} className='shadow-lg rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center'>
                    <div className='avatar'>
                        <Image width={80} height={80} className="size-20 rounded" src={'/coffee.jpg'} alt="Medium avatar" />

                    </div>
                    <div className='font-bold'>
                        Amirali
                    </div>
                    <div className='font-bold'>
                        Engineer
                    </div>
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

                </motion.div>
                <motion.div variants={ThreeElementitemVariants} className='shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center'>
                    <div className='avatar'>
                        <Image width={80} height={80} className="size-20 rounded" src={'/coffee.jpg'} alt="Medium avatar" />

                    </div>
                    <div className='font-bold'>
                        Kamran
                    </div>
                    <div className='font-bold'>
                        Engineer
                    </div>
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

                </motion.div>
            </div>
        </motion.div>
    )
}
