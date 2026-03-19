"use client";

import { Button, ListSetup, SwitchSimpleTheme } from "components";
import {
  Drawer,
  DrawerClose,
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
import { AlignJustify, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    <div className="sticky top-0  z-[11] block">
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
              <Link href={"/"}>
                <Image
                  src="/logo.png"
                  className=""
                  width={56}
                  height={56}
                  alt="logo"
                />
              </Link>

              <div className="text-2xl text-[#19C1B6] font-bold relative">

                <span>Brain Wave Education</span>


                <span className="absolute -top-4 -right-4 leading-3 text-white bg-[#19C1B6] text-[10px] font-bold px-2 py-0 pb-0.5 rounded-full">
                  Academy
                </span>
              </div>
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
                className="hidden h-10 px-8 text-base lg:inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-[#FEF8EC] text-secondary-foreground dark:bg-opacity-10"
              >
                Login
              </Link>
              <Button
                asChild
                type="button"
                className={cn(
                  "bg-[#FEA439] rounded-full text-base font-medium h-10 shadow-none px-8 hidden lg:inline-flex items-center justify-center gap-2"
                )}
              >
                <Link
                  // href={"/auth"}
                  href={""}
                >
                  Shop
                </Link>
              </Button>

              <Drawer
                direction="right"
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
              >
                <DrawerTrigger asChild>
                  <motion.button
                    variants={threeElementsVariants}
                    animate={controls}
                    ref={element}
                    type="button"
                    className={"bg-white gap-2 block lg:hidden"}
                    aria-label="Open menu"
                  >
                    <AlignJustify size={26} color="#000000" />
                  </motion.button>
                </DrawerTrigger>
                <DrawerContent className="fixed right-0 top-0 bottom-0 left-auto mt-0 h-screen w-[300px] max-w-[85vw] rounded-none border-l bg-white p-0">
                  <div className="flex items-center justify-between border-b border-solid border-iconColor px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        width={40}
                        height={40}
                        alt="logo"
                      />
                      <div className="text-base font-bold text-[#19C1B6]">
                        Brain Wave Education
                      </div>
                    </div>

                    <DrawerClose asChild>
                      <button
                        type="button"
                        aria-label="Close menu"
                        className="inline-flex items-center justify-center rounded-md p-2 hover:bg-black/5"
                      >
                        <X className="size-5" />
                      </button>
                    </DrawerClose>
                  </div>

                  <nav
                    className="flex flex-col gap-1 px-4 py-4"
                    aria-label="Mobile menu"
                  >
                    {ArrayRouteHeader.map((item: RouteHeader) => (
                      <Link
                        href={`${item.route}`}
                        key={item.id}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg px-3 py-3 text-base font-medium text-black transition-colors hover:bg-black/5"
                      >
                        {item.name}
                      </Link>
                    ))}

                    <div className="mt-4 flex flex-col gap-2 border-t border-black/10 pt-4">
                      <Link
                        href={"https://api.bwaveedu.com/admin"}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full h-10 px-4 text-base inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-colors bg-[#FEF8EC] text-secondary-foreground"
                      >
                        Login
                      </Link>
                      <Button
                        asChild
                        type="button"
                        className={cn(
                          "w-full h-10 bg-[#FEA439] rounded-full text-base font-medium shadow-none px-4 inline-flex items-center justify-center gap-2"
                        )}
                      >
                        <Link href={""} onClick={() => setMobileMenuOpen(false)}>
                          Shop
                        </Link>
                      </Button>
                    </div>
                  </nav>
                </DrawerContent>
              </Drawer>
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
      </Header>
    </div>
  );
}
