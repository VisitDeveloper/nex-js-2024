
import Tooltip from 'components/pure-elements/toltip'
import ListSetup from 'components/wrapper-elements/ListSetup'
import { Home, InfoCircle, MessageEdit, MobileProgramming, NoteText } from 'iconsax-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import React, { JSX } from 'react'

interface MobileNavigationArray {
    id: number;
    tooltipText: string;
    route?: string;
    icon: React.ReactNode | React.ReactElement | JSX.Element;
}

function MobileNavigation() {

    const ArrayNavigation: Array<MobileNavigationArray> = [
        {
            id: 0,
            tooltipText: 'Contact',
            route: '/contact-us',
            icon: <NoteText size="35" className='text-iconColor' />
        },
        {
            id: 1,
            tooltipText: 'About',
            route: '/about',
            icon: <InfoCircle size="35" className='text-iconColor' />
        },
        {
            id: 2,
            tooltipText: 'Home',
            route: '/',
            icon: <Home size="35" className='text-iconColor' />
        },
        {
            id: 3,
            tooltipText: 'Weblog',
            route: '/weblog',
            icon: <MessageEdit size="35" className='text-iconColor' />
        },
        {
            id: 4,
            tooltipText: 'Application',
            route: '/application-page',
            icon: <MobileProgramming size="35" className='text-iconColor' />

        }
    ]

    return (
        <>
            <div
                className="backdrop-blur-sm
                    dark:bg-blackRgba
                border-2 border-solid border-iconColor flex 
                justify-between items-center w-[350px]  sm:w-[420px] mx-auto rounded-3xl h-[80px] 
                fixed bottom-2 right-0 left-0 z-10 md:hidden"

            >
                <ListSetup className='gap-0 sm:gap-2 w-full sm:p-4 p-2' alignItems='center' direction='row' justifyContent='between'>

                    {ArrayNavigation.length !== 0 && ArrayNavigation.map((item: MobileNavigationArray) => {
                        return (
                            <>
                                <Tooltip text={item.tooltipText} key={item.id}>
                                    <Link href={`${item.route}`}
                                        className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out bg-miniBackground flex justify-center items-center sm:size-14 size-12 rounded-2xl cursor-pointer text-center"
                                    >
                                        {item.icon}
                                    </Link>
                                </Tooltip>
                            </>
                        )
                    })}


                </ListSetup>
            </div>
        </>
    )
}
export default MobileNavigation