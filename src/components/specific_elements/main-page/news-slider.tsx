import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "components/pure-elements/carousel/index";

import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "lib/utils";

const NewsSlider = () => {
  return (
    <div className={cn("max-w-screen-2xl mx-auto flex flex-col gap-8 my-32")}>
      <div className={cn("px-5 2xl:px-0", "flex flex-col gap-8")}>
        <h3 className="font-bold text-3xl">BrainWave News</h3>
        <p className="">
          It is our goal to provide age appropriate opportunity for every child
          enrolled in BrainWave Kids Club enrichment classes.
        </p>
      </div>

      <div className="w-full">
        <Carousel
          opts={{
            align: "center",
            loop: true,
          }}
          className={cn(
            "w-full relative",
            "before:content-[''] before:absolute before:top-0 before:w-[10%] before:h-full before:pointer-events-none before:z-[2] before:left-0 before:bg-gradient-to-r before:from-white before:to-transparent",
            "after:content-[''] after:absolute after:top-0 after:w-[10%] after:h-full after:pointer-events-none after:z-10 after:right-0 after:bg-gradient-to-l after:from-white after:to-transparent"
          )}
          plugins={[]}
        >
          <CarouselContent className="items-stretch">
            {[
              {
                banner: "http://loremflickr.com/400/400/education",
                title: "Qui nostrum rem odit expedita similique.",
                link: "/#",
              },
              {
                banner: "http://loremflickr.com/400/400/child",
                title:
                  "Aliquam necessitatibus magnam et voluptatem nisi saepe quia ipsam non.",
                link: "/#",
              },
              {
                banner: "http://loremflickr.com/400/400/children",
                title: "Fuga amet voluptatem aliquam saepe.",
                link: "/#",
              },
              {
                banner: "http://loremflickr.com/400/400/education",
                title:
                  "Nisi omnis modi natus voluptatem voluptatem veritatis optio aut. Voluptatem voluptatum fuga sunt alias explicabo. Minus debitis mollitia consectetur ullam assumenda aliquam. Repellendus sit consequatur corporis quisquam iusto repellat laborum temporibus omnis.",
                link: "/#",
              },
              {
                banner: "http://loremflickr.com/400/300/child",
                title:
                  "Eligendi qui possimus doloribus tempora aut dolor id quam. Reiciendis ut ut harum iste ea eveniet quia quod.",
                link: "/#",
              },
              {
                banner: "http://loremflickr.com/400/400/educationchildren",
                title:
                  "Eveniet quo eius voluptate sunt excepturi eius perferendis. Dolorum quia qui nisi praesentium sit quas.",
                link: "/#",
              },
            ].map((_, index) => (
              <CarouselItem
                key={index}
                className="text-center basis-[90%] px-5 lg:px-3 md:basis-[44%] lg:basis-[28%] 2xl:basis-[20%] h-full"
              >
                <NewsCard item={_} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default NewsSlider;

function NewsCard({ item }: { item: any }) {
  return (
    <>
      <div className="border border-[#666666] h-full rounded-2xl flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-center h-56 w-full overflow-hidden  object-contain relative">
          <Image
            src={item.banner}
            fill
            alt={item.title}
            className="object-cover"
          />
        </div>
        <div className="p-8 pt-2 px-8 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs">
            <User className="text-[#19C1B6] size-4" /> <span>by {"Admin"}</span>
          </div>
          <div className="h-20 max-h-20 text-left">
            <p className="line-clamp-3 font-semibold text-xl text-[#333333]">
              {item.title}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
