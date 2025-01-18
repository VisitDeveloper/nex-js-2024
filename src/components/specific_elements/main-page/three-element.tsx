'use client'
import React from 'react'
import { motion } from 'motion/react'
import { threeElementsVariants, ThreeElementitemVariants } from 'config/animation'
import { Div, H1, P, Span } from 'components';
import { useScroll } from 'hooks/useScroll';
import { MessageQuestion } from 'iconsax-react';
import { Typewriter } from 'react-simple-typewriter';
import { useTheme } from 'next-themes';

export default function ThreeElement() {
    const [element2, controls2] = useScroll();
    const { theme } = useTheme()

    return (
        <div className='md:mx-10 '>
            <motion.div
                variants={threeElementsVariants}
                ref={element2}
                initial="hidden"
                animate={controls2}
                className="grid grid-cols-12 gap-10 items-center justify-between mt-28 w-[90%] md:w-full mx-auto">

                <motion.div
                    variants={ThreeElementitemVariants}
                    className="w-[92%] ml-0 lg:w-full mx-auto shadow-lg bg-miniBackground dark:bg-darkBackground col-span-12 lg:col-span-4 px-5 py-5 my-4 rounded-3xl h-[202px]">
                    <Div
                        id="slideset1"
                    >
                        <Div>
                            <div className='font-thin text-lg'>
                                Address
                            </div>
                            <Span className='w-full h-[2px] dark:bg-slate-700  bg-red-600 '></Span>
                            <P className="mt-[5px] text-xs dark:text-textDark text-textLight text-justify">
                                Javascript , Typescript
                            </P>
                            <H1 className="text-lg mt-2">Soft Skills</H1>
                            <P className="mt-[5px] text-xs dark:text-textDark text-textLight text-justify">
                                Teamwork communication, Problem Solving, Professional Ethics,
                                Time Management, Stress Management, Adaptability, Leadership
                            </P>
                        </Div>
                        <Div>
                            <H1 className="text-lg">Tools and Frameworks</H1>
                            <P className="mt-[15px] text-xs dark:text-textDark text-textLight text-justify">
                                React.js , Next.js , Angular , React Native , Redux Zustand ,
                                Storybook , Less , Sass , Styled-component , Tailwind-css , Ant
                                , MUI , Bootstrap , CSS Module , Semantice UI , HighCharts ,
                                React Hook Form , Formik , Yup , Zod , i18next , Vite , Git ,
                                GitFlow , RTKQ , Context API , GraphQl , useQuery , RTL
                            </P>
                        </Div>
                        <Div>
                            <H1 className="text-lg mt-1">Engineering</H1>
                            <P className="mt-[15px] text-xs dark:text-textDark text-textLight text-justify">
                                SOLID Principle, Design Patterns, Web Services (RESTful), Agile
                                Principles and Scrum Methodology
                            </P>
                        </Div>
                    </Div>
                </motion.div>

                {/* <motion.div variants={ThreeElementitemVariants}
                    className="w-[92%] ml-0 lg:w-full mx-auto  shadow-lg flex flex-col bg-miniBackground dark:bg-darkBackground col-span-12 lg:col-span-4 my-5y px-5 py-2 rounded-3xl h-[202px]">
                    <div className='flex flex-row gap-2 items-center mt-4'>
                        <span>
                            <MessageQuestion size="25" className="text-iconColor" />
                        </span>
                        <span className="font-thin text-2xl ">
                            Who are we?
                        </span>

                    </div>
                    <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-0 mb-2'></Span>
                    <div className="mb-1 text-justify hyphens-auto	break-words">
                        At Brainwave Education, we specialize in creating inspiring and imaginative stories for children.
                        Our mission is to spark creativity and nurture young minds by

                    </div>
                </motion.div> */}

                <motion.div variants={ThreeElementitemVariants}
                    className="w-[92%] ml-0 lg:w-full mx-auto  shadow-lg items-center justify-center flex flex-row text-2xl text-iconColor bg-miniBackground col-span-12 lg:col-span-4 my-4 px-5 py-5 rounded-3xl h-[202px]">
                    <Typewriter
                        words={["Brainwave Education",
                            "Imagination Unleashed for Every Child.",
                            "Creating Stories, Shaping Futures.",
                            "Fueling Young Dreams with Every Tale.",
                            "Building a Brighter Tomorrow Through Stories."
                        ]}
                        loop={0}
                        cursor
                        cursorStyle="|"
                        typeSpeed={100}
                        deleteSpeed={50}
                        delaySpeed={1000}
                        cursorBlinking={true}
                        cursorColor={`${theme === 'dark' ? '#2fe99f' : '#ff8a66'}`}
                    />
                </motion.div>
            </motion.div>
        </div>
    )
}
