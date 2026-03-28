import React from 'react'

const Button = ({children, variant="primary", onClick,disabled=false, style={}, className="", ...props }) => {
    const variants = {

        AddNewBtn:"text-blue-600 font-bold bg-white  shadow-inner shadow-blue-800/80 shadow-lg  hover:shadow-inner hover:shadow-blue-600/70 hover:bg-gradient-to-br focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm  px-5 py-2.5 text-center  me-2 mb-2",
        secondary:"bg-red-600",
    };

  return (
    <div>
    <button className={`${variants[variant]} ${className}`}
    onClick={onClick} 
    disabled={disabled}
    style={style}
    {...props}
    >
        {children}
    </button>
    </div>
  )
}

export default Button