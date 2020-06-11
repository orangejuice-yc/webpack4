import React, { Component ,Fragment} from 'react';
import { Card ,Spin,Table} from 'antd';
import style from './style.less';
import Entry from './Entry'
import Attendance from './Attendance'
import axios from "@/api/axios"
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import {getWarningInformation} from '@/api/suzhou-api'
//领导首页
export class LeaderPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading:true,
      loading:true,
      data:[],
      willExpiringNumber:'0',
      expiringNumber:'0',
      pageSize:10,
      currentPageNum:1,
      total:0
    }
  }
  componentDidMount(){
   //初始化css样式
   firstLoad().then(res => {
     this.setState(
       {
         projectId: res.projectId,
         showLoading:false
       },()=>{
        this.getList(this.state.projectId)
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
  getList=(projectId)=>{
    this.setState({loading:true},()=>{
      axios.get(getWarningInformation(this.state.pageSize,this.state.currentPageNum),{params:{projectId:projectId}}).then(res=>{
          if(res.data.data){
              const {willExpiringNumber,expiringNumber,warnLists}= res.data.data
              this.setState({
                data:warnLists.data,
                willExpiringNumber:willExpiringNumber.toString(),
                expiringNumber:expiringNumber.toString(),
                total:warnLists.total,
                loading:false, 
              })
          }else{
            this.setState({
                data:[],  
                total:0,              
                willExpiringNumber:'0',
                expiringNumber:'0',
                loading:false, 
            })  
          }      
      })
    })
  }
  render() {
    let pagination = {
      total: this.state.total,
      size:'small',
      currentPageNum: this.state.currentPageNum,
      pageSize: this.state.pageSize,
      showSizeChanger: true,
      showTotal: total => `共${this.state.total}条`,
      onShowSizeChange: (current, size) => {
        this.setState({
          pageSize: size,
          currentPageNum: 1
        }, () => {
          this.getList(this.state.projectId)
        })
      },
      onChange: (page, pageSize) => {
        this.setState({
          currentPageNum: page
        }, () => {
          this.getList(this.state.projectId)
        })
      }
    }
    return (
      <Fragment>
        {(this.state.showLoading==false) &&(
      <div className={style.main} style={{ height: this.state.mainHeight}}>
      {/* 人员进退场 */}
        <Card    className={style.Attendance+' ' +style.Card}
          style={{ width: '28%',height:'95%' ,marginTop:'15px',marginLeft:'calc(8% - 4px)'}}
          title="人员进退场"       
          bordered={false}
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}} 
        >
          <Entry projectId={this.state.projectId}/>
        </Card>
      {/* 实时考勤 */}
        <Card   className={style.Warning+' ' +style.Card}
          style={{ width: '28%',height:'95%' ,marginTop:'15px'}}
          title="实时考勤"
          bordered={false} 
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}        
        >         
          <Attendance projectId={this.state.projectId} openMenuByMenuCode={this.props.openMenuByMenuCode}/>        
        </Card>
        {/* 证书预警 */}
        <Card   className={style.Warning+' ' +style.Card}
          style={{ width: '28%',height:'95%' ,marginTop:'15px'}}
          title="证书预警"
          bordered={false} 
          headStyle={{color:'#2f3946',fontSize:'14px',fontWeight:'bold'}}       
        >   
          <div style={{width:'100%',height:'30%'}}>      
            <div className={style.warningBox}>
                <div style={{width:'30px',height:'30px'}}><img src="../../../static/images/suzhou/warn1.png" alt="" style={{display:'block',width:'100%',height:'100%'}}/></div>
                <div className={style.wBox1+' '+style.boxNum} style={{color:'gold'}}><Spin spinning={this.state.loading}>{this.state.willExpiringNumber}<span style={{fontSize:'16px'}}>个</span></Spin></div>
                <div className={style.wBox1}>即将过期</div>
            </div>
            <div className={style.warningBox}>
                <div style={{width:'30px',height:'30px'}}><img src="../../../static/images/suzhou/warn2.png" alt="" style={{display:'block',width:'100%',height:'100%'}}/></div>
                <div className={style.wBox1+' '+style.boxNum} style={{color:'red'}}><Spin spinning={this.state.loading}>{this.state.expiringNumber}<span style={{fontSize:'16px'}}>个</span></Spin></div>
                <div className={style.wBox1}>已过期</div>
            </div> 
          </div> 
        <div style={{width:'100%',height:'70%'}}>
            <Table 
              loading={this.state.loading}
              dataSource={this.state.data}
              columns={columns} 
              pagination={pagination}
              scroll={{y:'80%',scrollToFirstRowOnChange:true}}
              />
          </div>   
        </Card>
      </div>)}
      </Fragment>
    )
  }
}
const columns = [
  {
    title: '序号',
    width:'10%',
    render: (text, record, index) => `${index + 1}`,
  },
  {
      title: '标段号',
      width:'20%',
      dataIndex: 'sectionCode',
      key: 'sectionCode',
      render(text, record) {
        return <span title={text?text:null}>{text?text:null}</span>
        }
  },
  {
      title: '证书名称',
      width:'30%',
      dataIndex: 'certificateName',
      key: 'certificateName',
      render(text, record) {
        return <span title={text?text:null}>{text?text:null}</span>
        }
  },
  {
      title: '姓名',
      width:'20%',
      dataIndex: 'name',
      key: 'name',
      render(text, record) {
        return <span title={text?text:null}>{text?text:null}</span>
        }
  },
  {
      title: '状态',
      width:'20%',
      dataIndex: 'certificateState',
      key: 'certificateState',
      render(text, record) {
        return <span style={{color:`${text==1?'gold':(text==2?'red':null)}`}} title={text==1?'即将过期':(text==2?'已过期':null)}>{text==1?'即将过期':(text==2?'已过期':null)}</span>
        }
  }
];


export default LeaderPage;