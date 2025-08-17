import type React from "react"
import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean
}

export const Input: React.FC<InputProps> = ({ fullWidth = false, className, ...props }) => {
    const baseStyles = "border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
    const widthStyles = fullWidth ? "w-full" : "w-auto"

    const classes = `${baseStyles} ${widthStyles} ${className || ""}`

    return <input className={classes} {...props} />
}

