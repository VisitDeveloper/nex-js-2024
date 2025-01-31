'use client'
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
import { Input, Textarea, Button } from "components"

const FormSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    email: z.string().email("Invalid email address.").min(2, {
        message: "Email must be at least 2 characters.",
    }),
    message: z.string().min(10, {
        message: "Message should be at least 10 characters.",
    }),

})

export default function ContactForm() {
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            username: "",
            email: "",
            message: ""
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">

                <FormField
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Name</FormLabel>
                            <FormControl>
                                <Input
                                    className="border-iconColor bg-itemFormBackground"
                                    placeholder="Your Name"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs text-red-600" />
                        </FormItem>
                    )} />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Email</FormLabel>
                            <FormControl>
                                <Input
                                    className="border-iconColor bg-itemFormBackground"
                                    placeholder="Email Address"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs text-red-600" />
                        </FormItem>
                    )} />
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-lg">Message</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="border-iconColor bg-itemFormBackground"
                                    placeholder="Type your message here."
                                    id="message"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-xs text-red-600" />
                        </FormItem>
                    )} />
                <Button
                    type="submit"
                    variant={"secondary"}>
                    Send
                </Button>
            </form>
        </Form>
    )
}
