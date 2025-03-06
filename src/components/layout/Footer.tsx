import {
  Call,
  Clock,
  Facebook,
  Instagram,
  Location,
  Send2,
  Sms,
  Whatsapp,
} from "iconsax-react";

import Footer from "components/elements/footer";
import Image from "next/image";
import Link from "next/link";
import ListSetup from "components/wrapper-elements/ListSetup";
import React from "react";
import { RouteHeader } from "./Header";
import Row from "components/wrapper-elements/Row";
import { cn } from "lib/utils";

export default function FooterLayout({ ...props }) {
  const ArrayRouteFooter: Array<RouteHeader> = [
    {
      id: 0,
      name: "Home",
      route: `/`,
    },
    {
      id: 1,
      name: "Blog",
      route: `/weblog`,
    },
    {
      id: 2,
      name: "Applications",
      route: `/application-page`,
    },
    {
      id: 3,
      name: "About",
      route: `/about`,
    },
    {
      id: 4,
      name: "Contact",
      route: "/contact-us",
    },
  ];

  const ArrayRouteFooter2: Array<RouteHeader> = [
    {
      id: 0,
      name: "Recently Viewed",
      route: `?#`,
    },
    {
      id: 1,
      name: "New programs",
      route: `?#`,
    },
    {
      id: 2,
      name: "Curriculums",
      route: `?#`,
    },
    {
      id: 3,
      name: "Career",
      route: `?#`,
    },
    {
      id: 4,
      name: "School stuff",
      route: "?#",
    },
  ];

  return (
    <>
      <Footer
        {...props}
        className={cn(
          "text-black bg-gradient-to-r from-[#FEF6EC] to-[#EDFEFC] relative",
          "py-48",
          // "py-16",
          "pb-16",
          "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x before:w-full before:bottom-8 before:left-0 before:h-6"
        )}
      >
        <div className="h-auto py-8 max-w-screen-2xl mx-auto">
          <Row className="gap-x-16 gap-8">
            <div className="md:col-span-4 col-span-12 flex flex-col w-full items-start gap-8">
              <ListSetup
                className="gap-4"
                alignItems="start"
                direction="col"
                justifyContent="center"
              >
                <div className="font-thin text-3xl mt-5">
                  <Image alt="logo" src="/logo.png" width={128} height={128} />
                </div>
                <span className="font-black text-[#19C1B6] text-3xl">
                  BrainWave
                </span>
                <p className="text-sm">
                  Assumenda dignissimos sit consequuntur porro. Explicabo sed
                  necessitatibus est nihil sequi enim. Nostrum adipisci
                  consequuntur expedita magni. Nesciunt atque odio. Est
                  similique commodi est temporibus consectetur non sint
                  quibusdam.
                </p>
              </ListSetup>

              <ListSetup
                alignItems="center"
                justifyContent="start"
                direction="row"
                className="gap-2"
              >
                <div className="cursor-pointer">
                  <Instagram size="20" className="text-iconColor" />
                </div>
                <div className="cursor-pointer">
                  <Whatsapp size="20" className="text-iconColor" />
                </div>
                <div className="cursor-pointer">
                  <Send2 size="20" className="text-iconColor" />
                </div>
                <div className="cursor-pointer">
                  <Facebook size="20" className="text-iconColor" />
                </div>
              </ListSetup>
            </div>

            <div className="md:col-span-8 col-span-12 flex flex-col w-full pt-5">
              <div className="text-3xl font-bold">Quick Links</div>

              <Row className="gap-16 mt-8">
                <div className="md:col-span-4 col-span-12">
                  <ListSetup
                    className="gap-4"
                    alignItems="start"
                    direction="col"
                    justifyContent="start"
                  >
                    {ArrayRouteFooter.length !== 0 &&
                      ArrayRouteFooter.map((item: RouteHeader) => {
                        return (
                          <>
                            <Link
                              href={`${item.route}`}
                              key={item.id}
                              className="flex flex-row items-center gap-2"
                            >
                              <div className="flex flex-col">
                                <span className="relative group text-[#666666]">
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

                <div className="md:col-span-4 col-span-12">
                  <ListSetup
                    className="gap-4"
                    alignItems="start"
                    direction="col"
                    justifyContent="start"
                  >
                    {ArrayRouteFooter2.length !== 0 &&
                      ArrayRouteFooter2.map((item: RouteHeader) => {
                        return (
                          <>
                            <Link
                              href={`${item.route}`}
                              key={item.id}
                              className="flex flex-row items-center gap-2"
                            >
                              <div className="flex flex-col">
                                <span className="relative group text-[#666666]">
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

                <div className="md:col-span-4 col-span-12">
                  <ListSetup
                    className="gap-6"
                    alignItems="start"
                    direction="col"
                    justifyContent="start"
                  >
                    <ListSetup
                      direction="row"
                      justifyContent="start"
                      alignItems="start"
                      className="gap-2"
                    >
                      <ListSetup
                        direction="row"
                        justifyContent="start"
                        alignItems="center"
                      >
                        <Location size="20" className="text-iconColor" />
                      </ListSetup>
                      <span className="text-sm text-[#666666]">
                        Westlands Building, Nairobi, KE
                      </span>
                    </ListSetup>
                    <ListSetup
                      direction="row"
                      justifyContent="start"
                      alignItems="start"
                      className="gap-2"
                    >
                      <ListSetup
                        direction="row"
                        justifyContent="start"
                        alignItems="center"
                      >
                        <Sms size="20" className="text-iconColor" />
                      </ListSetup>
                      <span className="text-sm text-[#666666]">
                        textemail@yahoo.com
                      </span>
                    </ListSetup>
                    <ListSetup
                      direction="row"
                      justifyContent="start"
                      alignItems="start"
                      className="gap-2"
                    >
                      <ListSetup
                        direction="row"
                        justifyContent="start"
                        alignItems="center"
                      >
                        <Call size="20" className="text-iconColor" />
                      </ListSetup>
                      <span className="text-sm text-[#666666]">
                        +1-50-044-5450
                      </span>
                    </ListSetup>

                    <ListSetup
                      direction="row"
                      justifyContent="start"
                      alignItems="start"
                      className="gap-2"
                    >
                      <ListSetup
                        direction="row"
                        justifyContent="start"
                        alignItems="center"
                      >
                        <Clock size="20" className="text-iconColor" />
                      </ListSetup>
                      <span className="text-sm text-[#666666]">
                        Mon - Fri 9:00 PM - 17:00 AM
                      </span>
                    </ListSetup>
                  </ListSetup>
                </div>
              </Row>
            </div>
          </Row>

          <div className="flex flex-col md:flex-row justify-center items-center ">
            <div className="gap-2 mt-8 text-xs font-bold">
              © 2025 Brainwave. All rights reserved.
            </div>
          </div>
        </div>
      </Footer>
    </>
  );
}
