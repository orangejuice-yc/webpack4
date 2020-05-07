// component.js
import React, {Component} from 'react'; // 这两个模块必须引入

let tips = 'This is a Component';
export default class Mycomponent extends Component{
    render() {
        return (
            <div>
                {tips}
            </div>
        );
    }
}