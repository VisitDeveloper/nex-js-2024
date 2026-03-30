// 'use client'
// import { useInView } from 'react-intersection-observer';
// import { AnimationControls, useAnimation } from 'framer-motion';
// import { useEffect } from 'react';

// export const useScroll = (): [any, AnimationControls] => {
//     const controls = useAnimation();
//     const [element, view] = useInView({ threshold: 0.5 });

//     // Use useEffect to start controls after mount
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
            setHasAnimated(true); // Run animation only once
        }
    }, [view, hasAnimated, controls]);

    return [element, controls];
};
