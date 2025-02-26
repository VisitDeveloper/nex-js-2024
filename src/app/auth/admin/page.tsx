'use client'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "components/pure-elements/form/index"
import { Input, Button, SwitchSimpleTheme } from "components"
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft3, Star1 } from 'iconsax-react'
import { useRouter } from 'next/navigation'
import { color } from 'motion/react'

const FormSchema = z.object({
    email: z.string().email("Invalid email address.").min(2, {
        message: "Email must be at least 2 characters.",
    }),
    password: z.string().min(4, {
        message: "Password must be at least 4 characters.",
    }),

})

// password: z.string()
//       .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
//       .regex(/[A-Z]/, "رمز عبور باید حداقل یک حرف بزرگ داشته باشد")
//       .regex(/[a-z]/, "رمز عبور باید حداقل یک حرف کوچک داشته باشد")
//       .regex(/[0-9]/, "رمز عبور باید حداقل یک عدد داشته باشد")
//       .regex(/[^A-Za-z0-9]/, "رمز عبور باید حداقل یک کاراکتر خاص داشته باشد"),

export default function Auth() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        console.log(JSON.stringify(data, null, 2))

        // if (formRef.current) {
        //     emailjs
        //         .sendForm(
        //             env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        //             env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        //             formRef.current,
        //             {
        //                 publicKey: env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
        //             },
        //         )
        //         .then(
        //             () => {
        //                 form.reset(); //clear the fields after submission
        //             },
        //             (error) => {
        //                 console.warn("FAILED...", JSON.stringify(error));
        //             },
        //         );
        // }

    }

    const router = useRouter();

    return (
        <>
            <div className={`rounded-3xl shadow-lg md:w-[700px] md:h-[400px] bg-miniBackground  flex  gap-2 flex-row-reverse duration-1000`}>
                <div className='rounded-3xl shadow-lg md:w-[350px] md:h-[400px] bg-[url(/bglog.jpg)] bg-cover bg-no-repeat bg-center p-4'>

                    <div className={`relative flex flex-col gap-2 justify-center items-center h-full backdrop-blur-xs  rounded-3xl shadow-lg  backdrop-grayscale duration-1000`}>
                        <div className='absolute w-11/12 top-2 left-2 text-white  flex flex-row items-center justify-between cursor-pointer' >
                            <div className='flex flex-row items-center' onClick={() => router.back()}>
                                <ArrowLeft3 size="32" className='text-iconColor' />
                                Back
                            </div>

                            <div>
                                <SwitchSimpleTheme />
                            </div>

                        </div>
                        <div className='flex flex-row '>
                            <span className='text-white text-4xl'>
                                BrainWave
                            </span>
                            <span className='text-white text-4xl'>
                                Logo
                            </span>
                        </div>

                    </div>

                </div>

                <div className=''>
                    <h1 className='text-3xl mt-2 ml-0'>
                        Login
                    </h1>
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="w-[320px] h-[380px] mt-[-20px] space-y-6 flex flex-col items-center justify-center mx-auto">


                            <FormField
                                control={form.control}
                                name="email"

                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="border-iconColor bg-itemFormBackground w-[320px]"
                                                placeholder="Email"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] text-red-600" />
                                    </FormItem>
                                )} />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='password'
                                                className="border-iconColor bg-itemFormBackground w-[320px]"
                                                placeholder="Password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] text-red-600" />
                                    </FormItem>
                                )} />

                            <Button
                                className='w-full space-y-2'
                                type="submit"
                                variant={"secondary"}>
                                Send
                            </Button>
                            
                        </form>

                    </Form>
                </div>

            </div >

        </>
    )
}
