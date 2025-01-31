import React,{JSX} from 'react';


interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>{
    children?: React.ReactNode | React.ReactElement | JSX.Element
}

const Button = ({children , ...props} : ButtonProps) =>{
    return (
        <button {...props} >
            {children}
        </button>
    )
}
export default Button