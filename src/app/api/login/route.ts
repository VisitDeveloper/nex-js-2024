import connecMongoDB from "lib/mongodg";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'
import User from "model/api/user";
import bcrypt from 'bcrypt';
import { sign } from "jsonwebtoken";
import { serialize } from "cookie";
import { COOKIE_NAME, MAX_AGE } from "config/constant";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(4),
});


export async function POST(req: NextRequest) {
    try {
        await connecMongoDB();
        const { email, password } = await req.json();
        const validatedData = loginSchema.parse({ email, password });


        const user = await User.findOne({ email: validatedData.email });
        if (!user) {
            return NextResponse.json({ error: "User with this email address was not found." }, { status: 404 });
        }

        // if (!user.isVerified) {
        //     return NextResponse.json({ error: "Please verify your email first." }, { status: 403 });
        // }

        const isMatch = await bcrypt.compare(validatedData.password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "The password is incorrect." }, { status: 401 });
        }



        const secret = process.env.JWT_SECRET || ''
        const token = sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
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

        const response = NextResponse.json({
            message: "Login was successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
        response.headers.set("Set-Cookie", serialized)
        return response
    } catch (error) {
        return NextResponse.json({ error: "مشکلی پیش آمد" }, { status: 500 });

    }
}