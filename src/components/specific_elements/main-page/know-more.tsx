import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "components/pure-elements/accordion";

import Image from "next/image";
import { cn } from "lib/utils";
import { useState } from "react";

const KnowMore = () => {
  const [selected, setSelected] = useState("item-0");

  return (
    <div
      className={cn("relative flex justify-center items-center gap-12 py-12")}
    >
      <div className="h-full flex items-stretch w-full max-w-screen-2xl">
        <div className="basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
          <h5 className="font-bold text-5xl">Know more about BrainWave</h5>

          <div className="w-full mt-12">
            <Accordion
              type="single"
              onValueChange={(value) => setSelected(value)}
              defaultValue={"item-0"}
              collapsible
              className="w-full space-y-4"
            >
              {[
                {
                  title: "Is it accessible?",
                  description:
                    "Yes. It adheres to the WAI-ARIA design pattern.",
                },
                {
                  title: "Is it styled?",
                  description: `Yes. It comes with default styles that matches the other
                  components&apos; aesthetic.`,
                },
                {
                  title: "Is it animated?",
                  description: `Yes. It&apos;s animated by default, but you can disable it if
                  you prefer.`,
                },
              ].map((item, index) => {
                return (
                  <AccordionItem
                    value={`item-${index}`}
                    className="border border-[#DFDFDF] shadow rounded-2xl overflow-hidden"
                  >
                    <AccordionTrigger
                      className={cn(
                        "px-6 py-4 bg-white rounded-xl overflow-hidden",
                        {
                          "bg-[#FEA439] text-white font-medium":
                            selected === `item-${index}`,
                        }
                      )}
                      iconClassName={cn(
                        "bg-white size-6 border border-black text-black rounded-full",
                        {
                          "border-none": selected === `item-${index}`,
                        }
                      )}
                    >
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="bg-white px-6 py-6">
                      {item.description}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
        <div className="basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
          <div className="relative aspect-square w-full max-w-screen-sm">
            <Image alt="hero" fill src="/bg-knows.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowMore;
