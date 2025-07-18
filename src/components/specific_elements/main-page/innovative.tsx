"use client";

import { InfoCircle, MoreSquare } from "iconsax-react";
import { MainLayout, Span } from "components";
import {
  fadeAnime,
  introduceVariants,
  introduceitemVariants,
  photoAnime,
} from "config/animation";
import { cn } from "lib/utils";
import Image from "next/image";
import React from "react";
import { motion } from "motion/react";

export default function Innovative() {
  return (
    <motion.div id="innovativeApproach" className={cn("pt-36 px-5 xl:px-0")}>
      {" "}
      <motion.div
        id="innovativeApproach"
        className={cn(
          "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] relative flex justify-center items-center gap-12 py-12"
        )}
      >
        <motion.div
          className={cn(
            "px-5 py-12 xl:px-0 flex flex-col lg:flex-row gap-8 items-center justify-center lg:items-start lg:justify-between mx-auto max-w-screen-xl px-5 xl:px-0"
          )}
        >
          <motion.div
            initial="closed"
            animate="open"
            variants={introduceVariants}
            className="basis-auto lg:basis-1/2 w-full h-fit flex flex-col items-start justify-start my-auto"
          >
            <motion.div
              variants={introduceitemVariants}
              className="font-bold text-5xl text-black mt-5 flex flex-row gap-2 items-center justify-start"
            >
              Mission Statement{" "}
            </motion.div>

            {/* <motion.div
            variants={introduceitemVariants}
            className="w-full h-[2px] bg-iconColor mt-[0px]"
          ></motion.div> */}

            <motion.div
              variants={introduceitemVariants}
              className="mt-6 font-medium text-base text-[#333333]"
            >
              🎯 Our mission is to unlock the cognitive and creative potential
              of young children through innovative educational technology. We
              aim to provide developmentally appropriate, accessible, and
              research-based learning tools—such as app-based storybooks,
              dyslexia-friendly features, and beginner robotics—that nurture
              literacy, critical thinking, and computational skills. At the
              heart of BrainWave is a commitment to equity and engagement: we
              believe every child deserves to explore, question, and grow in a
              learning environment that is as playful as it is powerful.
            </motion.div>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={photoAnime}
            className="basis-auto lg:basis-1/2 flex justify-end"
          >
            <Image
              src={"/robo-kids.jpg"}
              alt="innovative Approach"
              width={500}
              height={500}
              className="rounded-3xl shadow-lg"
            />
          </motion.div>
        </motion.div>

        {/* <motion.div variants={fadeAnime}
        initial="hidden"
        animate="show" className='mx-10 bg-miniBackground hi-fit p-5 my-4 rounded-3xl shadow-lg'>
        <motion.div className='font-thin text-3xl mt-5 flex flex-row gap-2 items-center justify-start'>
          <MoreSquare size="30" className='text-iconColor' />
          More Content
        </motion.div>
        <motion.div className='w-full h-[2px] bg-iconColor mt-[0px]'></motion.div>

        <motion.div className='mt-6'>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis, neque eius assumenda nisi enim fugit modi aliquam nemo at cupiditate doloribus! Quae soluta error commodi temporibus maiores eos ad omnis.
        </motion.div>

      </motion.div> */}
      </motion.div>
    </motion.div>
  );
}
