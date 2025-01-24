// 'use client'
// import { useInView } from 'react-intersection-observer';
// import { AnimationControls, useAnimation } from 'framer-motion';
// import { useEffect } from 'react';

// export const useScroll = (): [any, AnimationControls] => {
//     const controls = useAnimation();
//     const [element, view] = useInView({ threshold: 0.5 });

//     // استفاده از useEffect برای فراخوانی controls.start بعد از مونت شدن کامپوننت
//     useEffect(() => {
//         if (view) {
//             controls.start('show');
//         } else {
//             controls.start('hidden');
//         }
//     }, [view, controls]);

//     return [element, controls];
// };

'use client';
import { useInView } from 'react-intersection-observer';
import { AnimationControls, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

export const useScroll = (): [any, AnimationControls] => {
    const controls = useAnimation();
    const [element, view] = useInView({ threshold: 0.5 });
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (view && !hasAnimated) {
            controls.start('show');
            setHasAnimated(true); // فقط یک بار انیمیشن اجرا شود
        }
    }, [view, hasAnimated, controls]);

    return [element, controls];
};
