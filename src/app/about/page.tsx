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

export default function About() {
  return (
    <motion.div id="brainWave" className={cn("pt-36 pb-0 px-5 xl:px-0")}>
      <motion.div className="flex flex-col lg:flex-row gap-8 items-center justify-center lg:items-start lg:justify-between mx-auto max-w-screen-xl px-5 xl:px-0">
        <motion.div
          initial="hidden"
          animate="show"
          variants={photoAnime}
          className="basis-auto lg:basis-1/3 flex justify-start"
        >
          <Image
            src={"/bg-about.jpg"}
            alt="about"
            width={300}
            height={500}
            className="rounded-3xl shadow-lg"
          />
        </motion.div>
        <motion.div
          initial="closed"
          animate="open"
          variants={introduceVariants}
          className="basis-auto lg:basis-2/3 w-full h-fit flex flex-col items-start justify-start my-auto"
        >
          <motion.div
            variants={introduceitemVariants}
            className="font-bold text-5xl text-black mt-5 flex flex-row gap-2 items-center justify-start"
          >
            Who we are
          </motion.div>

          {/* <motion.div
            variants={introduceitemVariants}
            className="w-full h-[2px] bg-iconColor mt-[0px]"
          ></motion.div> */}

          <motion.div
            variants={introduceitemVariants}
            className="mt-6 font-medium text-base text-[#333333]"
          >
            📘 Who We Are At BrainWave, we are a passionate team of educators,
            engineers, and designers united by a shared mission: to make early
            learning joyful, inclusive, and future-ready. We specialize in
            creating interactive app-based books and robotics programs for
            children ages 3 to 9, combining cognitive development theories with
            playful technology. Our work is driven by curiosity, research, and a
            deep belief in every child’s potential to thrive when supported by
            the right tools. Whether through a story that comes alive on a
            tablet or a robot that teaches coding through play, we are committed
            to helping young learners build confidence, creativity, and core
            skills that last a lifetime.
          </motion.div>
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
  );
}
