import type { Meta, StoryObj } from '@storybook/react';
import { Button } from 'components/pure-elements/button/index';
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof Button> = {
    title: 'components/pure-elements/button',
    component: Button,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered'
    },
    argTypes: {
        variant: {
            control: 'select',
            description: "Button Variants",
            options: [
                "default",
                "destructive",
                "outline",
                "secondary",
                "ghost",
                "link"
            ]
        },
        size: {
            control: 'select',
            description: "Button Size",
            options: [
                "default",
                "sm",
                "lg",
                "icon"
            ]
        },
        disabled:{
            control:"boolean",
        },
        onClick:{
            action:'click',
            description :"function called when the default button is clicked"
        }
    }

}

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {
    args: {
        variant: "outline",
        size: "sm",
        disabled: false,
        onClick: action('click '),
        children: 'Default Button',
        className: 'shadow-lg'
    }
} 