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
      className={cn(
        "px-5 xl:px-0",
        "relative flex justify-center items-center gap-12 py-16"
      )}
    >
      <div className="h-full flex flex-col lg:flex-row gap-16 items-stretch w-full max-w-screen-xl mx-auto">
        <div className="basis-full lg:basis-1/2 flex flex-grow items-start flex-shrink-0 flex-col justify-center gap-8">
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
                  title: "What is BrainWave?",
                  description:
                    "BrainWave is an innovative educational platform offering interactive app books and dyslexia-friendly tools to help children develop literacy skills in a fun and engaging way.",
                },
                {
                  title: "⁠Who are BrainWave’s learning apps designed for?",
                  description: `Our apps are designed for young learners aged 2-9 years, focusing on early literacy, reading comprehension, and dyslexia-friendly support.`,
                },
                {
                  title:
                    "How do BrainWave’s dyslexia-friendly tools help children?",
                  description: `We use multi-sensory learning techniques, including text-to-speech, adjustable fonts, and interactive storytelling, making reading easier and more accessible for children with dyslexia.`,
                },
                {
                  title:
                    "Are the BrainWave apps accessible on different devices?",
                  description: `Yes! Our apps work on tablets, smartphones, and computers, ensuring easy access anytime, anywhere.`,
                },
                {
                  title:
                    "How can parents and educators get started with BrainWave?",
                  description: `Simply download our app, explore the free trial content, and customize the learning experience based on your child’s needs.`,
                },
              ].map((item, index) => {
                return (
                  <AccordionItem
                    key={`item-${index}`}
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

        <div className="basis-full lg:basis-1/2 relative flex-grow flex-shrink-0 h-full flex justify-center items-center">
          <div className="relative aspect-square w-full max-w-screen-sm">
            <Image alt="hero" fill src="/bg-knows.svg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowMore;
