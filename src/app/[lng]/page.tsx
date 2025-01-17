
'use client';
import React from 'react';
import { MainLayout, ProgressItems, SlideShow } from "components";
// import { Button } from "components/pure-elements/button";
// import { useFetch } from "hooks/useFetch";
// import { useLanguageClient } from "hooks/useLanguageClient";
// import { useState } from "react";
// import { PostService } from "services/post.service";
// import { motion } from 'motion/react';
// import Image from "next/image";
// import { useScroll } from "hooks/useScroll";
import Carousel from "components/pure-elements/carousel-slider";
// import { useTheme } from "next-themes";
// import { MessageQuestion } from "iconsax-react";
import Introduce from 'components/specific_elements/main-page/introduce';
import ThreeElement from 'components/specific_elements/main-page/three-element';


// const post = new PostService()

const Login = ({ params: { lng } }: any) => {
    // const { t } = useLanguageClient(lng, 'auth');
    // const [test] = useState<boolean>(false)
    // const [test2] = useState<boolean>(false);
    // const { theme } = useTheme()

    // const { loading, error } = useFetch<any>({
    //     service: post.create.bind(post),
    //     options: {
    //         headers: {
    //             'Token': 'b Tokkkkkkkk',
    //             'ds': `${test}`
    //         },
    //         body: { name: `${test2}`, age: 30 },
    //     }
    // })


    // const { data: dataPost } = useFetch<any>({
    //     service: post.read.bind(post),
    //     options: {
    //         headers: {
    //             'tto': 'ertetr'
    //         },
    //         body: {
    //             bg: 'sdas'
    //         }
    //     }
    // })










    return (
        <>
            <MainLayout className='overflow-x-hidden'>

                <Introduce />

                <ThreeElement />

                {/* desktop */}
                <Carousel />

                {/* mobile */}
                <SlideShow />




                {/* <div className='mt-64 flex flex-row gap-2 px-10'>
                    <div className='w-2/5'>
                        <Image width={500} height={200} src={'/theme.png'} alt="image cover" className="rounded-3xl shadow-lg" />
                    </div>

                    <div className='flex flex-col gap-4 w-3/5'>
                        <div className='flex flex-row gap-2 items-center mt-4 w-full'>
                            <span>
                                <MessageQuestion size="25" className="text-iconColor" />
                            </span>
                            <span className="font-thin text-2xl text-black dark:text-white">
                                Who we are ?
                            </span>
                        </div>
                        <Span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-0 mb-2'></Span>
                        <div className="mb-1 text-justify text-black dark:text-white">
                            At Brainwave Education, we specialize in creating inspiring and imaginative stories for children.
                            Our mission is to spark creativity and nurture young minds by
                            providing engaging content that encourages learning and exploration.
                            We believe every story has the power to shape a brighter future.
                        </div>

                    </div>
                </div> */}

                <ProgressItems />

                {/* {t("signIn")} */}

                {/* <div>
                    {loading && <>... loading </>}
                    {dataPost?.map((item: any) => {
                        return (
                            <>
                                {item.title}
                            </>
                        )
                    })}
                    {error && <> Error </>}
                </div> */}

                {/* <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias sequi tempore tenetur ad harum culpa, recusandae dicta dignissimos voluptatibus voluptate accusamus corrupti minus hic atque explicabo laboriosam incidunt dolores nulla.
                </div> */}
            </MainLayout >
        </>

    );
};

export default Login;


