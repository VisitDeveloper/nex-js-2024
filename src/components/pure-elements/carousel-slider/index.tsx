import React, { useEffect, useState } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { fadeAnime } from 'config/animation';
import Card from '../card';
import useMeasure from 'react-use-measure';

export default function Carousel() {
    const images = [
        '/theme.png',
        '/theme.png',
        '/theme.png',
        '/theme.png',
        '/theme.png',
        '/theme.png',
        '/theme.png',
        '/theme.png',
    ];
    const FAST_DURATION = 25;
    const SLOW_DURATION = 75;

    const [duration, setDuration] = useState(FAST_DURATION);
    const [ref, { width }] = useMeasure();
    const xTranslation = useMotionValue(0);
    const [mustFinish, setMustFinish] = useState(false);
    const [rerender, setRerender] = useState(false);

    useEffect(() => {
        let controls;
        const finalPosition = -width / 2 - 8; // Changed `let` to `const`

        if (mustFinish) {
            controls = animate(xTranslation, [xTranslation.get(), finalPosition], {
                ease: 'linear',
                duration: duration * (1 - xTranslation.get() / finalPosition),
                onComplete: () => {
                    setMustFinish(false);
                    setRerender((prev) => !prev);
                },
            });
        } else {
            controls = animate(xTranslation, [0, finalPosition], {
                ease: 'linear',
                duration: duration,
                repeat: Infinity,
                repeatType: 'loop',
                repeatDelay: 0,
            });
        }

        return controls?.stop;
    }, [rerender, xTranslation, duration, width, mustFinish]); // Added `mustFinish` to dependencies

    return (
        <>
            <motion.div
                variants={fadeAnime}
                initial="hidden"
                animate="show"
                className="pt-40 pb-20"
            >
                <motion.div
                    className="absolute left-0 flex gap-4"
                    style={{ x: xTranslation }}
                    ref={ref}
                    onHoverStart={() => {
                        setMustFinish(true);
                        setDuration(SLOW_DURATION);
                    }}
                    onHoverEnd={() => {
                        setMustFinish(true);
                        setDuration(FAST_DURATION);
                    }}
                >
                    {[...images, ...images].map((item, idx) => (
                        <Card image={`${item}`} key={idx} />
                    ))}
                </motion.div>
            </motion.div>
        </>
    );
}
