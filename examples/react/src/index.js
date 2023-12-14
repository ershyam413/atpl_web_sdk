import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App-WithEffect';
import * as serviceWorker from './serviceWorker';
import Atpl from 'Atpl-sdk-web';

//Exposing Atpl to the DOM as a global variable
//Usecase - Heatmaps
window.Atpl = Atpl;
Atpl.init({
    app_key: 'YOUR_APP_KEY',
    url: 'YOUR_SERVER_URL',
    debug: true
});

Atpl.q.push(['track_sessions']);
Atpl.q.push(['track_scrolls']);
Atpl.q.push(['track_clicks']);
Atpl.q.push(['track_links']);
Atpl.q.push(["track_errors"]);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
