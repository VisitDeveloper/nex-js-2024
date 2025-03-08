import ContactForm from "./contact-form";
import { Hierarchy } from "iconsax-react";
import React from "react";
import { motion } from "motion/react";

export default function LeftHalf() {
  return (
    <div className="w-full md:w-1/2 p-4">
      <motion.div className="text-3xl mt-5 flex flex-row gap-2 font-bold items-center justify-start">
        <Hierarchy size="30" className="text-white" />
        Communicaton channel
      </motion.div>
      {/* <motion.div className="w-full h-[2px] bg-white mt-[0px]"></motion.div> */}
      <div className="mt-5 flex flex-col gap-6">
        <ContactForm />
      </div>
    </div>
  );
}
