import React, { Component ,Fragment} from 'react';
import { Card } from 'antd';
import style from './style.less';
import ProgressPlanning from './ProgressPlanning'
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
//领导首页
export class LeaderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:true,
    }
  }
  componentDidMount(){
   //初始化css样式
   firstLoad().then(res => {
     this.setState(
       {
         projectId: res.projectId,
         loading:false
       }
     )
   })
   var h = document.documentElement.clientHeight || document.body.clientHeight - 55;   //浏览器高度，用于设置组件高度
   var w = document.documentElement.offsetWidth || document.body.offsetWidth;
   this.setState({
       mainHeight: h - 160,
       mainLeftWidth: w - 55
   })
  }
  render() {
    return (
      <Fragment>
      <div className={style.main} style={{ height: this.state.mainHeight}}>
        {/* 计划节点进展情况 */}
        <Card   className={style.ProgressPlanning+' ' +style.Card}
          style={{ width: '84%',height:'95%' ,marginTop:'15px',marginBottom:'15px',marginLeft:'calc(8% - 4px)'}}
          title="计划节点进展情况" 
          bordered={false}
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}     
        >
          <ProgressPlanning/>
        </Card>
      </div>
      </Fragment>
    )
  }
}



export default LeaderPage;