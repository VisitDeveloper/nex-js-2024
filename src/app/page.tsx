"use client";

import { AppSlider } from "components";
import Button from "components/elements/button";
import Image from "next/image";
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
      <div
        className={cn(
          "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] min-h-[calc(100dvh-80px-48px)] relative flex justify-center items-center gap-12",
          "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x bg-left before:w-full before:left-0 before:top-12 before:h-6"
        )}
      >
        <div className="h-full flex items-stretch w-full max-w-screen-2xl">
          <div className="basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
            <h5 className="font-semibold text-3xl text-[#1DC1B6]">
              Kindergarten Program
            </h5>
            <h1 className="font-bold text-black text-7xl">
              Best Children’s Education Curriculum
            </h1>
            <p className="font-medium text-base text-[#333333]">
              Admission Open 20-24 April
            </p>
            <div className="">
              <Button className="bg-[#FEA439] font-medium text-white rounded-full py-4 px-12">
                Apply Now
              </Button>
            </div>
          </div>
          <div className="basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
            <div className="relative aspect-square w-full max-w-screen-sm">
              <Image alt="hero" fill src="/hero-image.svg" />
            </div>
          </div>
        </div>
      </div>

      <div className="h-full flex flex-col justify-center items-center w-full max-w-screen-2xl gap-8 py-32 mx-auto">
        <h2 className="font-bold text-5xl">Our Programs</h2>
        <p className="max-w-screen-sm text-xl text-center">
          Our multi-level kindergarten cater to the age groups 2-5 years with a
          curriculum focussing children.
        </p>

        <div className="w-full">
          <AppSlider />
        </div>
      </div>

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
