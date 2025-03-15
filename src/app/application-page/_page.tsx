"use client";

import { Apple, Element3, GooglePlay, RowVertical, Star1 } from "iconsax-react";
import { Button, Input, Row } from "components";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "components/pure-elements/drawer";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "components/pure-elements/select";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function Application() {
  const testArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const [listOrCardActivate, setListOrCardActivate] = useState<boolean>(false);

  useEffect(() => {
    console.log("listOrCardActivate", listOrCardActivate);
  }, [listOrCardActivate]);
  const { theme } = useTheme();

  return (
    <div className="my-12 mx-auto max-w-screen-xl px-5 xl:px-0 space-y-8">
      <form className="flex flex-col sm:flex-row gap-2 items-center bg-miniBackground rounded-3xl p-4 shadow-lg">
        <div className="w-full sm:w-3/4 flex flex-row gap-2 items-center">
          <div className="sm:w-2/4 w-full">
            <Input placeholder="Search" type="search" />
          </div>
          <div className="w-2/4">
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Action</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full sm:w-1/4 flex flex-row-reverse items-center sm:justify-start justify-between gap-2">
          <Button variant={"secondary"} size={"sm"} className="w-fit">
            {" "}
            Search
          </Button>
          <div className="flex flex-row gap-1">
            <span
              className={`${
                listOrCardActivate === false
                  ? "bg-itemFormBackground rounded-md"
                  : ""
              } p-1 '`}
              onClick={() => setListOrCardActivate(false)}
            >
              <Element3 size="17" className="text-iconColor cursor-pointer " />
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
        </div>
      </form>
      {listOrCardActivate === true ? (
        <Row className="gap-4 lg:justify-start lg:items-start justify-center items-center">
          <div className="md:col-span-6 col-span-12 bg-miniBackground rounded-3xl shadow-lg min-h-[100px]">
            <div className="flex flex-row gap-2 ">
              <Image
                src={"/2.jpeg"}
                alt="picture"
                width={224}
                height={224}
                className="rounded-tl-3xl rounded-bl-3xl lg:size-56 size-36"
              />
              <div className="flex flex-col justify-between p-2 gap-1">
                <div className="font-bold">Name Application</div>
                <div className="">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum
                  laudantium temporibus quos.
                </div>
                <div className="flex flex-row gap-2 items-center justify-between text-xs text-slate-500">
                  <div className="flex flex-row gap-2">
                    <span>
                      <Star1 size="12" color="#FF8A65" />
                    </span>
                    <span>4.6 • 1.8K Ratings</span>
                  </div>

                  <div>
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="secondary">Open Drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="mx-auto w-full max-w-sm">
                          {/* data {item} */}
                          <div className="flex flex-col justify-center items-center gap-2 h-[300px]">
                            <div>
                              <Image
                                width={56}
                                height={56}
                                className="size-14 rounded"
                                src={"/coffee.jpg"}
                                alt="Medium avatar"
                              />
                            </div>
                            <div>Name</div>
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
                                  <span className="text-sm">
                                    Download on the
                                  </span>
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
                          <DrawerFooter>
                            {/* <Button variant={'secondary'} className='w-full'>Submit</Button> */}
                            <DrawerClose asChild>
                              <Button variant="outline" className="w-full">
                                Close
                              </Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 col-span-12 bg-miniBackground rounded-3xl shadow-lg min-h-[100px]">
            <div className="flex flex-row gap-2 ">
              <Image
                src={"/coffee.jpg"}
                alt="picture"
                width={224}
                height={224}
                className="rounded-tl-3xl rounded-bl-3xl lg:size-56 size-36"
              />
              <div className="flex flex-col p-2 gap-1">
                <div className="font-bold">Name Application</div>
                <div className="">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum
                  laudantium temporibus quos.
                </div>
                <div className="flex flex-row gap-2 text-xs text-slate-500">
                  <span>
                    <Star1 size="12" color="#FF8A65" />
                  </span>
                  <span>4.6 • 1.8K Ratings</span>
                </div>
              </div>
            </div>
          </div>
        </Row>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:justify-start lg:items-start justify-center items-center flex-wrap ">
          {testArray.map((item: number) => {
            return (
              <div
                key={item}
                className="bg-miniBackground shadow-lg rounded-3xl w-full h-[250px] flex flex-col p-4"
              >
                <div className="avatar">
                  <Image
                    width={56}
                    height={56}
                    className="size-14 rounded"
                    src={"/2.jpeg"}
                    alt="Medium avatar"
                  />
                  {/* <Image src={'/2.jpeg'} alt='picture' width={200} height={100} className='rounded-tl-3xl rounded-bl-3xl' /> */}
                </div>
                <span className="text-2xl font-bold mt-1">Name {item}</span>
                <span
                  className="text-justify  tracking-[-0.05rem] leading-4 mt-2"
                  style={{ wordSpacing: "0px" }}
                >
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Eum
                  laudantium temporibus quos.
                </span>
                <span className="flex flex-row-reverse mt-2">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary">Open Drawer</Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        {/* data {item} */}
                        <div className="flex flex-col justify-center items-center gap-2 h-[300px]">
                          <div>
                            <Image
                              width={56}
                              height={56}
                              className="size-14 rounded"
                              src={"/coffee.jpg"}
                              alt="Medium avatar"
                            />
                          </div>
                          <div>Name {item}</div>
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
                        <DrawerFooter>
                          {/* <Button variant={'secondary'} className='w-full'>Submit</Button> */}
                          <DrawerClose asChild>
                            <Button variant="outline" className="w-full">
                              Close
                            </Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
