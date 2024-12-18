
'use client';
import { DynamicObjectLiterals, ListSetup } from "components";
import { Button } from "components/pure-elements/button";
import Switch from "components/pure-elements/switch";
import { useFetch } from "hooks/useFetch";
import { useLanguageClient } from "hooks/useLanguageClient";
import { PostModel } from "model/services/post.model";
import { useEffect, useState } from "react";
import { PostService } from "services/post.service";


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


  const { loading : loadingData, error : ErrorData , data : dataPost } = useFetch<any>({
    service: post.read.bind(post),
    options: {
      headers:{
        'tto' : 'ertetr'
      },
      body:{
        bg:'sdas'
      }
    }
  })

  const submitData = async (e: any) => {

  }

  useEffect(() => {
    console.log('fetData', data)
  }, [])



  return (
    <DynamicObjectLiterals type="MainLayout" configKey={{
      className: 'w-[350px] bg-primary dark:bg-secondary',
      children: <>
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

        <Switch />
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

  );
};

export default Login;