import React from 'react';

export const Spinner = ({ text = '', size = '1em' }) => {
  const header = text ? <h4>{text}</h4> : null;
  return (
    <div className='spinner'>
      <div> {header} </div>
      <div className='loader' style={{ height: size, width: size }} />
    </div>
  );
};
