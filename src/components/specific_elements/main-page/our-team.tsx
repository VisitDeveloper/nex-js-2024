"use client";
import ListSetup from "components/wrapper-elements/ListSetup";
import { useScroll } from "hooks/useScroll";
import { Facebook, Instagram, Send2, Whatsapp } from "iconsax-react";
import Image from "next/image";
import React from "react";
import { motion } from "motion/react";
import {
  BookOpenText,
  Bot,
  GraduationCap,
  icons,
  UserRound,
} from "lucide-react";
import {
  ThreeElementitemVariants,
  threeElementsVariants,
  introduceitemVariants,
} from "config/animation";
import { cn } from "lib/utils";

const teams = [
  {
    src: "",
    name: "Atousa Hatami",
    title: "Hardware Engineer & Robotics Instructor",
    description:
      "Atousa is a biomedical and electronics engineer with deep expertise in educational robotics and medical device systems. At BrainWave, she leads the design, prototyping, and calibration of our intelligent robots, ensuring they’re both engaging and developmentally appropriate for young learners. With prior experience teaching robotics at FIRA RoboSchool and designing AI-integrated tools for healthcare and education, Atousa brings a rare blend of technical rigor and child-centered design to every project.",
    link: "/#",
  },
  {
    src: "",
    name: "Mohammad Shahabi pour",
    title: "Lead Software Engineer & Web Architect",
    description:
      "With over 11 years of experience in frontend development and full-stack engineering, Mohammad is the mastermind behind BrainWave’s interactive  learning platform. He specializes in crafting seamless, high-performance digital environments using React, Vue, and Node.js. His commitment to scalability, performance optimization, and elegant user experiences ensures that our app-based books and educational tools function smoothly across all devices. Mohammad also mentors junior developers and ensures our engineering practices meet modern standards of excellence.",
    link: "/#",
  },
  {
    src: "",
    name: "Ali Ravari",
    title: "Robotics Curriculum Developer & Robotics Trainer",
    description:
      "Ali is an experienced robotics instructor and educational content developer who has designed and delivered hands-on programming courses for children and teens. He co-leads the robotics initiative at BrainWave, contributing to both hardware prototyping and the design of child-friendly learning experiences. With a focus on Arduino-based robotics, sensory integration, and project-based learning, Ali ensures our robotics kits and modules foster critical thinking, creativity, and curiosity in every learner",
    link: "/#",
  },
  {
    src: "",
    name: "AmirAli Hatami",
    title: "App-Based Literacy Designer & UX Developer",
    description:
      "AmirAli specializes in developing app-based books that spark imagination while supporting literacy growth in children ages 3 to 9. As a UX-oriented developer, he collaborates closely with educators to ensure that each digital storybook is engaging, accessible, and developmentally aligned. His work bridges storytelling and interactivity, using design thinking and educational psychology to help children explore language, meaning, and self-expression through technology.",
    link: "/#",
  },
];

const leftMap: any = {
  0: "left-0",
  1: "lg:left-[5rem] lg:w-[calc(100%-5rem)]",
  2: "lg:left-[10rem] lg:w-[calc(100%-10rem)]",
  3: "lg:left-[15rem] lg:w-[calc(100%-15rem)]",
};

