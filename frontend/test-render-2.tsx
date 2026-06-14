global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

import { renderToString } from 'react-dom/server';
import App from './src/App.tsx';
import React from 'react';

try {
  const html = renderToString(React.createElement(App));
  console.log("SUCCESS length:", html.length);
} catch (e) {
  console.error("ERROR:");
  console.error(e);
}
