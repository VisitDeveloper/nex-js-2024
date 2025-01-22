'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { threeElementsVariants, ThreeElementitemVariants } from 'config/animation'
import { Div, H1, P, Span } from 'components';
import { useScroll } from 'hooks/useScroll';
import { MessageQuestion } from 'iconsax-react';
import { Typewriter } from 'react-simple-typewriter';
import { useTheme } from 'next-themes';
import ReactTextTransition, { presets } from "react-text-transition";
import getRandomNumber from "tools/getRandomNumber";

export default function ThreeElement() {
    const [element2, controls2] = useScroll();
    const { theme } = useTheme()

    const texts = [
        "Mental",
        "Scalable",
        "Creative",
        "Special",
    ];

    const [textIndex, setTextIndex] = useState<number>(0);

    useEffect(() => {
        let interval = setInterval(() => {
            // setRandomIndex(getRandomNumber(0, numbers.length));
            setTextIndex(getRandomNumber(0, texts.length));
            // setParagraphIndex(getRandomNumber(0, paragraphs.length));
            // setTextFastIndex(getRandomNumber(0, paragraphs.length));
        }, 4000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div className='mt-10 lg:mt-20'>
            <motion.div variants={threeElementsVariants}
                animate={"show"}
                initial="hidden" className='lg:mx-5 mx-10 flex flex-col gap-4 lg:flex-row lg:gap-2 my-5 '>

                <motion.div variants={ThreeElementitemVariants} className='w-full rounded-3xl bg-miniBackground shadow-lg mx-1 h-[202px]'>
                    <Div id='slideset1'>
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

                <motion.div variants={ThreeElementitemVariants} className='w-full rounded-3xl bg-miniBackground shadow-lg mx-1 flex flw-row  gap-1 items-center justify-center h-[202px] px-2'>
                    <section className="inline">
                        Create
                        <ReactTextTransition
                            springConfig={presets.gentle}
                            style={{ margin: "0 6px" }}
                            className='text-iconColor font-bold'
                            inline
                        >
                            {texts[textIndex]}
                        </ReactTextTransition>
                        Innovation
                    </section>
                </motion.div>

                <motion.div variants={ThreeElementitemVariants} className='w-full rounded-3xl bg-miniBackground shadow-lg mx-1 items-center justify-center flex flex-row text-2xl text-iconColor h-[202px]'>
                    <Typewriter
                        words={["Brainwave Education",
                            "Imagination Unleashed for Every Child.",
                            "Creating Stories, Shaping Futures.",
                            "Fueling Young Dreams with Every Tale.",
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
