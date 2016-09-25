import React from 'react';
import ReactDOM from 'react-dom';
import Timer from './timer';

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById('root');
  ReactDOM.render(<Timer />, root);
});
