import React from 'react';
import { Link } from 'react-router-dom';

export default function OrnateButton({ to, children, className = '', ...rest }) {
  const combinedClassName = `ornate-button ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...rest}>
        <p aria-hidden="true">
          <span>{children}</span>
        </p>
      </Link>
    );
  }

  return (
    <button type="button" className={combinedClassName} {...rest}>
      <p aria-hidden="true">
        <span>{children}</span>
      </p>
    </button>
  );
}
