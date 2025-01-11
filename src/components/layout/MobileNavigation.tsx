'use client'
import Tooltip from 'components/pure-elements/toltip'
import ListSetup from 'components/wrapper-elements/ListSetup'
import { Home, InfoCircle, MessageEdit, NoteText, Setting3 } from 'iconsax-react'
import { useTheme } from 'next-themes'
import React from 'react'

function MobileNavigation() {
    const { theme } = useTheme()
    return (
        <>
            <div
                style={{ backgroundColor: theme === 'dark' ? "rgba(15, 15, 15, 0.6)" : 'rgba(255, 255, 255, 0.32)', border: theme === 'dark' ? '1px solid rgba(39, 39, 39, 0.3)' : '1px solid rgba(255, 255, 255, 0.3)' }}
                className="backdrop-blur-sm flex justify-between items-center w-[420px] mx-auto rounded-3xl h-[80px] fixed bottom-2 right-0 left-0 z-10"
            >
                <ListSetup className='gap-2 w-full p-4' alignItems='center' direction='row' justifyContent='between'>

                    <Tooltip text="Contact">
                        <ListSetup direction='col' alignItems='center' justifyContent='center' className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out dark:bg-neutral-900 bg-[#888] flex justify-center items-center size-14 rounded-2xl cursor-pointer text-center">
                            <NoteText size="35" className='text-iconColor' />
                        </ListSetup>
                    </Tooltip>

                    <Tooltip text="About">
                        <ListSetup direction='col' alignItems='center' justifyContent='center' className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out dark:bg-neutral-900 bg-[#888] flex justify-center items-center size-14 rounded-2xl cursor-pointer text-center">
                            <InfoCircle size="35" className='text-iconColor' />
                        </ListSetup>
                    </Tooltip>

                    <Tooltip text="Home">
                        <ListSetup direction='col' alignItems='center' justifyContent='center' className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out dark:bg-neutral-900 bg-[#888] flex justify-center items-center size-14 rounded-2xl cursor-pointer text-center">
                            <Home size="35" className='text-iconColor' />
                        </ListSetup>
                    </Tooltip>

                    <Tooltip text="Weblog">
                        <ListSetup direction='col' alignItems='center' justifyContent='center' className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out dark:bg-neutral-900 bg-[#888] flex justify-center items-center size-14 rounded-2xl cursor-pointer text-center">
                            <MessageEdit size="35" className='text-iconColor' />
                        </ListSetup>
                    </Tooltip>

                    <Tooltip text="Setting">
                        <ListSetup direction='col' alignItems='center' justifyContent='center' className="hover:shadow-normalLight dark:hover:shadow-normal hover:transition hover:duration-500 duration-500 hover:ease-in-out dark:bg-neutral-900 bg-[#888] flex justify-center items-center size-14 rounded-2xl cursor-pointer text-center">
                            <Setting3 size="35" className='text-iconColor' />
                        </ListSetup>
                    </Tooltip>
                </ListSetup>
            </div>
        </>
    )
}
export default MobileNavigation