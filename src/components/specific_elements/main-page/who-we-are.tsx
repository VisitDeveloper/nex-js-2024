import { MessageQuestion } from 'iconsax-react'
import { Span } from 'components'
import Image from 'next/image'
import React from 'react'
import { useScroll } from 'hooks/useScroll';
import { motion } from 'motion/react'
import { fadeAnime, introduceitemVariants, photoAnime, threeElementsVariants } from 'config/animation';

export default function WhoWeAre() {
    const [element, controls] = useScroll();

    return (
        <motion.div variants={fadeAnime} initial="hidden" animate={controls} ref={element} className='mt-20 flex flex-col lg:flex-row gap-4 px-10 bg-miniBackground mx-10 rounded-3xl shadow-lg p-4'>
            <motion.div variants={photoAnime} initial="hidden"
                animate="show" className='w-full lg:w-2/5'>
                <Image width={500} height={200} src={'/theme.png'} alt="image cover" className="rounded-3xl shadow-lg" />
            </motion.div>

            <motion.div className='flex flex-col gap-4 w-full lg:w-3/5'>
                <div className='flex flex-row gap-2 items-center mt-4 w-full'>
                    <span>
                        <MessageQuestion size="25" className="text-iconColor" />
                    </span>
                    <span className="font-thin text-2xl text-black dark:text-white">
                        Who we are ?
                    </span>
                </div>
                <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-0 mb-2'></Span>
                <div className="mb-1 text-justify text-black dark:text-white hyphens-auto break-words">
                    At Brainwave Education, we specialize in creating inspiring and imaginative stories for children.
                    Our mission is to spark creativity and nurture young minds by
                    providing engaging content that encourages learning and exploration.
                    We believe every story has the power to shape a brighter future.
                </div>

            </motion.div>
        </motion.div>
    )
}
