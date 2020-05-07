import './style.css'; 
import './style.scss';  //导入css
import React from 'react';
import {render} from 'react-dom';

import Mycomponent from './component';
render(<Mycomponent />, document.getElementById('root'));