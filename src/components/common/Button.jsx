import React from 'react';
import styles from './Button.module.css';

export default function Button({ variant, className = '', ...props }) {
  const variantClass = variant === 'buy' ? styles.buy
    : variant === 'sell' ? styles.sell
    : '';
  return (
    <button className={`${styles.button} ${variantClass} ${className}`} {...props} />
  );
}
