'use client'
import { useInView } from 'react-intersection-observer';
import { AnimationControls, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export const useScroll = (): [(node?: Element | null | undefined) => void, AnimationControls] => {
    const controls = useAnimation();
    const [element, view] = useInView({ threshold: 0.5 });

    // استفاده از useEffect برای فراخوانی controls.start بعد از مونت شدن کامپوننت
    useEffect(() => {
        if (view) {
            controls.start('show');
        } else {
            controls.start('hidden');
        }
    }, [view, controls]);

    return [element, controls];
};