import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "components/pure-elements/carousel/index";

import { ArticleModel } from "model/services/post.model";
import { ArticleService } from "services/article.service";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { cn } from "lib/utils";
import { useFetch } from "hooks/useFetch";

const articleServices = new ArticleService();

const NewsSlider = () => {
  const { loading, data, error } = useFetch<{ data: Array<ArticleModel> }>({
    service: articleServices.read.bind(articleServices),
    options: {
      params: {
        sort: { createdAt: "desc" },
        pagination: {
          page: 1,
          pageSize: 10,
        },
        populate: {
          cover: { fields: ["name", "url"] },
          category: { populate: "*" },
          authorsBio: {
            populate: "*",
          },
          seo: {
            populate: "*",
          },
        },
      },
    },
  });

  return (
    <div className={cn("max-w-screen-xl mx-auto flex flex-col gap-8 my-32")}>
      <div className={cn("px-5 xl:px-0", "flex flex-col gap-8")}>
        <h3 className="font-bold text-3xl">BrainWave News – Stay Updated!</h3>
        <p className="">Exciting Updates from BrainWave! Stay tuned for more updates!</p>
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
            {[...(data?.data || [])].map((_, index) => (
              <CarouselItem
                key={index}
                className="text-center basis-[90%] px-5 lg:px-3 md:basis-[44%] lg:basis-[28%] 2xl:basis-[20%] h-full"
              >
                <NewsCard
                  item={{
                    orientation: "VERTICAL",
                    publishAt: new Date(
                      _.attributes.publishedAt
                    ).toLocaleDateString(),
                    link: `/weblog/${_.attributes.slug}`,
                    title: _.attributes.title,
                    description: _.attributes.description,
                    author: _.attributes?.authorsBio?.data?.attributes
                      ? _.attributes?.authorsBio?.data?.attributes?.name
                      : null,
                    banner: `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${_?.attributes.cover?.data.attributes.url}`,
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export default NewsSlider;

export function NewsCard({ item }: { item: any }) {
  return (
    <Link
      href={item.link}
      className={cn(
        "border border-[#666666] h-full rounded-2xl flex flex-col gap-4 overflow-hidden",
        {
          "flex-row": item.orientation === "HORIZONTAL",
        }
      )}
    >
      <div
        className={cn(
          "flex justify-center h-56 w-full overflow-hidden object-contain relative",
          {
            "w-56": item.orientation === "HORIZONTAL",
          }
        )}
      >
        <Image
          src={item.banner}
          fill
          alt={item.title}
          className="object-cover"
        />
      </div>
      <div
        className={cn("p-8 pt-2 px-8 flex flex-col gap-4", {
          "pt-8 pl-2": item.orientation === "HORIZONTAL",
        })}
      >
        <div className="flex items-center gap-2 text-xs">
          <User className="text-[#19C1B6] size-4" />{" "}
          <span>by {item.author || "unknown"}</span>
        </div>
        <div className="h-20 max-h-20 text-left">
          <p className="line-clamp-3 font-semibold text-xl text-[#333333]">
            {item.title}
          </p>

          <p className="line-clamp-3 text-neutral-500">{item.description}</p>
        </div>
      </div>
    </Link>
  );
}
