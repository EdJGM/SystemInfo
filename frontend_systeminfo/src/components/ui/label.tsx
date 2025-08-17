import type React from "react"
import type { LabelHTMLAttributes } from "react"

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> { }

export const Label: React.FC<LabelProps> = ({ children, className, ...props }) => {
    const baseStyles = "block text-sm font-medium text-gray-700"

    const classes = `${baseStyles} ${className || ""}`

    return (
        <label className={classes} {...props}>
            {children}
        </label>
    )
}

