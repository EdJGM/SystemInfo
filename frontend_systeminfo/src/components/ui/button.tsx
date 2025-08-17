import type React from "react"
import type { ButtonHTMLAttributes } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline"
    size?: "sm" | "md" | "lg"
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", size = "md", className, ...props }) => {
    const baseStyles = "font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"

    const variantStyles = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
        outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    }

    const sizeStyles = {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
    }

    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ""}`

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}

