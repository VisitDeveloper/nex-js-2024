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
import React, { JSX, useState } from "react";
import { cn } from "lib/utils";
import Header from "components/elements/header";
import Image from "next/image";
import Link from "next/link";
import { AlignJustify } from "lucide-react";
import { motion } from "motion/react";
import { useScroll } from "hooks/useScroll";
import { threeElementsVariants } from "config/animation";

export interface RouteHeader {
  id: number;
  name: string;
  route: string;
  icon?: React.ReactElement | JSX.Element | React.ReactNode;
}

export default function HeaderLayout({ ...props }) {
  const [hamburgerMenu, setHamburgerMenu] = useState(false);
  const [element, controls] = useScroll();

  const ArrayRouteHeader: Array<RouteHeader> = [
    {
      id: 0,
      name: "BrainWave",
      route: `#brainWave`,
      // route: `/`,
      icon: <Home size="20" className="text-iconColor" />,
    },
    {
      id: 1,
      name: "Innovative Approach",
      route: `#innovativeApproach`,
      // route: `/weblog`,
      icon: <MessageEdit size="20" className="text-iconColor" />,
    },
    {
      id: 2,
      name: "Applications",
      route: `#applications`,
      // route: `/application-page`,
      icon: <MobileProgramming size="20" className="text-iconColor" />,
    },
    {
      id: 3,
      name: "Resource",
      route: `#resource`,
      // route: `/about`,
      icon: <InfoCircle size="20" className="text-iconColor" />,
    },
    {
      id: 4,
      name: "Contact Us",
      route: `#contactUs`,
      // route: `/contact-us`,
      icon: <NoteText size="20" className="text-iconColor" />,
    },
  ];
  return (
    <div className="relative top-0 sticky z-[11] block">
      <Header
        {...props}
        className="bg-white w-full  xl:px-0 z-50 flex flex-col items-center "
      >
        <div className=" py-3 px-5 w-full  border-b border-solid border-iconColor">
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
              justifyContent="end"
              className=" gap-3 lg:gap-5"
            >
              <Link
                // href={"/auth"}
                href={"https://api.bwaveedu.com/admin"}
                className="px-8 py-2 text-base inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-[#FEF8EC] text-secondary-foreground dark:bg-opacity-10"
              >
                Login
              </Link>
              <Button
                asChild
                type="button"
                className={cn(
                  "bg-[#FEA439] rounded-full text-base font-medium py-2 shadow-none px-8 flex items-center gap-2"
                )}
              >
                <Link
                  // href={"/auth"}
                  href={""}
                >
                  Shop
                </Link>
              </Button>
              <motion.button
                variants={threeElementsVariants}
                animate={controls}
                ref={element}
                type="button"
                className={"bg-white gap-2 block lg:hidden"}
                onClick={() => setHamburgerMenu(!hamburgerMenu)}
              >
                <AlignJustify
                  size={26}
                  color="#000000"
                  style={{ fill: "black" }}
                />
              </motion.button>
            </ListSetup>
          </div>
        </div>
        <div className="px-5 w-full hidden lg:block">
          <div className="max-w-screen-xl mx-auto flex justify-centers items-center w-full my-5 justify-items-center bg-white">
            <ListSetup
              alignItems="center"
              direction="row"
              justifyContent="start"
              className="gap-10 hidden lg:flex mx-auto"
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
          </div>
        </div>
        {hamburgerMenu && (
          <motion.div
            variants={threeElementsVariants}
            animate={controls}
            className={`fixed top-[82px] right-[3%] size-64 bg-[#FEF8EC] rounded-xl shadow-lg z-40 transform transition-transform duration-300 ${
              hamburgerMenu ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <ListSetup
              alignItems="center"
              direction="row"
              justifyContent="start"
              className="gap-5 flex flex-col w-full h-full mx-auto text-black overflow-hidden m-auto justify-center items-center"
            >
              {ArrayRouteHeader.map((item: RouteHeader) => {
                return (
                  <>
                    <Link
                      href={`${item.route}`}
                      key={item.id}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="flex flex-col">
                        <span className="relative group font-medium text-black">
                          {item.name}
                          <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-iconColor transition-all duration-500 group-hover:w-full" />
                        </span>
                      </div>
                    </Link>
                  </>
                );
              })}
            </ListSetup>
          </motion.div>
        )}
      </Header>
    </div>
  );
}
