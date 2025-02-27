"use client";

import { Fade } from "react-slideshow-image";
import Image from "next/image";

interface ImageType {
  id: number;
  alternativeText: string | null;
  caption: string | null;
  url: string;
}

interface SlidShowProps {
  files: { data: Array<{ attributes: ImageType }> };
}

function SlideShow({ data }: { data: SlidShowProps }) {
  return (
    <div className="slide-container">
      <Fade>
        {[...(data.files?.data || [])].map(
          (fadeImage: { attributes: ImageType }, index: number) => {
            const imageUrl = `${process.env.NEXT_PUBLIC_BASE_IMAGE_URL}${fadeImage?.attributes?.url}`;
            return (
              <div key={index}>
                {imageUrl && (
                  <Image
                    className="w-full h-96 object-cover rounded-lg"
                    height={400}
                    width={600}
                    alt="alt text"
                    src={imageUrl}
                  />
                )}
              </div>
            );
          }
        )}
      </Fade>
    </div>
  );
}

export default SlideShow;
