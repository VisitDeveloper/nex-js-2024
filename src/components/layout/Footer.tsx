import {
  Call,
  Clock,
  Facebook,
  Home,
  InfoCircle,
  Instagram,
  Location,
  MessageEdit,
  MobileProgramming,
  NoteText,
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
import { Span } from "components/index";
import { cn } from "lib/utils";

export default function FooterLayout({ ...props }) {
  const ArrayRouteFooter: Array<RouteHeader> = [
    {
      id: 0,
      name: "Home",
      route: `/`,
      icon: <Home size="20" className="text-iconColor" />,
    },
    {
      id: 1,
      name: "Weblog",
      route: `/`,
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
      route: "/contact-us",
      icon: <NoteText size="20" className="text-iconColor" />,
    },
  ];

  return (
    <>
      <Footer
        {...props}
        className={cn(
          "text-black bg-gradient-to-br from-[#FEF6EC] to-[#EDFEFC] relative pb-32",
          "before:absolute before:z-[1] before:content-[''] before:bg-[url('/pattern-wave.png')] before:bg-repeat-x before:w-full before:bottom-8 before:left-0 before:h-6"
        )}
      >
        <div className="h-auto py-8 pt-32 max-w-screen-2xl mx-auto">
          <Row className="gap-4">
            <div className="md:col-span-4 col-span-12">
              <ListSetup
                className="gap-4"
                alignItems="start"
                direction="col"
                justifyContent="start"
              >
                <div className="font-bold text-3xl mt-5">Address</div>

                <ListSetup
                  direction="col"
                  justifyContent="start"
                  alignItems="start"
                >
                  <ListSetup
                    direction="row"
                    justifyContent="start"
                    alignItems="center"
                    className="gap-2"
                  >
                    <Location size="20" className="text-iconColor" />
                    <div className="text-lg">Location</div>
                  </ListSetup>
                  <span className="text-sm text-[#8d8d8e]">
                    description dolores autdolore veritatis porro
                  </span>
                </ListSetup>
                <ListSetup
                  direction="col"
                  justifyContent="start"
                  alignItems="start"
                >
                  <ListSetup
                    direction="row"
                    justifyContent="start"
                    alignItems="center"
                    className="gap-2"
                  >
                    <Sms size="20" className="text-iconColor" />
                    <div className="text-lg ">E-mail</div>
                  </ListSetup>
                  <span className="text-sm text-[#8d8d8e]">
                    textemail@yahoo.com
                  </span>
                </ListSetup>
                <ListSetup
                  direction="col"
                  justifyContent="start"
                  alignItems="start"
                >
                  <ListSetup
                    direction="row"
                    justifyContent="start"
                    alignItems="center"
                    className="gap-2"
                  >
                    <Call size="20" className="text-iconColor" />
                    <div className="text-lg ">Telephone</div>
                  </ListSetup>
                  <span className="text-sm text-[#8d8d8e]">+1-50-044-5450</span>
                </ListSetup>

                <ListSetup
                  direction="col"
                  justifyContent="start"
                  alignItems="start"
                >
                  <ListSetup
                    direction="row"
                    justifyContent="start"
                    alignItems="center"
                    className="gap-2"
                  >
                    <Clock size="20" className="text-iconColor" />
                    <div className="text-lg ">Working-Hours</div>
                  </ListSetup>
                  <span className="text-sm text-[#8d8d8e]">
                    Mon - Fri 9:00 PM - 17:00 AM
                  </span>
                </ListSetup>
              </ListSetup>
            </div>

            <div className="md:col-span-4 col-span-12">
              <ListSetup
                className="gap-4"
                alignItems="start"
                direction="col"
                justifyContent="start"
              >
                <div className="text-3xl mt-5 font-bold">Quick Links</div>

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

            <div className="md:col-span-4 col-span-12 flex flex-col w-full items-end gap-8">
              <ListSetup
                className="gap-4"
                alignItems="center"
                direction="col"
                justifyContent="center"
              >
                <div className="font-thin text-3xl mt-5">
                  <Image alt="logo" src="/logo.png" width={128} height={128} />
                </div>
                <span className="font-semibold">Brain wave Children</span>
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
          </Row>

          <div className="flex flex-col md:flex-row justify-between items-center ">
            <div className="gap-2 mt-8 text-xs font-bold">
              © 2025 Brainwave. All rights reserved.
            </div>
          </div>
        </div>
      </Footer>
    </>
  );
}
