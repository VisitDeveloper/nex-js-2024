import Button from "components/elements/button";
import Image from "next/image";
import { cn } from "lib/utils";

const Hero = () => {
  return (
    <div
      className={cn(
        "px-5 2xl:px-0 pt-32 2xl:pt-16",
        "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] min-h-[calc(100dvh-80px-48px)] relative flex justify-center items-center gap-12",
        "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x bg-left before:w-full before:left-0 before:top-12 before:h-6"
      )}
    >
      <div className="h-full flex flex-col lg:flex-row items-stretch w-full max-w-screen-2xl gap-y-16">
        <div className="basis-full lg:basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
          <h5 className="font-semibold text-3xl text-[#1DC1B6]">
            Kindergarten Program
          </h5>
          <h1 className="font-bold text-black text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl">
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
        <div className="basis-full lg:basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
          <div className="relative aspect-square w-full max-w-screen-sm">
            <Image alt="hero" fill src="/hero-image.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
