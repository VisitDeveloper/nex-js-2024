
'use client';
import { ListSetup, MainLayout } from "components";
import { Button } from "components/pure-elements/button";
import { useFetch } from "hooks/useFetch";
import { useLanguageClient } from "hooks/useLanguageClient";
import { useEffect, useState } from "react";
import { PostService } from "services/post.service";
import { animate, motion, useMotionValue } from 'motion/react';
import { containerVariants, fadeAnime, itemVariants, photoAnime } from "config/animation";
import Image from "next/image";
import Card from "components/pure-elements/card";
import useMeasure from "react-use-measure";
import { useScroll } from "hooks/useScroll";
import Carousel from "components/pure-elements/carousel-slider";


const post = new PostService()

const Login = ({ params: { lng } }: any) => {
    const { t } = useLanguageClient(lng, 'auth');
    const [test, setTest] = useState<boolean>(false)
    const [test2, setTest2] = useState<boolean>(false)

    const { loading, data, error } = useFetch<any>({
        service: post.create.bind(post),
        options: {
            headers: {
                'Token': 'b Tokkkkkkkk',
                'ds': `${test}`
            },
            body: { name: `${test2}`, age: 30 },
        }
    })


    const { loading: loadingData, error: ErrorData, data: dataPost } = useFetch<any>({
        service: post.read.bind(post),
        options: {
            headers: {
                'tto': 'ertetr'
            },
            body: {
                bg: 'sdas'
            }
        }
    })


    useEffect(() => {
        console.log('fetData', data)
    }, [])




    const [element, controls] = useScroll()

    return (
        <>
            <MainLayout>

                <ListSetup alignItems="center" direction="row" justifyContent="between" className="gap-4 px-9">
                    <motion.div
                        initial="closed"
                        animate="open"
                        variants={containerVariants}
                        className="overflow-hidden leading-5 flex flex-col gap-2"
                    >
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            Unlock the Power of Learning,
                        </motion.h2>
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            Shape the Future with
                        </motion.h2>
                        <motion.h2 variants={itemVariants} className="text-5xl">
                            <span className="text-iconColor">Brainwave Education</span>
                        </motion.h2>

                        <motion.p variants={fadeAnime}
                            initial="hidden"
                            animate="show"
                        >"Contact us for any programming or project ideas you have. Our team of professionals is ready to bring your vision to life with exceptional skills."
                        </motion.p>

                        <motion.div className="pl-3 mb-10 w-[100px]" whileTap={{
                            scale: 1.1
                        }}>
                            <Button variant={"secondary"} size={"sm"}> Contact</Button>
                        </motion.div>





                    </motion.div>

                    <motion.div initial="hidden"
                        animate="show"
                        variants={photoAnime}>

                        <Image width={700} height={500} src={'/theme.png'} alt="image cover" className="rounded-3xl shadow-lg" />
                    </motion.div>

                </ListSetup>



                <Carousel/>

                <motion.div
                    variants={fadeAnime}
                    animate={controls}
                    initial="hidden"
                    className="flex flex-row gap-4 bg-black mt-60"
                    ref={element}>
                    <div className="size-72"></div>
                    <div className="size-72"></div>
                    <div className="size-72"></div>
                </motion.div>
                {t("signIn")}
                <div>
                    {loading && <>... loading </>}
                    {dataPost?.map((item: any) => {
                        return (
                            <>
                                {item.title}
                            </>
                        )
                    })}
                    {error && <> Error </>}
                </div>
            </MainLayout >
        </>

    );
};

export default Login;