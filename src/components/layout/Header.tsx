"use client";

import { Button, ListSetup, SwitchSimpleTheme } from "components";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "components/pure-elements/drawer";
import {
  Home,
  InfoCircle,
  MessageEdit,
  MobileProgramming,
  NoteText,
} from "iconsax-react";
import React, { JSX } from "react";

import Header from "components/elements/header";
import Image from "next/image";
import Link from "next/link";

export interface RouteHeader {
  id: number;
  name: string;
  route: string;
  icon?: React.ReactElement | JSX.Element | React.ReactNode;
}

export default function HeaderLayout({ ...props }) {
  const ArrayRouteHeader: Array<RouteHeader> = [
    {
      id: 0,
      name: "Home",
      route: `/`,
      icon: <Home size="20" className="text-iconColor" />,
    },
    {
      id: 1,
      name: "Blog",
      route: `/weblog`,
      icon: <MessageEdit size="20" className="text-iconColor" />,
    },
    {
      id: 2,
      name: "Applications",
      route: `/application-page`,
      icon: <MobileProgramming size="20" className="text-iconColor" />,
    },
    {
      id: 3,
      name: "About",
      route: `/about`,
      icon: <InfoCircle size="20" className="text-iconColor" />,
    },
    {
      id: 4,
      name: "Contact",
      route: `/contact-us`,
      icon: <NoteText size="20" className="text-iconColor" />,
    },
  ];
  return (
    <>
      <div className="top-0 sticky z-[11] block">
        <Header
          {...props}
          className="bg-white w-full dark:bg-blackRgba h-20 px-5 xl:px-0 z-50 flex items-center border-b border-solid border-iconColor"
        >
          <div className="max-w-screen-xl mx-auto flex justify-between items-center w-full">
            <ListSetup
              alignItems="center"
              direction="row"
              justifyContent="start"
              className="gap-2"
            >
              <Image
                src="/logo.png"
                className=""
                width={56}
                height={56}
                alt="logo"
              />

              <span className="text-2xl text-[#19C1B6] font-bold">
                BrainWave
              </span>
            </ListSetup>

            <ListSetup
              alignItems="center"
              direction="row"
              justifyContent="start"
              className="gap-10 hidden lg:flex"
            >
              {ArrayRouteHeader.map((item: RouteHeader) => {
                return (
                  <>
                    <Link
                      href={`${item.route}`}
                      key={item.id}
                      className="flex flex-row items-center gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="relative group font-medium text-base">
                          {item.name}
                          <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                        </span>
                      </div>
                    </Link>
                  </>
                );
              })}
            </ListSetup>

            <ListSetup
              alignItems="center"
              direction="row"
              justifyContent="end"
              className="gap-5"
            >
              <Link
                href={"/auth"}
                className="px-8 py-2 text-base inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-[#FEF8EC] text-secondary-foreground dark:bg-opacity-10"
              >
                Login
              </Link>

              {/* <span>
                <SwitchSimpleTheme />
              </span> */}
            </ListSetup>
          </div>
        </Header>
      </div>
    </>
  );
}