export default function OurTeam() {
  const [element, controls] = useScroll();
  return (
    <motion.div
      variants={threeElementsVariants}
      animate={controls}
      ref={element}
      className={cn(
        "px-5 xl:px-0",
        "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] relative flex justify-center items-center gap-12 py-12 flex flex-col "
      )}
    >
      <motion.div
        variants={introduceitemVariants}
        className="font-bold text-5xl text-black mt-5 flex flex-row gap-2 items-center justify-start"
      >
        Our Team
      </motion.div>{" "}
      <motion.div
        variants={introduceitemVariants}
        className="mt-6 font-medium text-base text-[#333333] lg:max-w-screen-lg"
      >
        The BrainWave team is a collaborative group of educators, engineers,
        designers, and developers dedicated to transforming early learning
        through technology. While our backgrounds span robotics, literacy
        education, software development, and user experience design, we share a
        common commitment to child-centered innovation. Our work is rooted in
        research, guided by empathy, and fueled by creativity. Each team member
        contributes a unique area of expertise, from designing intelligent
        robots to crafting engaging, developmentally appropriate app-based
        stories. Together, we are building tools that inspire curiosity, support
        inclusive learning, and prepare children for a world shaped by
        technology. Meet the individuals behind BrainWave—each bringing vision,
        skill, and heart to every project we create.{" "}
      </motion.div>
      <motion.div
        variants={introduceitemVariants}
        className="mt-6 font-medium text-base text-[#333333] w-full"
      >
        <div className="flex flex-col lg:max-w-screen-lg  mx-auto">
          {teams.map((person, index) => (
            <motion.div
              variants={introduceitemVariants}
              className={`relative  mt-6 font-medium text-base text-[#333333] flex flex-col lg:flex-row ${
                leftMap[index] || "left-0"
              }`}
            >
              <div className="relative mx-auto lg:mb-auto rounded-full shadow overflow-hidden size-20 flex-shrink-0">
                <UserRound className="size-20" />
              </div>
              <div className="flex flex-col justify-center items-center lg:items-start  sm:mt-0 sm:p-5 lg:py-0">
                <p className="text-lg font-bold">{person.name}</p>
                <p className="mb-4 text-sm text-gray-800">{person.title}</p>
                <p className="mb-4 text-sm tracking-wide text-gray-800 w-full text-justify">
                  {person.description}{" "}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function OldOurTeam() {
  const [element, controls] = useScroll();
  return (
    <motion.div
      variants={threeElementsVariants}
      animate={controls}
      initial="hidden"
      ref={element}
      className="flex flex-col gap-2 items-center justify-center bg-miniBackground mx-10 my-20 rounded-3xl shadow-lg"
    >
      <div className="p-5 font-thin text-2xl text-black dark:text-white">
        Our <span className="text-iconColor font-bold">Team</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 justify-center items-center w-11/12 mx-10 p-5 ">
        {/* border-2 border-solid border-iconColor */}
        <motion.div
          variants={ThreeElementitemVariants}
          className="shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center"
        >
          <div className="avatar">
            <Image
              width={80}
              height={80}
              className="size-20 rounded"
              src={"/coffee.jpg"}
              alt="Medium avatar"
            />
          </div>
          <div className="font-bold">Atousa</div>
          <div className="font-bold">Business</div>
          <ListSetup
            alignItems="center"
            justifyContent="start"
            direction="row"
            className="gap-2"
          >
            <div className="cursor-pointer">
              <Instagram size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Whatsapp size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Send2 size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Facebook size="20" className="text-iconColor" />
            </div>
          </ListSetup>
        </motion.div>
        <motion.div
          variants={ThreeElementitemVariants}
          className="shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center"
        >
          <div className="avatar">
            <Image
              width={80}
              height={80}
              className="size-20 rounded"
              src={"/coffee.jpg"}
              alt="Medium avatar"
            />
          </div>
          <div className="font-bold">Iman</div>
          <div className="font-bold">Marketing</div>
          <ListSetup
            alignItems="center"
            justifyContent="start"
            direction="row"
            className="gap-2"
          >
            <div className="cursor-pointer">
              <Instagram size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Whatsapp size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Send2 size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Facebook size="20" className="text-iconColor" />
            </div>
          </ListSetup>
        </motion.div>
        <motion.div
          variants={ThreeElementitemVariants}
          className="shadow-lg rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center"
        >
          <div className="avatar">
            <Image
              width={80}
              height={80}
              className="size-20 rounded"
              src={"/coffee.jpg"}
              alt="Medium avatar"
            />
          </div>
          <div className="font-bold">Amirali</div>
          <div className="font-bold">Engineer</div>
          <ListSetup
            alignItems="center"
            justifyContent="start"
            direction="row"
            className="gap-2"
          >
            <div className="cursor-pointer">
              <Instagram size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Whatsapp size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Send2 size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Facebook size="20" className="text-iconColor" />
            </div>
          </ListSetup>
        </motion.div>
        <motion.div
          variants={ThreeElementitemVariants}
          className="shadow-lg  rounded-3xl w-2/3 lg:w-full p-3 flex flex-col gap-4 justify-center items-center"
        >
          <div className="avatar">
            <Image
              width={80}
              height={80}
              className="size-20 rounded"
              src={"/coffee.jpg"}
              alt="Medium avatar"
            />
          </div>
          <div className="font-bold">Kamran</div>
          <div className="font-bold">Engineer</div>
          <ListSetup
            alignItems="center"
            justifyContent="start"
            direction="row"
            className="gap-2"
          >
            <div className="cursor-pointer">
              <Instagram size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Whatsapp size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Send2 size="20" className="text-iconColor" />
            </div>
            <div className="cursor-pointer">
              <Facebook size="20" className="text-iconColor" />
            </div>
          </ListSetup>
        </motion.div>
      </div>
    </motion.div>
  );
}
