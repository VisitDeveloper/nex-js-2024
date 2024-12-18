


// import { Label } from "@/components/ui/label"
// import { Switch } from "@/components/ui/switch"
// import { useTheme } from 'next-themes'
// import { useEffect, useState } from "react";

// export default function SwitchSimple() {
//     const { setTheme } = useTheme();
//     const [statusTheme, setStatusTheme] = useState<boolean>(false)

//     useEffect(() => {
//         if (!statusTheme) {
//             setTheme('light')
//         } else {
//             setTheme('dark')
//         }
//     }, [statusTheme])

//     return (
//         <div className="flex items-center space-x-2">
//             <Switch id="airplane-mode" checked={statusTheme} onChange={() => setStatusTheme(!statusTheme)} />
//             <Label htmlFor="airplane-mode">Airplane Mode</Label>
//         </div>
//     )
// }


"use client"
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { useTheme } from 'next-themes'
import { useEffect, useState } from "react";

import { cn } from "lib/utils"
import { Label } from "@radix-ui/react-label";

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
            )}
        />
    </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }


export default function SwitchSimple() {
    const { setTheme } = useTheme();
    const [statusTheme, setStatusTheme] = useState<boolean>(false);

    useEffect(() => {
        // تغییر تم بر اساس وضعیت
        setTheme(statusTheme ? 'dark' : 'light');
    }, [statusTheme]);

    return (
        <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" checked={statusTheme}
                onClick={() => setStatusTheme(!statusTheme)}
                className={`${statusTheme ? 'bg-gray-800' : 'bg-gray-200'}`}
            />
            <Label htmlFor="airplane-mode">
                {
                
                }
                </Label>
        </div>
    )
}