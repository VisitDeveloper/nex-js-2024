"use client";

import { ArticleModel, CategoryModel } from "model/services/post.model";
import { Button, Input } from "components";
import { Element3, RowVertical } from "iconsax-react";
import { Params, SearchParams } from "model/common.model";
import React, { useEffect, useState } from "react";

import { ArticleService } from "services/article.service";
import { CategoryService } from "services/category.service";
import Image from "next/image";
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

  const { loading, data, error } = useFetch<{ data: Array<ArticleModel> }>({
    service: articleServices.read.bind(articleServices),
    options: {
      params: {
        sort: { createdAt: "desc" },
        pagination: {
          page: page,
          pageSize: 20,
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
        filters: {
          category: {
            slug: { $eq: params.slug },
          },
        },
      },
    },
  });

  useEffect(() => {
    console.log("listOrCardActivate", listOrCardActivate);
  }, [listOrCardActivate]);

  return (
    <div className="flex flex-col gap-16 mb-16">
      <div
        className={cn(
          "px-5 2xl:px-0 py-32 2xl:py-32",
          "bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] relative flex justify-center items-center gap-12",
          "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x bg-left before:w-full before:left-0 before:top-12 before:h-6"
        )}
      >
        <div className="h-full flex flex-col items-center justify-center text-center w-full max-w-screen-2xl gap-y-4">
          <h3 className="font-bold text-3xl">{params.slug}</h3>
          <p className="">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt.
          </p>
        </div>
      </div>

      <div className="px-5 2xl:px-0 max-w-screen-2xl mx-auto space-y-16 w-full">
        <div className="flex flex-col gap-4 w-full">
          {/* upper search  */}
          {/* <div className="flex flex-col rounded-3xl shadow-lg px-4 py-2 bg-miniBackground">
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
                  key={article.id}
                  item={{
                    orientation: listOrCardActivate ? "VERTICAL" : "HORIZONTAL",
                    publishAt: new Date(
                      article.attributes.publishedAt
                    ).toLocaleDateString(),
                    link: `/weblog/${article.attributes.slug}`,
                    title: article.attributes.title,
                    description: article.attributes.description,
                    author: article.attributes?.authorsBio?.data?.attributes
                      ? article.attributes?.authorsBio?.data?.attributes?.name
                      : null,
                    banner: `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${article.attributes.cover?.data.attributes.url}`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center text-center gap-4 mt-32">
          <div
            className={cn(
              "flex flex-col justify-center items-center gap-8 text-white",
              "bg-[#26BEB3]/80 w-full rounded-2xl mx-auto max-w-screen-2xl p-8 pb-24 lg:pb-8 h-96 relative overflow-hidden",
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
    </div>
  );
}
