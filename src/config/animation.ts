import { Variants } from "motion/react"

export const pageAnimation = {
    hidden: {
        opacity: 0,
        y: 100
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            // when:'beforeChildren',
            // staggerChildren:0.25,
        }
    },
    exit: {
        opacity: 0,
        y: 100,
        transition: {
            duration: 0.3,

        }
    }
}

export const titleAnim = {
    animate: {
        y: 0,
        transition: { duration: 0.75, ease: 'easeOut' }
    },
    initial: { y: 200 },
}






export const lineAnim = {
    hidden: {
        width: '0%'
    },
    show: {
        width: '100%',
        transition: { duration: 1 },
    }
}

export const slider = {
    hidden: {
        x: '-130%',
        skew: '45deg'
    },
    show: {
        x: '100%',
        skew: '0deg',
        transition: { ease: 'easeOut', duration: 1 },
    }
}

export const sliderContainer = {
    hidden: {
        opacity: 1
    },
    show: {
        opacity: 1,
        transition: {
            ease: 'easeOut',
            duration: 1,
            staggerChildren: 0.15
        },
    }
}

export const scrollReveal = {
    hidden: {
        opacity: 0,
        scale: 1.2,
        transition: {
            duration: 0.5,
        },
    },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
        },
    }
}

//  new generation 

export const introduceVariants: Variants = {
    open: {
        transition: {
            staggerChildren: 0.3, // فاصله بین انیمیشن هر عنصر
        },
    },
    closed: {},
};

export const introduceitemVariants: Variants = {
    open: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};


export const threeElementsVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3, // زمان‌بندی برای نمایش هر آیتم
        },
    },
};

export const ThreeElementitemVariants = {
    hidden: { opacity: 0, y: 50 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export const fadeAnime: Variants = {
    hidden: { 
        opacity: 0,
        y: 20, // اضافه شدن حرکت به سمت پایین
        transition: {
            duration: 0.5, // کنترل سرعت انیمیشن در حالت پنهان
            ease: 'easeIn'
        }
    },
    show: {
        opacity: 1,
        y: 0, // بازگشت به موقعیت اولیه
        transition: {
            ease: 'easeOut',
            duration: 0.75, // کنترل سرعت انیمیشن در حالت نمایش
            delay: 0.2, // اضافه کردن تأخیر برای شروع انیمیشن
        }
    },
    exit: { 
        opacity: 0,
        y: -20, // حرکت به سمت بالا هنگام خروج
        transition: {
            duration: 0.5,
            ease: 'easeInOut'
        }
    }
};


export const photoAnime: Variants= {
    hidden: {
        scale: 1.2, // Increased scale for a more pronounced effect
        opacity: 0,
    },
    show: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 1, // Longer duration for smoother transition
            ease: 'easeInOut', // Easier transition both ways
            delay: 0.2, // Adding a small delay for a smoother appearance
        }
    }
}