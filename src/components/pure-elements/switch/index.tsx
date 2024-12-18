import { useTheme } from 'next-themes'
import React from 'react'

export default function Switch() {
    const { setTheme } = useTheme()
    return (
        <div>
            <div onClick={() => setTheme('light')}>
                Light
            </div>
            /
            <div onClick={() => setTheme('dark')}>
                Dark
            </div>
        </div>
    )
}
