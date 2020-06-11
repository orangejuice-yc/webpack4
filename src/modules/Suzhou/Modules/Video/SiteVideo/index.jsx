import React,{Component} from 'react';
import  style from './index.less'
import axios from '@/api/axios';
import {checkLoginOpen} from '../../../api/suzhou-api';
class CompletionMeasurement extends Component{
    constructor(props) {
        super(props)
        this.state = { 
            urlFlag:false
        }
    }
    componentDidMount(){
        axios.get(checkLoginOpen).then(res=>{
            if(res.data.data){
                this.setState({url:res.data.data,urlFlag:true})
            }
        })
    }
    render(){
        return(
            <div>
                {this.state.urlFlag && (
                    <iframe className={style.content} frameBorder="0"  id="iframe"  src={this.state.url} style={{ height: this.props.height }} />
                )}
            </div>
        )
    }
}
export default CompletionMeasurement;