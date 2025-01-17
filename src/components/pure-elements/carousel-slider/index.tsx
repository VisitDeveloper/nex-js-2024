
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

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); // عرض 768 پیکسل برای موبایل
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let controls;
        const cardWidth = isMobile ? 120 : 200; // عرض کارت بر اساس حالت موبایل یا دسکتاپ
        const gap = isMobile ? 8 : 16; // فاصله بین کارت‌ها
        const totalWidth = (cardWidth + gap) * images.length; // محاسبه کل عرض کارت‌ها

        const finalPosition = -totalWidth; // موقعیت نهایی برای انیمیشن

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
    }, [rerender, xTranslation, duration, width, mustFinish, isMobile]);

    return (
        <div
            className="relative overflow-hidden w-full md:block hidden" // جلوگیری از اسکرول صفحه
            style={{
                height: isMobile ? 150 : 300, // ارتفاع متناسب با موبایل و دسکتاپ
            }}
        >
            <motion.div
                variants={fadeAnime}
                initial="hidden"
                animate="show"
                className="pt-20 pb-10"
            >
                <motion.div
                    className="absolute left-0 flex"
                    style={{
                        x: xTranslation,
                        gap: isMobile ? '8px' : '16px', // فاصله بین کارت‌ها
                    }}
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
                        <Card
                            image={`${item}`}
                            key={idx}
                            style={{
                                width: isMobile ? '120px' : '200px', // تنظیم عرض کارت
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}

