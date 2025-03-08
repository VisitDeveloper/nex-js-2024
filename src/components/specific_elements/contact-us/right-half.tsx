import { Call, Location, Map1, Signpost, Sms } from "iconsax-react";
import { Map, Marker } from "pigeon-maps";

import ListSetup from "components/wrapper-elements/ListSetup";
import React from "react";
import { motion } from "motion/react";

export default function RightHalf() {
  // مختصات مرکز ایالت میشیگان
  const lat = 44.3148;
  const lng = -85.6024;
  return (
    <div className="w-full md:w-1/2 p-4">
      <motion.div className="font-bold text-3xl mt-5 flex flex-row gap-2 items-center justify-start">
        <Signpost size="30" className="text-white" />
        Address
      </motion.div>
      {/* <motion.div className="w-full h-[2px] bg-iconColor mt-[0px]"></motion.div> */}
      <div className="mt-5 space-y-4">
        <ListSetup direction="col" justifyContent="start" alignItems="start">
          <ListSetup
            direction="row"
            justifyContent="start"
            alignItems="center"
            className="gap-2"
          >
            {/* <Location size="20" className="text-iconColor" /> */}
            <div className="text-lg font-semibold">Location</div>
          </ListSetup>
          <span className="text-sm font-thin">
            description dolores autdolore veritatis porro
          </span>
        </ListSetup>
        <ListSetup direction="col" justifyContent="start" alignItems="start">
          <ListSetup
            direction="row"
            justifyContent="start"
            alignItems="center"
            className="gap-2"
          >
            {/* <Sms size="20" className="text-iconColor" /> */}
            <div className="text-lg font-semibold">E-mail</div>
          </ListSetup>
          <span className="text-sm font-thin">textemail@yahoo.com</span>
        </ListSetup>
        <ListSetup direction="col" justifyContent="start" alignItems="start">
          <ListSetup
            direction="row"
            justifyContent="start"
            alignItems="center"
            className="gap-2"
          >
            {/* <Call size="20" className="text-iconColor" /> */}
            <div className="text-lg font-semibold">Telephone</div>
          </ListSetup>
          <span className="text-sm font-thin">+1-50-044-5450</span>
        </ListSetup>

        <ListSetup direction="col" justifyContent="start" alignItems="start">
          <ListSetup
            direction="row"
            justifyContent="start"
            alignItems="center"
            className="gap-2 my-4"
          >
            {/* <Map1 size="20" className="text-iconColor" /> */}
            <div className="text-lg font-semibold">Map</div>
          </ListSetup>
          <span
            className="text-sm font-thin rounded-2xl overflow-hidden"
            style={{ height: "300px", width: "100%" }}
          >
            <Map height={300} defaultCenter={[lat, lng]} defaultZoom={11}>
              <Marker width={50} height={25} anchor={[lat, lng]} />
            </Map>
          </span>
        </ListSetup>
      </div>
    </div>
  );
}
