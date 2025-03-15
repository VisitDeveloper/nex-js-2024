"use client";

import { InfoCircle, MoreSquare } from "iconsax-react";
import { MainLayout, Span } from "components";
import {
  fadeAnime,
  introduceVariants,
  introduceitemVariants,
  photoAnime,
} from "config/animation";

import Image from "next/image";
import React from "react";
import { motion } from "motion/react";

export default function About() {
  return (
    <>
      <motion.div className="flex flex-col lg:flex-row gap-8 items-center justify-center lg:items-start lg:justify-between mx-auto my-16 max-w-screen-xl px-5 xl:px-0">
        <motion.div
          initial="closed"
          animate="open"
          variants={introduceVariants}
          className="basis-auto lg:basis-1/2 w-full h-fit flex flex-col items-start justify-start"
        >
          <motion.div
            variants={introduceitemVariants}
            className="font-bold text-black text-4xl mt-5 flex flex-row gap-2 items-center justify-start"
          >
            About us
          </motion.div>

          {/* <motion.div
            variants={introduceitemVariants}
            className="w-full h-[2px] bg-iconColor mt-[0px]"
          ></motion.div> */}

          <motion.div
            variants={introduceitemVariants}
            className="mt-6 font-medium text-base text-[#333333]"
          >
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Debitis,
            neque eius assumenda nisi enim fugit modi aliquam nemo at cupiditate
            doloribus! Quae soluta error commodi temporibus maiores eos ad
            omnis. Sit numquam illum. Repellendus distinctio expedita. Dolor
            consequatur sit. Ullam accusamus id perspiciatis inventore
            praesentium est dolor nam ducimus. Consequatur et sit quaerat
            explicabo eos exercitationem dolores suscipit. Exercitationem aut et
            velit officiis et vero optio. Aperiam a atque ad. Eum voluptatibus
            magnam quibusdam quia in quia ea eveniet. Beatae vel quisquam
            molestiae quae nihil corrupti earum et. Nihil placeat consequatur
            illo iste quidem incidunt. Sapiente est et praesentium quae est
            voluptatem debitis ea qui. Velit non quisquam tempore quae sit et.
            Animi eligendi nemo sunt cumque assumenda eveniet et quae. Ut sunt
            aut provident nostrum cupiditate. Nostrum in ea optio quis porro qui
            laboriosam corporis velit. Saepe non tempora aspernatur odio alias
            cum quos consequuntur harum.
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={photoAnime}
          className="basis-auto lg:basis-1/2 flex justify-center"
        >
          <Image
            src={"/bg-about.jpg"}
            alt="about"
            width={300}
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
    </>
  );
}
