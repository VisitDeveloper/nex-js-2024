// import { Box } from "@chakra-ui/react";
'use client'
import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Button } from 'components'
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";

const Slide = ({ isActive, slide, handleDrag }: any) => {
    if (isActive) {
        return (
            <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
            >


                <div className="w-full h-[200px] p-2 border-2 border-solid border-iconColor rounded-3xl size-12 shadow-lg ">
                    {slide}
                </div>
            </motion.div>
        );
    }
    return null;
};



const SlideShow = ({ autoplay, delay }: any) => {
    const slides = [1, 2, 3];
    const [active, setActive] = useState(1);

    const prev = () =>
        setActive(active > 1 ? active - 1 : slides[slides.length - 1]);
    const next = () => setActive(active < slides.length ? active + 1 : 1);

    useEffect(() => {
        if (autoplay) {
            setTimeout(() => {
                next();
            }, delay || 3000);
        }
    }, [active, next]);

    return (
        <div className=" md:hidden block mx-10 mt-20">
            <>
                {slides.map((slide) => {
                    return <Slide isActive={active === slide} slide={slide} />;
                })}
            </>
            {/* <p>active: {active} </p> */}
            <div className="flex flex-row-reverse gap-2 items-center mt-5">

                <Button onClick={next} className="size-12" variant={"secondary"} >
                    <ArrowRight2 size="35" className="text-iconColor" />
                </Button>
                <Button onClick={prev} className="size-12" variant={"secondary"}>
                    <ArrowLeft2 size="35" className="text-iconColor" />
                </Button>
            </div>
        </div>
    );
};

export default SlideShow;
