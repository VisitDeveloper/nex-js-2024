"use client";

import { ArticleModel, CategoryModel } from "model/services/post.model";
import { Params, SearchParams } from "model/common.model";
import React, { useEffect, useState } from "react";

import { ArticleService } from "services/article.service";
import { Button } from "components";
import { CategoryService } from "services/category.service";
import FeatureNews from "components/specific_elements/weblog/feature-news";
import Link from "next/link";
import { NewsCard } from "components/specific_elements/main-page/news-slider";
import { cn } from "lib/utils";
import { useFetch } from "hooks/useFetch";

const articleServices = new ArticleService();
const categoryServices = new CategoryService();

export default function Weblog({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { page } = searchParams;

  const [listOrCardActivate, setListOrCardActivate] = useState<boolean>(false);

  const {
    loading: loadingCategories,
    data: categories,
    error: errorCategories,
  } = useFetch<{ data: Array<CategoryModel> }>({
    service: categoryServices.read.bind(categoryServices),
  });

  const { loading, data, error } = useFetch<{ data: Array<ArticleModel> }>({
    service: articleServices.read.bind(articleServices),
    options: {
      params: {
        sort: { createdAt: "desc" },
        pagination: {
          page: page,
          pageSize: 5,
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
    console.log("listOrCardActivate", listOrCardActivate);
  }, [listOrCardActivate]);

  return (
    <div className="flex flex-col gap-4 mb-16">
      <FeatureNews />

      <div className="px-5 xl:px-0 max-w-screen-xl mx-auto space-y-16 w-full">
        <div className="space-y-8 w-full">
          <h3 className="font-bold text-black text-4xl mt-5 flex flex-row gap-2 items-center justify-start">
            All posts
          </h3>

          <div className="w-full h-0.5 rounded-full bg-iconColor"></div>

          <div className="flex w-full flex-row gap-4">
            {/* <div className="w-1/4 sticky top-[100px] left-10 h-[500px] bg-miniBackground rounded-3xl shadow-lg px-4">
            {loadingCategories && (
              <div className="p-16 flex justify-center items-center">
                Loading...
              </div>
            )}
            {errorCategories && (
              <div className="p-16 flex justify-center items-center">
                {errorCategories}
              </div>
            )}
            {categories && categories.data.length === 0 && (
              <div className="p-16 flex justify-center items-center">
                Not found
              </div>
            )}
            {categories && categories.data.length > 0 && (
              <div className="flex flex-col gap-4 py-4">
                {categories.data.map((category) => (
                  <Link
                    href={`/weblog/category/${category.attributes.slug}`}
                    key={category.id}
                    className="text-lg font-semibold text-card-foreground"
                  >
                    {category.attributes.name}
                  </Link>
                ))}
              </div>
            )}
          </div> */}

            <div className="flex flex-col gap-4 w-full">
              {/* upper search 
            <div className="flex flex-col rounded-3xl shadow-lg px-4 py-2 bg-miniBackground">
              <Input
                placeholder="Search"
                type="search"
                className="bg-itemFormBackground"
              />
              <div className="flex flex-row gap-2 items-center">
                <div className="flex flex-row gap-1 mt-2">
                  <span
                    className={`${
                      listOrCardActivate === false
                        ? "bg-itemFormBackground rounded-md"
                        : ""
                    } p-1 '`}
                    onClick={() => setListOrCardActivate(false)}
                  >
                    <Element3
                      size="17"
                      className="text-iconColor cursor-pointer "
                    />
                  </span>
                  <span
                    className={`${
                      listOrCardActivate === true
                        ? "bg-itemFormBackground rounded-md"
                        : ""
                    } p-1 '`}
                    onClick={() => setListOrCardActivate(true)}
                  >
                    <RowVertical
                      size="17"
                      className="text-iconColor cursor-pointer"
                    />
                  </span>
                </div>
                <div className="flex flex-row items-center gap-1 mt-2 bg-itemFormBackground w-fit p-0 rounded-md">
                  <span className="hover:bg-iconColor hover:text-white duration-500 hover:duration-500 cursor-pointer px-2 rounded-md">
                    low
                  </span>
                  <span className="hover:bg-iconColor hover:text-white duration-500 hover:duration-500 cursor-pointer px-2 rounded-md">
                    high
                  </span>
                </div>
              </div>
            </div> */}

              {/* content */}
              <div className="">
                {loading && (
                  <div className="p-16 flex justify-center items-center">
                    Loading...
                  </div>
                )}
                {error && (
                  <div className="p-16 flex justify-center items-center">
                    {error}
                  </div>
                )}
                {data && data.data.length === 0 && (
                  <div className="p-16 flex justify-center items-center">
                    Not found
                  </div>
                )}
                <div
                  className={cn(`w-full grid gap-4 `, {
                    "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4":
                      listOrCardActivate,
                  })}
                >
                  {[...(data?.data || [])].map((article: ArticleModel) => (
                    <NewsCard
                      item={{
                        orientation: listOrCardActivate
                          ? "VERTICAL"
                          : "HORIZONTAL",
                        publishAt: new Date(
                          article.attributes.publishedAt
                        ).toLocaleDateString(),
                        link: `/weblog/${article.attributes.slug}`,
                        title: article.attributes.title,
                        description: article.attributes.description,
                        author: article.attributes?.authorsBio?.data?.attributes
                          ? article.attributes?.authorsBio?.data?.attributes
                              ?.name
                          : null,
                        banner: `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${article?.attributes.cover?.data.attributes.url}`,
                      }}
                      key={article.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8 w-full">
          <h3 className="font-bold text-black text-4xl mt-5 flex flex-row gap-2 items-center justify-start">
            All Categories
          </h3>

          <div className="w-full h-0.5 rounded-full bg-iconColor"></div>

          <div className="w-full">
            {loadingCategories && (
              <div className="p-16 flex justify-center items-center">
                Loading...
              </div>
            )}
            {errorCategories && (
              <div className="p-16 flex justify-center items-center">
                {errorCategories}
              </div>
            )}
            {categories && categories.data.length === 0 && (
              <div className="p-16 flex justify-center items-center">
                Not found
              </div>
            )}
            {categories && categories.data.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 py-4">
                {categories.data.map((category) => (
                  <Link
                    href={`/weblog/category/${category.attributes.slug}`}
                    key={category.id}
                    className="group text-lg font-semibold text-card-foreground border rounded-xl p-6 flex flex-col gap-4 hover:bg-[#26BEB3] hover:border-transparent hover:text-white"
                  >
                    <div className="size-16 rounded-full group-hover:bg-white/30 bg-black/10"></div>
                    <span>{category.attributes.name}</span>
                    <p className="line-clamp-3"></p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center text-center gap-4 mt-32">
        <div
          className={cn(
            "flex flex-col justify-center items-center gap-8 text-white",
            "bg-[#26BEB3]/80 w-full rounded-2xl mx-auto max-w-screen-xl p-8 pb-24 lg:pb-8 h-96 relative overflow-hidden",
            "before:content-[''] before:absolute before:-z-10 before:bg-[url('/bg-newsletter.png')] before:bg-cover before:w-full before:h-full before:inset-0"
          )}
        >
          <h3 className="font-bold text-3xl">
            Join our team to be a part of our story
          </h3>
          <p className="">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </p>

          <Button className="bg-[#FEA439] font-medium text-white rounded-full py-4 px-12">
            Join Us
          </Button>
        </div>
      </div>
    </div>
  );
}
