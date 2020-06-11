import React,{Component} from 'react';
import  style from './index.less'
import {TokenKey} from "@/modules/Suzhou/components/Util/firstLoad";
class EquipmentArrival extends Component{
    constructor(props) {
        super(props)
        this.state = { 
            tokenKey:''
        }
    }
    componentDidMount(){
        TokenKey().then(res=>{
            this.setState({tokenKey:res.tokenkey})
        })
    }
    render(){
        return(
            <div>
            {/* <iframe className={style.content} frameBorder="0"  src="http://epm.sz-mtr.com:7979/cnt/Modules/ContractPayment/EquipmentArrivaWYList.aspx"/> */}
            {this.state.tokenKey && (
                <iframe className={style.content} frameBorder="0"   src={`http://iepms.sz-mtr.com:8504/Modules/EngineeringExtension/List/EquipmentArrivaWYList.aspx?GCTokenKey=${this.state.tokenKey}`} />
            )}
            </div>
        )
    }
}
export default EquipmentArrival;