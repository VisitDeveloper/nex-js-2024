"use client"
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useTheme } from 'next-themes'
import { useEffect, useState } from "react";
import { cn } from "lib/utils"
import { Label } from "@radix-ui/react-label";
import { Moon, Sun1 } from 'iconsax-react';


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


export default function SwitchSimpleTheme() {
    const { setTheme } = useTheme();
    const [statusTheme, setStatusTheme] = useState<boolean>(false);

    // Load theme status from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            const isDark = savedTheme === 'dark';
            setStatusTheme(isDark);
            setTheme(isDark ? 'dark' : 'light'); // Set theme based on saved state
        }
    }, [setTheme]);

    // Save theme status to localStorage when statusTheme changes
    useEffect(() => {
        localStorage.setItem('theme', statusTheme ? 'dark' : 'light');
        setTheme(statusTheme ? "dark" : "light");
    }, [statusTheme]);

    return (
        <div className="flex items-center space-x-2">
            <Switch id="airplane-mode" checked={statusTheme}
                onClick={() => setStatusTheme(!statusTheme)}
                className={`${statusTheme ? 'bg-gray-800' : 'bg-gray-200'}`}
            />
            <Label htmlFor="airplane-mode">
                {statusTheme ? <>

                    <Sun1 size="20" className="dark:text-white cursor-pointer" />
                </> : <>
                    <Moon size="20" className="dark:text-black cursor-pointer" />
                </>
                }
            </Label>
        </div>
    )
}