import { useEffect, useState } from "react";

import { ArticleModel } from "model/services/post.model";
import { ArticleService } from "services/article.service";
import Button from "components/elements/button";
import Image from "next/image";
import Link from "next/link";
import Loading from "../../../app/loading";
import { cn } from "lib/utils";
import { useFetch } from "hooks/useFetch";

const articleServices = new ArticleService();

const FeatureNews = () => {
  const [article, setArticle] = useState<ArticleModel | null>(null);

  const { loading, data, error } = useFetch<{ data: Array<ArticleModel> }>({
    service: articleServices.read.bind(articleServices),
    options: {
      params: {
        sort: { createdAt: "desc" },
        pagination: {
          page: 1,
          pageSize: 1,
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

  useEffect(() => {
    if (!loading && !!data) setArticle(data.data[0]);
  }, [data]);

  return (
    <div
      className={cn(
        "px-5 2xl:px-0 pt-32 2xl:pt-16",
        "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] min-h-[calc(100dvh-80px-48px-100px)] relative flex justify-center items-center gap-12",
        "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x bg-left before:w-full before:left-0 before:top-12 before:h-6"
      )}
    >
      {loading ? <>Loading ...</> : <></>}
      {article ? (
        <div className="h-full flex flex-col lg:flex-row items-stretch w-full max-w-screen-2xl gap-y-16">
          <div className="basis-full lg:basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
            <h5 className="font-semibold text-3xl text-[#1DC1B6]">
              Featured Post
            </h5>
            <h1 className="font-bold text-black text-4xl md:text-5xl xl:text-6xl 2xl:text-7xl line-clamp-3">
              {article?.attributes.title}
            </h1>
            <p className="font-medium text-base text-[#333333]">
              {article?.attributes.description}
            </p>
            <div className="">
              <Link href={`/weblog/${article?.attributes.slug}`}>
                <Button
                  type="button"
                  className="bg-[#FEA439] font-medium text-white rounded-full py-4 px-12"
                >
                  Read More
                </Button>
              </Link>
            </div>
          </div>
          <div className="basis-full lg:basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
            <div className="relative aspect-square w-full max-w-screen-sm rounded-xl overflow-hidden max-h-96">
              <Image
                alt="hero"
                className="object-contain"
                fill
                src={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${article?.attributes.cover?.data.attributes.url}`}
              />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default FeatureNews;
