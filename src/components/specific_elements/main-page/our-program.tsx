import Button from "components/elements/button";
import Image from "next/image";
import { cn } from "lib/utils";

const OurProgram = () => {
  return (
    <div
      className={cn(
        "px-5 xl:px-0",
        "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] relative flex justify-center items-center gap-12 py-12"
      )}
    >
      <div className="h-full flex flex-col xl:flex-row gap-16 items-stretch w-full max-w-screen-xl">
        <div className="basis-full lg:basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
          <div className="relative aspect-square w-full max-w-screen-sm">
            <Image alt="out-program" fill src="/bg-program.svg" />
          </div>
        </div>
        <div className="basis-full lg:basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
          <h5 className="font-bold text-5xl">BrainWave Program</h5>

          <p className="">
            Being brave isn’t always a grand gesture sometimes it just means
            having a go attempting that difficult question, offering an answer
            in a lesson when you’re simply really trying new.
          </p>

          <div className="bg-[#19C1B6] rounded-3xl flex divide-x-2 divide-[#50D6CD] w-full p-8 px-4 text-white text-center">
            <div className="basis-1/3 flex flex-col items-center justify-center p-4">
              <span className="font-bold text-2xl">14+</span>
              <span className="text-wrap font-thin">Years of experience</span>
            </div>
            <div className="basis-1/3 flex flex-col items-center justify-center p-4">
              <span className="font-bold text-2xl">14+</span>
              <span className="text-wrap font-thin">Students each year</span>
            </div>
            <div className="basis-1/3 flex flex-col items-center justify-center p-4">
              <span className="font-bold text-2xl">14+</span>
              <span className="text-wrap font-thin">Award winning</span>
            </div>
          </div>

          <ul className="flex flex-col w-full gap-2">
            <li className="flex items-start gap-2">
              <svg
                className="size-6"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16.5" cy="16.5" r="16.5" fill="#D1F2F0" />
                <path
                  d="M13.4327 8.37693L20.5616 15.4846C20.6462 15.5692 20.7063 15.6609 20.7418 15.7596C20.7773 15.8583 20.7948 15.9641 20.7943 16.0769C20.7943 16.1898 20.7768 16.2955 20.7418 16.3942C20.7068 16.493 20.6468 16.5846 20.5616 16.6692L13.4327 23.7981C13.2353 23.9955 12.9885 24.0942 12.6923 24.0942C12.3962 24.0942 12.1423 23.9885 11.9308 23.7769C11.7193 23.5654 11.6135 23.3186 11.6135 23.0365C11.6135 22.7545 11.7193 22.5077 11.9308 22.2962L18.15 16.0769L11.9308 9.8577C11.7334 9.66026 11.6347 9.41685 11.6347 9.12747C11.6347 8.83809 11.7404 8.5879 11.952 8.37693C12.1635 8.16539 12.4103 8.05962 12.6923 8.05962C12.9744 8.05962 13.2212 8.16539 13.4327 8.37693Z"
                  fill="#19C1B6"
                />
              </svg>

              <span>We believe every child is intelligent so we care.</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="size-6"
                viewBox="0 0 33 33"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="16.5" cy="16.5" r="16.5" fill="#D1F2F0" />
                <path
                  d="M13.4327 8.37693L20.5616 15.4846C20.6462 15.5692 20.7063 15.6609 20.7418 15.7596C20.7773 15.8583 20.7948 15.9641 20.7943 16.0769C20.7943 16.1898 20.7768 16.2955 20.7418 16.3942C20.7068 16.493 20.6468 16.5846 20.5616 16.6692L13.4327 23.7981C13.2353 23.9955 12.9885 24.0942 12.6923 24.0942C12.3962 24.0942 12.1423 23.9885 11.9308 23.7769C11.7193 23.5654 11.6135 23.3186 11.6135 23.0365C11.6135 22.7545 11.7193 22.5077 11.9308 22.2962L18.15 16.0769L11.9308 9.8577C11.7334 9.66026 11.6347 9.41685 11.6347 9.12747C11.6347 8.83809 11.7404 8.5879 11.952 8.37693C12.1635 8.16539 12.4103 8.05962 12.6923 8.05962C12.9744 8.05962 13.2212 8.16539 13.4327 8.37693Z"
                  fill="#19C1B6"
                />
              </svg>

              <span>Teachers make a difference of your child.</span>
            </li>
          </ul>

          <div className="">
            <Button
              type="button"
              className="bg-[#FEA439] font-medium text-white rounded-full py-4 px-12"
            >
              View more
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurProgram;
