
'use client';
import React from 'react';
import { ProgressItems, SlideShow, Carousel, Introduce, ThreeElement, Span, OurTeam, WhoWeAre, TextSlider } from "components";
import Image from 'next/image';
import { MessageQuestion } from 'iconsax-react';
// import Carousel from "components/pure-elements/carousel-slider";
// import Introduce from 'components/specific_elements/main-page/introduce';
// import ThreeElement from 'components/specific_elements/main-page/three-element';
// import { Button } from "components/pure-elements/button";
// import { useFetch } from "hooks/useFetch";
// import { useLanguageClient } from "hooks/useLanguageClient";
// import { useState } from "react";
// import { PostService } from "services/post.service";
// import { motion } from 'motion/react';
// import Image from "next/image";
// import { useScroll } from "hooks/useScroll";
// import { useTheme } from "next-themes";
// import { MessageQuestion } from "iconsax-react";


// const post = new PostService()
// { params: { lng } }: any
const Login = () => {
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
            <div className='mx-0 lg:mx-10 lg:rounded-3xl shadow-lg  lg:mt-2  h-[98vh]  back-dark '>
                <div className='invisible'>
                    t
                </div>
                <div className='hidden lg:block'>
                    <ThreeElement />
                </div>

                <div className='flex flex-col gap-4 justify-center items-center lg:h-auto h-full'>
                    <TextSlider />

                </div>
            </div>


            <div className='lg:hidden block'>
                <ThreeElement />
            </div>

            <ProgressItems />


            <Introduce />
            {/* desktop */}
            <Carousel />

            {/* mobile */}
            <SlideShow />


            {/* <ProgressItems /> */}

            <WhoWeAre />

            <OurTeam />

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

        </>

    );
};

export default Login;


