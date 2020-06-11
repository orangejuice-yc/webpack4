import React from 'react';
import {render} from 'react-dom';
import Index from './pages/index.jsx'
import { Provider } from 'react-redux';
import store from './store/index.js';

render(
    <Provider store={store}>
        <Index />
    </Provider>
, document.body)