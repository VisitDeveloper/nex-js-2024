"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  DotButton,
  useDotButton,
} from "components/pure-elements/carousel/index";
import { useRef, useState } from "react";

import Autoplay from "embla-carousel-autoplay";
import { EmblaCarouselType } from "embla-carousel";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "lib/utils";

const feedbacks = [
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
  {
    image: "/people-01.jpg",
    comment:
      "Lorem ipsum dolor sit amet consectetur. Senectus tellus eget nunc posuere quis at vitae consequat. At nulla erat nisi nunc. Sit risus sagittis pellentesque eget convallis commodo. Sit pellentesque dolor neque a diam malesuada.",
    name: "Heidi Turner",
  },
];

const ParentFeedback = () => {
  const [api, setApi] = useState<EmblaCarouselType | undefined>(undefined);
  const { selectedIndex } = useDotButton(api);

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-stretch min-h-[calc(80dvh)] w-full text-white relative"
      )}
    >
      <div className="flex-grow flex-shrink-0 basis-full lg:basis-1/2 flex justify-center items-center relative bg-[#969693]">
        <video
          poster="bg-video.jpg"
          className="object-cover h-full w-inherinet"
        ></video>
        <div className="flex justify-center items-center absolute inset-0 w-full h-full bg-[#969693]/40 ">
          <div className="flex justify-center items-center size-24 border border-white rounded-full">
            <button
              type="button"
              className="cursor-pointer flex justify-center items-center size-16 border-2 border-white rounded-full"
            >
              <Play />
            </button>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "flex-grow flex-shrink-0 basis-full lg:basis-1/2 w-full lg:w-1/2 bg-[#2CC4B9]/80 relative flex items-center py-16",
          "before:bg-[url('/bg-newsletter.png')] before:bg-cover before:content-[''] before:w-full before:h-full before:-z-10 before:absolute before:inset-0"
        )}
      >
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          setApi={(api) => setApi(api)}
          className={cn(
            "w-full relative h-full min-h-[calc(60dvh)] lg:px-24 gap-8 flex flex-col justify-center"
          )}
          plugins={[
            Autoplay({
              delay: 4000,
            }),
          ]}
        >
          <CarouselContent className="items-stretch px-5 space-x-16">
            {feedbacks.slice(0, 3).map((_, index) => (
              <CarouselItem
                key={"item_" + index}
                className="h-full basis-full gap-24 flex flex-col justify-between"
              >
                <h1 className="font-bold text-5xl">Parent Says</h1>

                <p className="font-medium text-base">{_.comment}</p>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="overflow-hidden rounded-full size-16 relative">
                      <Image
                        fill
                        src={_.image}
                        alt=""
                        className="object-cover"
                      />
                    </div>

                    <span className="font-semibold">{_.name}</span>
                  </div>

                  <Image
                    alt="quote"
                    width={98}
                    height={98}
                    src={"/quote.svg"}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex gap-1 items-center px-5 lg:px-0">
            {feedbacks.slice(0, 3).map((_, index) => (
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
      </div>
    </div>
  );
};

export default ParentFeedback;
