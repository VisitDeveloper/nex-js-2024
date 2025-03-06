"use client";

import * as React from "react";

import { BookOpenText, GraduationCap, icons } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  DotButton,
  useDotButton,
} from "components/pure-elements/carousel/index";

import Button from "components/pure-elements/button";
import { EmblaCarouselType } from "embla-carousel";
import { cn } from "lib/utils";

const applications = [
  {
    icon: <BookOpenText className="size-12" />,
    name: "AppStory",
    description:
      "Repudiandae alias quas eos tempore. Sunt id deserunt ducimus modi expedita. Pariatur sed officia est natus quia aliquam. Odit ea explicabo ipsam quia dolores voluptatibus.",
    link: "/#",
  },
  {
    icon: <GraduationCap className="size-12" />,
    name: "Dyslexia",
    description:
      " Voluptatem aut est quaerat earum et voluptate non. Totam et voluptas ea et.",
    link: "/#",
  },
];

export default function AppSlider() {
  const [api, setApi] = React.useState<EmblaCarouselType | undefined>(
    undefined
  );
  const { selectedIndex } = useDotButton(api);

  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full max-w-screen-sm mx-auto space-y-8"
      plugins={[]}
    >
      <CarouselContent className="items-stretch px-5">
        {applications.map((_, index) => (
          <CarouselItem key={index} className="text-center basis-[90%] sm:basis-1/2 h-full">
            <div className="border border-dashed border-iconColor h-full rounded-2xl p-8 px-6 flex flex-col gap-4 justify-center">
              <div className="flex justify-center">
                <div className="bg-[#FEF8EC] rounded-full size-20 text-[#FEA439] flex justify-center items-center">
                  {_.icon}
                </div>
              </div>
              <span className="font-semibold text-xl">{_.name}</span>
              <div className="h-20 max-h-20">
                <p className="line-clamp-3">{_.description}</p>
              </div>
              <div className="">
                <Button
                  variant="secondary"
                  className="bg-transparent rounded-full py-3 px-12 shadow-none"
                  type="button"
                >
                  View Detail
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex gap-1 items-center justify-center">
        {applications.map((_, index) => (
          <DotButton
            key={index}
            //   onClick={() => onDotButtonClick(index)}
            className={cn("w-6 h-3 rounded-full bg-[#eeeeee]", {
              "bg-black": index === selectedIndex,
            })}
          />
        ))}
      </div>
    </Carousel>
  );
}
