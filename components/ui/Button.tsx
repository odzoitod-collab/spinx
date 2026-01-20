import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyle = "w-full font-bold text-lg py-4 rounded-2xl transition-all duration-150 transform active:scale-95 active:translate-y-1 flex items-center justify-center gap-2 shadow-[0_4px_0px_rgba(0,0,0,0.2)] active:shadow-none mb-1";
  
  const variants = {
    primary: "bg-gradient-to-b from-pop-yellow to-yellow-500 text-black border-2 border-yellow-600",
    secondary: "bg-gradient-to-b from-pop-purple to-indigo-600 text-white border-2 border-indigo-800",
    danger: "bg-gradient-to-b from-red-400 to-red-600 text-white border-2 border-red-800",
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <i className="fas fa-circle-notch fa-spin"></i>
      ) : children}
    </button>
  );
};