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

  const [changeStatusSign, setChangeStatusSign] = useState<boolean>(false)
  const router = useRouter();

  const changeState = () => {
    setChangeStatusSign(!changeStatusSign)
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
      <div className={`rounded-3xl shadow-lg md:w-[700px] md:h-[400px] bg-miniBackground  flex  gap-2 ${changeStatusSign === true ? 'flex-row-reverse duration-1000' : 'flex-row duration-1000'}`}>
        <div className='rounded-3xl shadow-lg md:w-[350px] md:h-[400px] bg-[url(/bglog.jpg)] bg-cover bg-no-repeat bg-center p-4'>

          <div className={`relative flex flex-col gap-2 justify-center items-center h-full backdrop-blur-xs  rounded-3xl shadow-lg  ${changeStatusSign === true ? 'backdrop-grayscale duration-1000' : 'duration-1000'}`}>
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
            {/* <h1 className='text-3xl text-white' onClick={changeState}>
              {changeStatusSign === true ? 'Login' : 'Sign up'}
            </h1> */}
            <div className='relative flex flex-row gap-2 border-2 rounded-lg cursor-pointer'>
              <span className={`w-[60px] h-full absolute bg-miniBackground rounded-md duration-500 ${changeStatusSign === true ? 'left-0 duration-500' : 'right-0 duration-500'}`}></span>
              <div className={`z-10 mx-2 ${changeStatusSign === true ? '' : ''}`} onClick={changeState}>
                Login
              </div>
              <div className={`z-10 mx-1 ${changeStatusSign === true ? '' : ''}`} onClick={changeState}>
                Signup
              </div>
            </div>
          </div>

        </div>

        {changeStatusSign === true ? <div className=''>
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
              <Button onClick={() => router.push('/')} variant={'link'} className='mt-10' style={{ color: '#1f75cb' }}>
                Forget your password ?
              </Button>
            </form>

          </Form>
        </div> :
          <div className=''>
            <h1 className='text-3xl mt-2 ml-0'>
              Sign Up
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
                <Button onClick={() => router.push('/')} variant={'link'} className='mt-10' style={{ color: '#1f75cb' }}>
                  Forget your password ?
                </Button>
              </form>

            </Form>
          </div>
        }

      </div >

    </>
  )
}
