import React from 'react';
import './Button.css';

const Button = ({ variant = 'primary', size = 'medium', children, ...props }) => {
  const className = `btn ${variant} ${size}`;
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

export default Button;
