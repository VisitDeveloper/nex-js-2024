import Header from 'components/elements/header';
import { ListSetup, SwitchSimpleTheme, Button, Div } from 'components';
import React from 'react'


interface HeaderLayoutProps {
  children?: React.ReactNode | JSX.Element | React.ReactElement;
}

export default function HeaderLayout({ children, ...props }: HeaderLayoutProps) {
  return (
    <>
      <Div className="w-full h-screen  bg-cover bg-center bg-hero  relative">
        <Header {...props} className="fixed top-0 right-0 w-[100%] h-[70px] bg-red-300 flex justify-between items-center px-10 header-glass">
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
              <SwitchSimpleTheme />
            </span>
            <Button variant={"outline"} size={"sm"}> Login</Button>
          </ListSetup>

        </Header>
      </Div>ّ
    </>
  )
}
