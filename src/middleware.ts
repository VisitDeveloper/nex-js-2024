import { NextResponse } from "next/server";
import { COOKIE_NAME } from "config/constant";
import { type NextRequest } from "next/server";
// const isLoggedIn : boolean = false; 

// export function middleware(request : Request){
//     if(isLoggedIn){
//         return  NextResponse.next()
//     }
//     return  NextResponse.redirect(new URL('/', request.url))
// }

export function middleware(request: NextRequest) {
    const response = NextResponse.next(); // ادامه به درخواست بعدی
    const cookieStore = request.cookies.get(COOKIE_NAME)
    // اگر کد وضعیت 403 باشد، کاربر را به صفحه اصلی هدایت کن
    if (response.status === 403 || response.status === 401 || !cookieStore) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response;
}


export const config = {
    matcher: ['/dashboard/:path*'], // مسیرهایی که می‌خواهید میدلور بر روی آنها کار کند
};
