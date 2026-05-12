"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Apple, GooglePlay } from "iconsax-react";
import { BookOpenText, Bot, GraduationCap, icons } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  DotButton,
  useDotButton,
} from "components/pure-elements/carousel/index";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "components/pure-elements/drawer";

import Button from "components/pure-elements/button";
import { EmblaCarouselType } from "embla-carousel";
import Image from "next/image";
import Link from "next/link";
import { cn } from "lib/utils";
import { useRouter } from "next/navigation";
import { useComingSoonCountDown } from "hooks/useCominSoonCountDown";

const applications = [
  {
    icon: <BookOpenText className="size-12" />,
    name: "AppStories",
    description: "Interactive Learning for Every Age Group",
    link: "/#",
  },
  // {
  //   icon: <Bot className="size-12" />,
  //   name: "Robotics",
  //   description: "Empowering Young Minds with Robotics",
  //   link: "/coming-soon",
  // },
];

export default function AppSlider() {
  const router = useRouter();
  const [api, setApi] = React.useState<EmblaCarouselType | undefined>(
    undefined
  );
  const { selectedIndex } = useDotButton(api);
  const { days, hours, minutes, seconds } = useComingSoonCountDown("2025-12-11T00:00:00");

  const arrayUnitTime = [
    {
      name: 'days',
      unit: days
    },
    {
      name: 'hours',
      unit: hours
    },
    {
      name: 'minutes',
      unit: minutes
    },
    {
      name: 'seconds',
      unit: seconds
    }
  ]



  return (
    <Carousel
      opts={{
        align: "center",
        loop: true,
      }}
      className="w-full max-w-screen-lg mx-auto space-y-8"
      plugins={[]}
    >
      <CarouselContent className="items-stretch px-5">
        {applications.map((_, index) => (
          <CarouselItem
            key={index}
            className="text-center basis-[90%] sm:basis-1/3 h-full"
          >
            <div className="border border-dashed border-iconColor h-full rounded-2xl p-8 px-6 flex flex-col gap-4 justify-center">
              <div className="flex justify-center">
                <div className="bg-[#FEF8EC] rounded-full size-20 text-[#FEA439] flex justify-center items-center">
                  {_.icon}
                </div>
              </div>
              <span className="font-semibold text-xl">{_.name}</span>
              <div className="h-20 max-h-20">
                <p className="line-clamp-3">{_.name === "Robotics" ? null : _.description}</p>
                {_.name === "Robotics" && (
                  <div className="flex gap-2 text-center mb-4">
                    {arrayUnitTime.map((item) => (
                      <div key={item.name} className="bg-white shadow-lg rounded-2xl p-2 w-14">
                        <p className="text-xs font-bold">{item.unit}</p>
                        <p className="text-xs">{item.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant="secondary"
                      className="bg-transparent rounded-full py-3 px-12 shadow-none"
                      type="button"
                      onClick={() => {
                        if (_.name === "Robotics") {
                          router.push(_.link);
                        } else {
                        }
                      }}
                    >
                      View Detail
                    </Button>
                  </DrawerTrigger>
                  {_.name === "Robotics" ? null : (

                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        <div className="flex flex-col justify-center items-center gap-4 h-[300px]">
                          {/* <div>
                          <Image
                            width={56}
                            height={56}
                            className="size-14 rounded"
                            src={"/coffee.jpg"}
                            alt="Medium avatar"
                          />
                        </div> */}
                          <div>{_.name}</div>
                          <p className="line-clamp-3">{_.description}</p>

                          <div className="flex flex-row gap-2 items-center justify-center ">
                            <Link
                              href={"/"}
                              className="flex flex-row gap-1 border-2 border-solid border-black dark:border-white rounded-lg p-1"
                            >
                              <div>
                                <Apple
                                  size="50"
                                  className="dark:text-white text-black"
                                />
                              </div>
                              <div className="flex flex-col gap-2 dark:text-white text-black">
                                <span className="text-sm">Download on the</span>
                                <span className="text-lg">Apple Store</span>
                              </div>
                            </Link>

                            <Link
                              href={"/"}
                              className="flex flex-row gap-1 border-2 border-solid border-black dark:border-white rounded-lg p-1"
                            >
                              <div>
                                <GooglePlay
                                  size="50"
                                  className="dark:text-white text-black"
                                />
                              </div>
                              <div className="flex flex-col gap-2 dark:text-white text-black">
                                <span className="text-sm">GET IT ON</span>
                                <span className="text-lg">Google Play</span>
                              </div>
                            </Link>
                          </div>
                        </div>
                        {/* <DrawerFooter>
                        <DrawerClose asChild>
                          <Button variant="outline" className="w-full">
                            Close
                          </Button>
                        </DrawerClose>
                      </DrawerFooter> */}
                      </div>
                    </DrawerContent>
                  )}
                </Drawer>
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
