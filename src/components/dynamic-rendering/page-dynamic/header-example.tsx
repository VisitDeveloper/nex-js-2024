'use client'
import React from "react";
import dynamic from 'next/dynamic';

const NoSSRComponent = dynamic(() => import('./page-rendering'), { ssr: false });


const headerConfig = {
  component: "header",
  id: "main-header",
  className: "header-class",
  styles: [
    { name: "backgroundColor", value: "#f4f4f4" },
    { name: "padding", value: "20px" },
    { name: "textAlign", value: "center" }
  ],
  children: [
    {
      component: "h1",
      id: "header-title",
      className: "header-title",
      styles: [
        { name: "color", value: "#333" },
        { name: "fontSize", value: "2rem" }
      ],
      children: "Welcome to My Website"
    },
    {
      component: "h2",
      id: "header-subtitle",
      className: "header-subtitle",
      styles: [
        { name: "color", value: "#666" },
        { name: "fontSize", value: "1.5rem" }
      ],
      children: "A place to learn and grow"
    }
  ]
};

const Header = () => {
    return <NoSSRComponent config={headerConfig} />;
};

export default Header;