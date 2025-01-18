// 'use client';
// import { useEffect, useState } from "react";
// import { useTranslation } from "config/i18n/index";


// export const useLanguageClient = (lng: any, fileName?: string) => {
//     const [t, setT] = useState<(key: string) => string>(() => (key: string) => key); // پیش‌فرض برای جلوگیری از undefined

//     useEffect(() => {
//         const loadTranslation = async () => {
//             const { t } = await useTranslation(lng, [`${fileName}`]);
//             setT(() => t); // تابع t را در state ذخیره می‌کنیم
//         };

//         loadTranslation();
//     }, [lng]);

//     return { t }
// }


'use client';
import { useEffect, useState } from "react";
import { useTranslation } from "config/i18n/index";

export const useLanguageClient = (lng: any, fileName?: string) => {
    const [t, setT] = useState<(key: string) => string>(() => (key: string) => key); // پیش‌فرض برای جلوگیری از undefined

    useEffect(() => {
        const loadTranslation = async () => {
            const { t } = await useTranslation(lng, [fileName]);
            setT(() => t); // تابع t را در state ذخیره می‌کنیم
        };

        if (fileName) {
            loadTranslation();
        }
    }, [lng, fileName]);  // اضافه کردن fileName به آرایه وابستگی‌ها

    return { t }
};
