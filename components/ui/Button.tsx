import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

        const variants = {
            primary: "bg-brand-blue text-white hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 focus:ring-brand-blue",
            secondary: "bg-vibrant-teal text-white hover:bg-cyan-600 active:scale-95 shadow-lg shadow-cyan-500/20 focus:ring-vibrant-teal",
            ghost: "bg-transparent text-slate-600 hover:text-brand-blue hover:bg-blue-50 active:scale-95",
            outline: "border-2 border-slate-200 text-slate-700 hover:border-brand-blue hover:text-brand-blue active:scale-95"
        };

        const sizes = {
            sm: "px-4 py-2 text-sm",
            md: "px-6 py-3 text-base",
            lg: "px-8 py-4 text-lg"
        };

        const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

        return (
            <button
                ref={ref}
                className={classes}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
