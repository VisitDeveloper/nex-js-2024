import { Div, Span } from "components";
import React from "react";

interface ToolTipProps {
    children: React.ReactNode;
    text: string | React.ReactNode;
}

function Tooltip(props: ToolTipProps) {
    const { text, children } = props;
    return (
        <Div className="group relative cursor-pointer">
            {children}
            <Span
                className="
                m-auto
            text-center
            absolute 
            bottom-16 
            left-0
            right-0
            w-fit
            scale-0 
            transition-all 
            rounded 
            dark:bg-slate-200
            dark:text-black

            bg-slate-700
            bg-Gray600
            p-1
            text-xs 
            text-white 
            group-hover:scale-100"
            >
                {text}
            </Span>
        </Div>
    );
}

export default Tooltip;