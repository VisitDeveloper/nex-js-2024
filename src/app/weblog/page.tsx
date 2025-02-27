"use client";

import { Button, Input } from "components";
import { Element3, RowVertical } from "iconsax-react";
import { Params, SearchParams } from "model/common.model";
import React, { useEffect, useState } from "react";

import { ArticleModel } from "model/services/post.model";
import { ArticleService } from "services/article.service";
import Image from "next/image";
import Link from "next/link";
import { cn } from "lib/utils";
import { useFetch } from "hooks/useFetch";

const articleServices = new ArticleService();

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
      },
    },
  });

  useEffect(() => {
    console.log("listOrCardActivate", listOrCardActivate);
  }, [listOrCardActivate]);

  return (
    <div className="mt-[100px] flex flex-row gap-4  mb-10 mx-10 ">
      <div className="w-1/3 sticky top-[100px] left-10 h-[500px] bg-miniBackground rounded-3xl shadow-lg px-4">
        Search box
      </div>

      <div className="flex flex-col gap-4 w-2/3">
        {/* upper search  */}
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
        </div>

        {/* content */}
        <div className="rounded-3xl shadow-lg px-4 py-4 bg-miniBackground">
          <div
            className={`${
              listOrCardActivate === true ? "flex-col" : "flex-row"
            } w-full flex`}
          >
            {[...(data?.data || [])].map((article: ArticleModel) => (
              <div
                key={article.id}
                className={cn(
                  "overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs",
                  {
                    "flex flex-row items-stretch": listOrCardActivate === true,
                  }
                )}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${article?.attributes.cover?.data.attributes.url}`}
                  alt={article?.attributes.cover?.data.attributes?.name}
                  width={600}
                  height={400}
                  className={cn("w-full h-64 object-cover", {
                    "max-w-44 h-44": listOrCardActivate === true,
                  })}
                  style={{ aspectRatio: "600/400", objectFit: "cover" }}
                />
                <div
                  className={cn("flex flex-col h-full w-full", {
                    "h-44": listOrCardActivate === true,
                  })}
                >
                  <div
                    className={cn("flex flex-col space-y-1.5 p-6", {
                      "flex-grow": listOrCardActivate === true,
                    })}
                  >
                    <div className="text-2xl font-semibold leading-none tracking-tight">
                      {article.attributes.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {article.attributes.description}
                    </div>
                  </div>
                  <div className="flex items-center p-6 pt-0 gap-4 justify-between">
                    <Link
                      href={`/weblog/${article.attributes.slug}`}
                      className=""
                    >
                      <Button type="button" variant="secondary" size="sm">
                        Load More
                      </Button>
                    </Link>

                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>
                        {new Date(
                          article.attributes.publishedAt
                        ).toLocaleDateString()}
                      </span>
                      <i className="bg-neutral-600 rounded-full w-1 h-1"></i>
                      <span>
                        {(article.attributes?.authorsBio?.data?.attributes &&
                          article.attributes?.authorsBio?.data?.attributes
                            ?.name) ||
                          "unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
