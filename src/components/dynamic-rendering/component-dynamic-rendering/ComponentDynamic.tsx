'use client'
import ListSetup, { ConfigWrapperListProps } from "components/wrapper-elements/ListSetup";
import { HeaderLayout, FooterLayout, MainLayout } from "components";
import { Fragment } from "react";
import { CreateObjectLiterals } from "tools/object-literal";
import { MainLayoutProps } from "components/layout/MainLayout";

// eslint-disable-next-line react-refresh/only-export-components
export const typeComponent = {
  ListSetup: "ListSetup",
  HeaderLayout: "HeaderLayout",
  FooterLayout: "FooterLayout",
  MainLayout: 'MainLayout'
}

interface ObjectTest {
  ListSetup: JSX.Element | React.ReactElement | React.ReactNode;
  HeaderLayout: JSX.Element | React.ReactElement | React.ReactNode;
  FooterLayout: JSX.Element | React.ReactElement | React.ReactNode;
  MainLayout: JSX.Element | React.ReactElement | React.ReactNode;
}

interface DynamicObjectLiteralsProps {
  type: keyof typeof typeComponent;
  configKey?: ConfigWrapperListProps | MainLayoutProps | React.ReactElement;
}

function DynamicObjectLiterals(props: DynamicObjectLiteralsProps) {
  const finalComponentItemRendering: ObjectTest = {
    ListSetup: <ListSetup  {...(props?.configKey as ConfigWrapperListProps)} />,
    HeaderLayout: <HeaderLayout />,
    FooterLayout: <FooterLayout />,
    MainLayout : <MainLayout {...(props?.configKey as MainLayoutProps)} />
  };

  const FinalObjectRendered: JSX.Element = CreateObjectLiterals(
    finalComponentItemRendering,
    props.type,
    typeComponent.ListSetup
  );
  return <Fragment>{FinalObjectRendered}</Fragment>;
}
export default DynamicObjectLiterals;