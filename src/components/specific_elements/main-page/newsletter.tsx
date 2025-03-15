import Button from "components/pure-elements/button";
import { Send } from "lucide-react";
import { cn } from "lib/utils";

const Newsletter = () => {
  return (
    <div
      className={cn("px-5 xl:px-0", "z-10 relative translate-y-1/2 -mt-44")}
    >
      <div
        className={cn(
          "flex flex-col justify-center items-center gap-8 text-white",
          "bg-[#26BEB3]/80 w-full rounded-2xl mx-auto max-w-screen-xl p-8 pb-24 lg:pb-8 h-96 relative overflow-hidden",
          "before:content-[''] before:absolute before:-z-10 before:bg-[url('/bg-newsletter.png')] before:bg-cover before:w-full before:h-full before:inset-0"
        )}
      >
        <div className="flex flex-col text-center justify-center items-center gap-4">
          <h3 className="text-3xl font-bold">Join Our Newsletter</h3>
          <p className="font-thin">
            Subscribe to our newsletter to get updated on our latest and new
            activities
          </p>
        </div>

        <div className="max-w-lg w-full mx-auto">
          <form
            action=""
            method="POST"
            className="bg-white rounded-full relative p-6 py-4 h-14"
          >
            <input
              type="email"
              className="placeholder:text-[#747474] w-full outline-none text-black"
              placeholder="Your Email"
            />
            <Button
              type="submit"
              className={cn(
                "bg-[#FEA439] rounded-full py-4 shadow-none px-8 h-12 flex items-center gap-2",
                "absolute lg:right-1 lg:top-1 top-20 left-1/2 -translate-x-1/2 lg:translate-x-0"
              )}
            >
              <Send />
              <span>Subscribe now</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
