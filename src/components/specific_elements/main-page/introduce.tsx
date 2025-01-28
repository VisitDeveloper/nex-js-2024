'use client'
import { Button } from 'components'
import React from 'react'
import { motion } from 'motion/react'
import { introduceVariants, fadeAnime, introduceitemVariants, photoAnime, threeElementsVariants, ThreeElementitemVariants } from 'config/animation'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useScroll } from 'hooks/useScroll';

export default function Introduce() {
    const router = useRouter()
    const [element, controls] = useScroll()
    const [element2, controls2] = useScroll()
    // threeElementsVariants , ThreeElementitemVariants
    return (
        <>
            <div className='flex lg:flex-row flex-col-reverse items-center justify-between gap-4 mx-10 mt-10 
                    rounded-3xl shadow-lg bg-miniBackground p-3
            '>
                <motion.div
                    // animate="open"
                    // initial="closed"
                    // variants={introduceVariants}

                    variants={threeElementsVariants}
                    animate={controls}
                    initial="hidden"
                    ref={element}
                    className="overflow-hidden leading-5 flex flex-col gap-2 md:text-left text-center"
                >
                    <motion.h2 variants={ThreeElementitemVariants} className="text-3xl md:text-5xl">
                        Unlock the Power of Learning,
                    </motion.h2>
                    <motion.h2 variants={ThreeElementitemVariants} className="text-3xl md:text-5xl">
                        Shape the Future with
                    </motion.h2>
                    <motion.h2 variants={ThreeElementitemVariants} className="text-3xl md:text-5xl">
                        <span className="text-iconColor">Brainwave Education</span>
                    </motion.h2>

                    <motion.p
                        variants={ThreeElementitemVariants}
                        className="text-base md:text-lg"
                    >
                        Contact us for any programming or project ideas you have.
                        Our team of professionals is ready to bring your vision to life with exceptional skills.
                    </motion.p>

                    <motion.div className="pl-3 mb-10 w-[100px] m-auto md:ml-0" whileTap={{
                        scale: 1.1
                    }}>
                        <Button variant={"secondary"} size={"sm"} onClick={() => router.push('/contact-us')}> Contact</Button>
                    </motion.div>

                </motion.div>

                <motion.div
                    ref={element2}
                    initial="hidden"
                    animate={controls2}
                    variants={photoAnime}
                    className='mx-10'>

                    <Image width={700} height={500} src={'/theme.png'} alt="image cover" className="rounded-3xl shadow-lg " />
                </motion.div>
            </div>

        </>
    )
}
