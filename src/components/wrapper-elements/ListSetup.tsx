
/* eslint-disable react-refresh/only-export-components */
import React from 'react'


const alignItemsMap = {
    start: "items-start",
    end: "items-end",
    center: "items-center",
    baseline: "items-baseline",
    stretch: "items-stretch",
};

const justifyContentMap = {
    normal: "justify-normal",
    start: "justify-start",
    end: "justify-end",
    center: "justify-center",
    between: "justify-between",
    around: "justify-around",
    stretch: "justify-stretch",
    evenly: "justify-evenly",
};

const colAndRowMap = {
    row: "flex-row",
    rowReverse: "flex-row-reverse",
    col: "flex-col",
    colReverse: "flex-col-reverse",
};


export interface ConfigWrapperListProps {
    children: React.ReactNode | React.ReactElement | JSX.Element;
    className?: string;
    alignItems?: keyof typeof alignItemsMap;
    justifyContent?: keyof typeof justifyContentMap;
    direction?: keyof typeof colAndRowMap;
}

const getClassName = (type: string | undefined, map: Record<string, string>) =>
    type ? map[type] : "";

function ListSetup({
    children,
    className = "",
    alignItems = "start",
    justifyContent = "start",
    direction = "row" }: ConfigWrapperListProps) {

    return (
        <div className={`flex ${className}
                ${getClassName(direction, colAndRowMap)} 
                ${getClassName(justifyContent, justifyContentMap)} 
                ${getClassName(alignItems, alignItemsMap)} `}
        >
            {children}
        </div>
    )
}
export default ListSetup
