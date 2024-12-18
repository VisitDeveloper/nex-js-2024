
'use client';
import { DynamicObjectLiterals, Header, HeaderLayout, ListSetup } from "components";
import { Button } from "components/pure-elements/button";
import { Switch } from "components/pure-elements/switch";
import { useFetch } from "hooks/useFetch";
import { useLanguageClient } from "hooks/useLanguageClient";
import { PostModel } from "model/services/post.model";
import { useEffect, useState } from "react";
import { PostService } from "services/post.service";
import { SwitchSimple } from 'components'
import { useTheme } from "next-themes";

const post = new PostService()

const Login = ({ params: { lng } }: any) => {
    const { t } = useLanguageClient(lng, 'auth');

    const [title, setTitle] = useState<string>("")
    const [body, setBody] = useState<string>("")
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

    const submitData = async (e: any) => {

    }

    useEffect(() => {
        console.log('fetData', data)
    }, [])

    const { setTheme } = useTheme();
    const [statusTheme, setStatusTheme] = useState<boolean>(false)

    useEffect(() => {
        if (!statusTheme) {
            setTheme('light')
        } else {
            setTheme('dark')
        }
    }, [statusTheme])

    return (
        <>


            <DynamicObjectLiterals type="MainLayout" configKey={{
                className: '',
                children: <>
                    <div className="w-full h-screen  bg-cover bg-center bg-hero  relative">

                        <Header className="fixed top-0 right-0 w-[100%] h-[70px] bg-red-300 flex justify-between items-center px-10 header-glass">
                            <ListSetup alignItems="center" direction="row" justifyContent="start" className="gap-5">
                                <span className="text-4xl font-thin">
                                    Logo |
                                </span>
                                <span>
                                    Home
                                </span>
                                <span>
                                    About
                                </span>
                                <span>
                                    Contact us
                                </span>

                            </ListSetup>

                            <ListSetup alignItems="center" direction="row" justifyContent="end" className="gap-5">
                                <span>
                                    <SwitchSimple />
                                    {/* <Switch id="airplane-mode" checked={statusTheme} onChange={(e) => setStatusTheme(!statusTheme)} /> */}
                                </span>
                                <Button variant={"outline"} size={"sm"}> Login</Button>
                            </ListSetup>

                        </Header>
                    </div>
                    <ListSetup
                        alignItems="center"
                        justifyContent="between"
                        direction="row"
                        className="bg-gray-100 p-4"
                    >

                        <div className="bg-blue-500 text-white p-2 rounded" onClick={() => setTest(!test)}>Item 1</div>
                        <div className="bg-red-500 text-white p-2 rounded" onClick={() => setTest2(!test2)}>Item 2</div>
                        <div className="bg-green-500 text-white p-2 rounded">Item 3</div>
                    </ListSetup>

                    {/* <Switch /> */}
                    <Button variant={"outline"} size={"sm"}> Var</Button>
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
                    <div className="flex flex-row justify-start" >

                        <form onSubmit={submitData}>
                            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            <input type="text" name="body" value={body} onChange={(e) => setBody(e.target.value)} />
                            <button type="submit">
                                click
                            </button>
                        </form>
                    </div>
                </>
            }} />

        </>

    );
};

export default Login;