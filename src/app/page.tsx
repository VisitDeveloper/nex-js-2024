"use client";

import {
  AppSlider,
  Hero,
  NewsSlider,
  Newsletter,
  ParentFeedback,
} from "components";

import KnowMore from "components/specific_elements/main-page/know-more";
import OurProgram from "components/specific_elements/main-page/our-program";
import React from "react";
import { cn } from "lib/utils";

// import Image from 'next/image';
// import { MessageQuestion } from 'iconsax-react';
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

  // const postrequest = async () => {
  //     try {
  //         const data = await post.read()
  //     } catch (error) {

  //     }

  // }

  return (
    <>
      <Hero />

      <div
        className={cn(
          "h-full flex flex-col justify-center items-center w-full lg:max-w-screen-2xl gap-8 py-32 mx-auto"
        )}
      >
        <div
          className={cn(
            "px-5 2xl:px-0",
            "flex flex-col justify-center items-center gap-8 mx-auto"
          )}
        >
          <h2 className="font-bold text-5xl">Our Programs</h2>
          <p className="max-w-screen-sm text-xl text-center">
            Our multi-level kindergarten cater to the age groups 2-5 years with
            a curriculum focussing children.
          </p>
        </div>

        <div className="w-full">
          <AppSlider />
        </div>
      </div>

      <OurProgram />

      <KnowMore />

      <ParentFeedback />

      <NewsSlider />

      <Newsletter />

      {/* <div className="mx-0 lg:mx-10 lg:rounded-3xl shadow-lg lg:mt-2 h-[98vh] back-dark">
        <div className="invisible">t</div>
        <div className="hidden lg:block">
          <ThreeElement />
        </div>

        <div className="flex flex-col gap-4 justify-center items-center lg:h-auto h-full">
          <TextSlider />
        </div>
      </div>

      <div className="lg:hidden block">
        <ThreeElement />
      </div> */}

      {/* <ProgressItems /> */}

      {/* <Introduce /> */}
      {/* desktop */}
      {/* <Carousel /> */}

      {/* mobile */}
      {/* <SlideShow /> */}

      {/* <ProgressItems /> */}

      {/* <WhoWeAre />


            <ProgressItems />
      <OurTeam /> */}

      {/* {t("signIn")} */}

      {/* 
      <div>
      {loading && <>... loading </>}
      {dataPost?.map((item: any) => {
            return (
                <>{item.title}</>
            )
        })}
        {error && <> Error </>}
        </div>
        */}

      {/* <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias sequi tempore tenetur ad harum culpa, recusandae dicta dignissimos voluptatibus voluptate accusamus corrupti minus hic atque explicabo laboriosam incidunt dolores nulla.</div> */}
    </>
  );
};

export default Login;
