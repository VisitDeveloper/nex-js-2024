// import { NextRequest, NextResponse } from "next/server";
// import { sign } from 'jsonwebtoken';
// // import { headers, cookies } from 'next/headers';
// import { serialize } from 'cookie'
// import { COOKIE_NAME } from "config/constant";
// import connecMongoDB from "lib/mongodg";
// import bcrypt from 'bcrypt'; // bcrypt برای هش کردن رمز عبور
// import User from "@/app/_models/user";


// const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// export async function POST(request: Request) {

//     await connecMongoDB();

//     const { email, password } = await request.json();

//     const user = await User.findOne({ email })

//     if (!user) {
//         return NextResponse.json({
//             message: 'Invalid credentials'
//         }, { status: 401 });
//     }


//     // بررسی صحت رمز عبور
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//         return NextResponse.json({
//             message: 'Invalid credentials'
//         }, { status: 401 });
//     }

//     // Always check this
//     const secret = process.env.JWT_SECRET || ''
//     const token = sign(
//         {
//             userId: user._id,
//             email: user.email,
//         },
//         secret,
//         {
//             expiresIn: MAX_AGE
//         }
//     )

//     const serialized = serialize(COOKIE_NAME, token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: MAX_AGE,
//         path: '/'
//     })

//     const response = {
//         massage: 'Authenticated'
//     }


//     return NextResponse.json({
//         response,
//     }, {
//         status: 200,
//         headers: {
//             'Set-cookie': serialized
//         }
//     })
// }

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import User from "model/api/user";
import connecMongoDB from "lib/mongodg";
import { COOKIE_NAME, MAX_AGE } from "config/constant";
import { serialize } from "cookie";
import { sign } from "jsonwebtoken";

const registerUserSchema = z
    .object({
        userName: z.string(),
        email: z.string().email(),
        password: z
            .string()
            .min(4, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
        //   .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
        //   .regex(/[a-z]/, "رمز عبور باید حداقل یک حرف کوچک داشته باشد")
        //   .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد")
        //   .regex(/[^A-Za-z0-9]/, "رمز عبور باید حداقل یک کاراکتر خاص داشته باشد"),
        role: z.enum(["admin", "user"]).default("user"), // نقش کاربر (پیش‌فرض: user)
        avatar: z.string().optional(),
    });

export async function POST(req: NextRequest) {

    try {
        await connecMongoDB();
        const body = await req.json();
        const validatedData = registerUserSchema.parse(body);


        const existingUser = await User.findOne({ email: validatedData.email });
        if (existingUser) {
            return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
        }

        const existingAdmin = await User.findOne({ role: "admin" });

        if (validatedData.role === "admin" && existingAdmin) {
            return NextResponse.json({ error: "There is an admin in the system and it is not possible to create a new admin." }, { status: 403 });
        }

        const role = existingAdmin ? "user" : "admin";



        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const newUser = new User({
            ...validatedData,
            password: hashedPassword,
            role
        });

        await newUser.save();


        const secret = process.env.JWT_SECRET || ''
        const token = sign(
            {
                userId: newUser._id,
                email: newUser.email,
                role: newUser.role
            },
            secret,
            {
                expiresIn: MAX_AGE
            }
        )


        const serialized = serialize(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: MAX_AGE,
            path: '/'
        })

        const responseMessage = {
            message: 'User registered successfully'
        };

        const response = NextResponse.json(responseMessage, {
            status: 201,
            headers: {
                'Set-cookie': serialized
            }
        });
        return response


    } catch (error) {
        return NextResponse.json({ error: "There was a problem" }, { status: 500 });
    }

}