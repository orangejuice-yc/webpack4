import React, { Component ,Fragment} from 'react';
import { Card ,Radio,DatePicker, Select} from 'antd';
import style from './style.less';
import QualityInspection from './QualityInspection'
import SecurityCheck from './SecurityCheck'
import QuestionRank from './QuestionRank'
import DispatchingToday from './DispatchingToday'
import ConstructionEvaluation from './ConstructionEvaluation'
import ProblemStatistics from './ProblemStatistics'
import axios from "@/api/axios"
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import moment from 'moment'
const { Option } = Select;
// const { MonthPicker} = DatePicker;
// const dateFormat = 'YYYY'
// const teaday = moment().subtract('1','day').format(dateFormat)
//领导首页
export class LeaderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:true,
      viewType:'section', // 统计类型默认为标段
      checkStatus:'0', // 安全检查默认个人检查
      viewTypeDt:'section', //日派工单统计类型默认未标段
      year:'',  //施工考评年份
      season:'0'  //施工考评季度
    }
  }
  componentDidMount(){
   //初始化css样式
   let time = new Date()
   let year=time.getFullYear()
   let month=time.getMonth()
   let yearData=[year]
   for(let i=9,k=year;i>=0;i--){
    k=k-1
    yearData.push(k)
   }
   this.setState({
      year,
      yearData
})
if(month>=0&&month<3){
  this.setState({
    season:'0'
})
}else if(month>2&&month<6){
  this.setState({
    season:'1'
})
}else if(month>5&&month<9){
  this.setState({
    season:'2'
  })
}else if(month>8&&month<12){
  this.setState({
    season:'3'
  })
}
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
// 问题数量统计类型
  onChangeQR=(e)=>{
    this.setState({viewType:e.target.value},()=>{
      this.child.getList()
    })
  }
// 安全检查类型
onChangeSc=(type)=>{
  this.setState({checkStatus:type})
}
// 日派工单类型
onChangeDt=(e)=>{
  this.setState({viewTypeDt:e.target.value},()=>{
    this.childDt.getList()
  })
}
// 施工考评年份
onChangeCe=(year)=>{
  // const year = dateString.split('-',1).toString()
  this.setState({year},()=>{
    this.childCe.getList()
  })
}
//施工考评季度
handleChange=(value)=>{
  this.setState({season:value},()=>{
    this.childCe.getList()
  })
}
  render() {
    return (
      <Fragment>
        {(this.state.loading==false) &&(
      <div className={style.main} style={{ height: this.state.mainHeight}}>
      {/* 今日派工 */}
      <Card   className={style.Card}
          style={{ width: '28%',height:'40%' ,marginTop:'15px',marginLeft:'calc(8% - 4px)'}}
          title="今日派工"
          bordered={false}  
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}} 
          extra={<Radio.Group defaultValue={this.state.viewTypeDt} size="small" onChange={this.onChangeDt} disabled>
                  <Radio.Button value="section">按标段</Radio.Button>
                  <Radio.Button value="station">按站点</Radio.Button>
                </Radio.Group>}       
        >
          <DispatchingToday viewType={this.state.viewTypeDt} ref={r => this.childDt = r}
          projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>
        </Card>
      {/* 质量报验 */}
        <Card   className={style.CardBodyH+' ' +style.Card}
          style={{ width: '28%',height:'40%' ,marginTop:'15px'}}
          title="质量报验" 
          bordered={false} 
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}        
        > 
            <QualityInspection projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>
        </Card>
      {/* 安全检查 */}
        <Card   className={style.CardBodyH+' ' +style.Card}
          style={{ width: '28%',height:'40%' ,marginTop:'15px'}}
          title="安全检查" 
          bordered={false}  
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}  
          extra={<Fragment>类型:
                  <Select defaultValue={this.state.checkStatus} size='small' onChange={this.onChangeSc}>
                    <Option value="0">个人检查</Option>
                    <Option value="1">组织检查</Option>
                  </Select>
                  {/* <Radio.Group defaultValue={this.state.checkStatus} size="small" onChange={this.onChangeSc}>
                  <Radio.Button value="0">个人检查</Radio.Button>
                  <Radio.Button value="1">组织检查</Radio.Button>
                </Radio.Group> */}
                </Fragment>}      
        >       
          <SecurityCheck ref={r => this.childSc = r} checkStatus={this.state.checkStatus}
          projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>    
        </Card>
        {/* 问题统计 */}
        <Card   className={style.Card}
          style={{ width: '28%',height:'55%',marginLeft:'calc(8% - 4px)'}}
          title="问题统计"
          bordered={false}  
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}} 
          extra={<Radio.Group defaultValue={this.state.viewType} size="small" onChange={this.onChangeQR}>
                  <Radio.Button value="section">按标段</Radio.Button>
                  <Radio.Button value="station">按站点</Radio.Button>
                </Radio.Group>}       
        >
          <QuestionRank viewType={this.state.viewType} ref={r => this.child = r}
          projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>
        </Card>
      {/* 问题分类 */}
        <Card   className={style.Card}
          style={{ width: '28%',height:'55%'}}
          title="问题分类" 
          bordered={false}
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}     
        >
          <ProblemStatistics projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>
        </Card>
      {/* 施工考评  */}
        <Card   className={style.Card}
          style={{ width: '28%',height:'55%' }}
          title="施工考评" 
          bordered={false}  
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}
          extra={<Fragment>年份:
                  <Select defaultValue={this.state.year} size='small' onChange={this.onChangeCe} style={{ width: 80 }}>
                          {this.state.yearData.map((item,index)=>{
                            return (<Option value={item}>{item}</Option>)
                          })}
                  </Select>
                    {/* <MonthPicker className={style.timeBox} size='small' format={dateFormat} defaultValue={moment(teaday, dateFormat)} 
                    onChange={this.onChangeCe} placeholder="请选择" /> */}季度:
                  <Select defaultValue={this.state.season} size='small' onChange={this.handleChange}>
                    <Option value="0">第一季度</Option>
                    <Option value="1">第二季度</Option>
                    <Option value="2">第三季度</Option>
                    <Option value="3">第四季度</Option>
                  </Select>
                  </Fragment>}         
        >
          <ConstructionEvaluation projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}
          ref={r => this.childCe = r} year={this.state.year} season={this.state.season}/>
        </Card>
      </div>)}
      </Fragment>
    )
  }
}



export default LeaderPage;