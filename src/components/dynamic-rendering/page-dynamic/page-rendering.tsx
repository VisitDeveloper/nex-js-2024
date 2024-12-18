'use client'
import { createElement } from "react";
import {
  H1,
  ButtonElement,
  Div,
  Footer,
  H2,
  H3,
  H4,
  H5,
  H6,
  Header,
  Img,
  LI,
  OL,
  P,
  Span,
  UL,
  Section
} from "components/index";
// import {DynamicRenderingGlobal} from "components/dynamic-rendering/component-dynamic-rendering/ComponentDynamic";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KeysToComponentMap: any = {
  button: ButtonElement,
  div: Div,
  footer: Footer,
  header: Header,
  li: LI,
  p: P,
  span: Span,
  ul: UL,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  img: Img,
  ol:OL,
  section : Section ,
  // dynamicRenderingGlobal: DynamicRenderingGlobal
};

interface StylePropsArray {
  name: string;
  value: string;
}

interface MappedStyles {
  [key: string]: string;
}

const StylesMaps = (styles: Array<StylePropsArray>) => {
  const mappedStyles: MappedStyles = {};
  styles?.forEach((style: StylePropsArray) => {
    mappedStyles[style.name] = style.value;
  });
  return mappedStyles;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 const ConfigRenderComponent = (config: any) => {
   
   if (typeof KeysToComponentMap[config.component] !== "undefined") {
    console.log(config.id, config.className, StylesMaps(config.styles));
    return createElement(
      KeysToComponentMap[config.component],
      {
        id: config.id,
        key: config.id,
        style: config.styles && Object.keys(StylesMaps(config.styles)).length > 0 ? StylesMaps(config.styles) : undefined,
        className: config.className ? config.className : undefined,
        ...config
      },
      config.children &&
        (typeof config.children === "string"
          ? config.children
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          : config.children.map((c: any) => ConfigRenderComponent(c)))
    );
  }
};
export default ConfigRenderComponent