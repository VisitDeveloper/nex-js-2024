
'use client';
import { DynamicObjectLiterals, Footer, Header, HeaderLayout, ListSetup } from "components";
import { Button } from "components/pure-elements/button";
import { useFetch } from "hooks/useFetch";
import { useLanguageClient } from "hooks/useLanguageClient";
import { PostModel } from "model/services/post.model";
import { useEffect, useState } from "react";
import { PostService } from "services/post.service";
import { SwitchSimpleTheme } from 'components'
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
                    {/* <div className="flex flex-row justify-start" >

                        <form onSubmit={submitData}>
                            <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            <input type="text" name="body" value={body} onChange={(e) => setBody(e.target.value)} />
                            <button type="submit">
                                click
                            </button>
                        </form>
                    </div> */}
                    
                    {/* <Footer>
                        footer
                    </Footer> */}
                </>
            }} />

        </>

    );
};

export default Login;