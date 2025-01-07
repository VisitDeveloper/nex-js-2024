
'use client';
import React from 'react';
import { Div, H1, ListSetup, MainLayout, P, Span } from "components";
import { Button } from "components/pure-elements/button";
import { useFetch } from "hooks/useFetch";
import { useLanguageClient } from "hooks/useLanguageClient";
import { useState } from "react";
import { PostService } from "services/post.service";
import { motion } from 'motion/react';
import { fadeAnime, photoAnime } from "config/animation";
import Image from "next/image";
import { useScroll } from "hooks/useScroll";
import Carousel from "components/pure-elements/carousel-slider";
import { Typewriter } from "react-simple-typewriter";
import { useTheme } from "next-themes";
import { MessageQuestion } from "iconsax-react";


const post = new PostService()

const Login = ({ params: { lng } }: any) => {
    const { t } = useLanguageClient(lng, 'auth');
    const [test] = useState<boolean>(false)
    const [test2] = useState<boolean>(false);
    const { theme } = useTheme()

    const { loading, error } = useFetch<any>({
        service: post.create.bind(post),
        options: {
            headers: {
                'Token': 'b Tokkkkkkkk',
                'ds': `${test}`
            },
            body: { name: `${test2}`, age: 30 },
        }
    })


    const { data: dataPost } = useFetch<any>({
        service: post.read.bind(post),
        options: {
            headers: {
                'tto': 'ertetr'
            },
            body: {
                bg: 'sdas'
            }
        }
    })






    const [element, controls] = useScroll();
    const [element2, controls2] = useScroll();


    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3, // زمان‌بندی برای نمایش هر آیتم
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    return (
        <>
            <MainLayout>

                <ListSetup alignItems="center" direction="row" justifyContent="between" className="gap-4 px-9">
                    <motion.div
                        initial="closed"
                        animate="open"
                        variants={containerVariants}
                        className="overflow-hidden leading-5 flex flex-col gap-2"
                    >
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            Unlock the Power of Learning,
                        </motion.h2>
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            Shape the Future with
                        </motion.h2>
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            <span className="text-iconColor">Brainwave Education</span>
                        </motion.h2>

                        <motion.p variants={fadeAnime}
                            initial="hidden"
                            animate="show"
                        >Contact us for any programming or project ideas you have. Our team of professionals is ready to bring your vision to life with exceptional skills.
                        </motion.p>

                        <motion.div className="pl-3 mb-10 w-[100px]" whileTap={{
                            scale: 1.1
                        }}>
                            <Button variant={"secondary"} size={"sm"}> Contact</Button>
                        </motion.div>





                    </motion.div>

                    <motion.div initial="hidden"
                        animate="show"
                        variants={photoAnime}>

                        <Image width={700} height={500} src={'/theme.png'} alt="image cover" className="rounded-3xl shadow-lg" />
                    </motion.div>

                </ListSetup>


                <motion.div
                    variants={containerVariants}
                    ref={element2}
                    initial="hidden"
                    animate={controls2}
                    className="flex flex-row gap-10 items-center justify-between w-full px-10 mt-20">
                    <motion.div
                        variants={itemVariants}
                        className="w-full shadow-lg bg-miniBackground dark:bg-darkBackground px-5 py-5 my-4 rounded-3xl h-[202px]">
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

                    <motion.div variants={itemVariants} className="w-full shadow-lg flex flex-col bg-miniBackground dark:bg-darkBackground my-5y px-5 py-2 rounded-3xl ">
                        <div className='flex flex-row gap-2 items-center mt-4'>
                            <span>
                                <MessageQuestion size="25" className="text-iconColor" />
                            </span>
                            <span className="font-thin text-2xl ">
                                Who we are ?
                            </span>

                        </div>
                        <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-0 mb-2'></Span>
                        <div className="mb-1">
                            At Brainwave Education, we specialize in creating inspiring and imaginative stories for children.
                            Our mission is to spark creativity and nurture young minds by
                            providing engaging content that encourages learning and exploration.
                            We believe every story has the power to shape a brighter future.
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="w-full shadow-lg items-center justify-center flex flex-row text-2xl text-iconColor bg-miniBackground my-4 px-5 py-5 rounded-3xl h-[202px]">
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


                <Carousel />

                <motion.div
                    variants={fadeAnime}
                    animate={controls}
                    initial="hidden"
                    className="flex flex-row gap-4 bg-black mt-60"
                    ref={element}>
                    <div className="size-72"></div>
                    <div className="size-72"></div>
                    <div className="size-72"></div>
                </motion.div>
                {t("signIn")}
                <div>
                    {loading && <>... loading </>}
                    {dataPost?.map((item: any) => {
                        return (
                            <>
                                {item.title}
                            </>
                        )
                    })}
                    {error && <> Error </>}
                </div>
            </MainLayout >
        </>

    );
};

export default Login;


