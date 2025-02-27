"use client";

import { ArticleModel } from "model/services/post.model";
import { ArticleService } from "services/article.service";
import Image from "next/image";
import Markdown from "react-markdown";
import { Params } from "model/common.model";
import Quote from "components/blog/article-sections/quote";
import SlideShow from "components/blog/article-sections/slide-show";
import VideoEmbed from "components/blog/article-sections/video-embed";
import { cn } from "lib/utils";
import remarkGfm from "remark-gfm";
import { useFetch } from "hooks/useFetch";

const articleServices = new ArticleService();

const Blog = async ({ params: { slug } }: { params: Params }) => {
  const { data, loading, error } = useFetch<{ data: Array<ArticleModel> }>({
    service: articleServices.read.bind(articleServices),
    options: {
      params: {
        filters: {
          slug: {
            $eq: slug,
          },
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
          blocks: {
            populate: "*",
          },
        },
      },
    },
  });

  return (
    <div className="mt-24 max-w-screen-2xl mx-auto px-8 pb-8">
      <div className="dark:text-white bg-miniBackground text-black h-auto shadow-lg rounded-3xl max-w-screen-2xl mx-auto">
        {loading && <div>Loading...</div>}
        {error && <div>{error}</div>}
        {data && data.data.length === 0 && (
          <div className="p-16 flex justify-center items-center">Not found</div>
        )}
        {data && data.data.length > 0 && (
          <div className="flex flex-col h-inherit grow justify-between">
            <div className="max-w-(--breakpoint-xl) px-4 2xl:px-0 w-full pb-8 mx-auto flex flex-col justify-between gap-4">
              {[...(data?.data || [])].map((article) => (
                <div
                  key={article.id}
                  className={cn(
                    "overflow-hidden rounded-lg text-card-foreground shadow-xs"
                  )}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${article?.attributes.cover?.data.attributes.url}`}
                    alt={article?.attributes.cover?.data.attributes.name}
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                    style={{ aspectRatio: "600/400", objectFit: "cover" }}
                  />
                  <div className="text-2xl font-semibold leading-none tracking-tight px-8 mt-8">
                    <div>{article.attributes.title}</div>
                    {/* <CardDescription>{article.description}</CardDescription> */}
                  </div>
                  <div className="text-sm text-muted-foreground flex flex-col gap-4 px-8">
                    <p>{article.attributes.description}</p>

                    {[...(article.attributes.blocks || [])].map((block) => {
                      if (block.__component === "shared.rich-text")
                        return (
                          <Markdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h3: ({ node, ...props }) => (
                                <h3
                                  className="font-bold text-lg mt-6"
                                  {...props}
                                />
                              ),
                              h4: ({ node, ...props }) => (
                                <h4
                                  className="font-semibold text-md"
                                  {...props}
                                />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-4" {...props} />
                              ),
                            }}
                            key={block.id}
                          >
                            {block.body}
                          </Markdown>
                        );
                      else if (block.__component === "shared.slider")
                        return <SlideShow key={block.id} data={block as any} />;
                      else if (block.__component === "shared.quote")
                        return <Quote key={block.id} data={block as any} />;
                      // else if (block.__component === "shared.video-embed")
                      //   return <VideoEmbed key={block.id} data={block as any} />;
                      else if (block.__component === "shared.media")
                        return (
                          <div
                            key={block.id}
                            className="overflow-hidden rounded-lg mt-6"
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${block.file?.data?.attributes?.url}`}
                              alt={block.file?.data?.attributes?.name}
                              width={600}
                              height={400}
                              className="w-full h-64 object-cover"
                              style={{
                                aspectRatio: "600/400",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        );

                      return "";
                    })}
                    {/* <pre key={news.id}>{JSON.stringify(article, null, 2)}</pre> */}
                  </div>
                  <div className="flex items-center gap-4 justify-end px-8 w-full mt-8">
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>
                        {new Date(
                          article.attributes.publishedAt
                        ).toLocaleDateString()}
                      </span>
                      <i className="bg-neutral-600 rounded-full w-1 h-1"></i>
                      <span>
                        {(article?.attributes.authorsBio?.data?.attributes &&
                          article?.attributes.authorsBio.data?.attributes
                            .name) ||
                          "unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
