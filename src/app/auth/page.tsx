'use client'
import React from 'react'
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
import { Input, Button } from "components"
import Link from 'next/link'
import Image from 'next/image'
import { Star1 } from 'iconsax-react'

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

  return (
    // <div className='min-w-[400px] md:min-w-[500px] flex flex-row'>
    //   <div className='dark:bg-blackRgba backdrop-blur-xs text-white   rounded-3xl  shadow-lg w-9/12 md:w-10/12 m-auto  h-[430px] p-3 flex flex-col'>
    //     <div className='text-3xl'>
    //       Login
    //     </div>
    //     <span className='w-full h-[2px] dark:bg-slate-700  bg-slate-200 mt-3 mb-2' />

    //     <Form {...form} >
    //       <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-[20px]">


    //         <FormField
    //           control={form.control}
    //           name="email"

    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel className="text-sm">Email</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   className="border-iconColor bg-itemFormBackground"
    //                   placeholder="Email"
    //                   {...field}
    //                 />
    //               </FormControl>
    //               <FormMessage className="text-[10px] text-red-600" />
    //             </FormItem>
    //           )} />

    //         <FormField
    //           control={form.control}
    //           name="password"
    //           render={({ field }) => (
    //             <FormItem>
    //               <FormLabel className="text-sm">Password</FormLabel>
    //               <FormControl>
    //                 <Input
    //                   type='password'
    //                   className="border-iconColor bg-itemFormBackground"
    //                   placeholder="Password"
    //                   {...field}
    //                 />
    //               </FormControl>
    //               <FormMessage className="text-[10px] text-red-600" />
    //             </FormItem>
    //           )} />

    //         <Button
    //           className='w-full mt-5'
    //           type="submit"
    //           variant={"secondary"}>
    //           Send
    //         </Button>
    //       </form>
    //     </Form>
    //     <div className='flex flex-col gap-2 mx-auto mt-4'>
    //       <Link href='/' className='text-center'>
    //         forget password ?
    //       </Link>
    //       Don't have an account yet? Register now
    //       <Link href='/' className='text-center'>
    //         Signup
    //       </Link>
    //     </div>
    //   </div>
    // </div>
    <>
      <div className='rounded-3xl shadow-lg lg:w-[700px] lg:h-[400px] bg-miniBackground flex flex-row gap-2'>
        <div className='rounded-3xl shadow-lg lg:w-[350px] lg:h-[400px] bg-[url(/bglog.jpg)] bg-cover bg-no-repeat bg-center'>

          <div className='flex flex-col gap-2 justify-center items-center h-full'>
            <div className='flex flex-row'>
              <span className='text-white text-4xl'>
                BrainWave
              </span>
              <span className='text-white text-4xl'>
                Logo
              </span>
            </div>
            <h1 className='text-3xl text-white'>
              Sign Up
            </h1>
          </div>

        </div>

        <div>
          the form sign up
        </div>

      </div>

    </>
  )
}
