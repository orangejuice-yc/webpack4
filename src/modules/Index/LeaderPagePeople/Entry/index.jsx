import React, { Component } from 'react';
import { Statistic, Row, Col, Tabs} from 'antd';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {getWorkersList} from '@/api/suzhou-api'
const { TabPane } = Tabs;
//实时考勤
export class Attendance extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading:true,
      viewType:'managers',
      presenceNumber:'',
      enteringNumber:'',
      exitNumber:'',
      list:[],
    }
  }

  componentDidMount(){
    this.getList(this.state.viewType)
  }
  callback=(key)=>{
    let viewType=''
    if(key==1){
      viewType=''
    }else if(key==2){
      viewType='managers'
    }else if(key==3){
      viewType='contractWorkers'
    }
    this.setState({viewType},()=>{
      this.getList(this.state.viewType)
    })
    
  }
  getList=(viewType)=>{
  const {projectId} = this.props
  let list=[]
  this.setState({showLoading:true},()=>{
    axios.get(getWorkersList+`?projectId=${projectId}&viewType=${viewType}`).then(res=>{
        if(res.data.data){
            const {presenceNumber,enteringNumber,exitNumber}= res.data.data
            let workListMonthVos = res.data.data.workListMonthVos
            if(workListMonthVos.length>6){
              workListMonthVos=workListMonthVos.slice(workListMonthVos.length-6)
            }
            workListMonthVos.map((item,index)=>{
              list.push({product: item.month, '进场': item.enteringNumber, '退场': item.exitNumber})
            })
            this.setState({
              presenceNumber,
              enteringNumber,
              exitNumber,
              list,
              showLoading:false  
            })
        }else{
          this.setState({
              presenceNumber:'',
              enteringNumber:'',
              exitNumber:'',
              list:[],
              showLoading:false  
          })  
        }      
    })
  })
  }
  getOption=()=>{
    return{
        legend: {
          x: 'right',
          y:'bottom',
          itemWidth:13,
          itemHeight:13,
          textStyle:{
            color:'#8593b0'
        }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {  //鼠标悬浮时中轴线
            type: 'none'
    
            }
        },
        grid:{
          //  left: '5%',   // 与容器左侧的距离
          //  right: '5%', // 与容器右侧的距离
          //  top: '5%',   // 与容器顶部的距离
          //  bottom: '10%', // 与容器底部的距离
          //  containLabel: true
        },
        dataset: {
            dimensions: ['product', '进场', '退场'],
            source: this.state.list
        },
        xAxis: {
          type: 'category',
          axisLine:{
            show:true
          },
          axisTick: {
            show: true
          },
          axisLabel:{
            color:'#8593b0'
          }
      },
        yAxis: {
          axisLine:{show:true},
          show:true,
          axisLabel:{
            color:'#8593b0'
          }
        },
        dataZoom: [
          {
              id: 'dataZoomX',
              type: 'inside',
              xAxisIndex:[0],
              filterMode: 'empty',
          }
      ],
        series: [
            {
              type: 'bar',
              barWidth : 15,
              itemStyle: {
                normal: {
                    color: '#6957fa'
                }
              },
              label: {
                normal: {
                    show: true,
                    position: 'top'
                }
              }
            },
            {
              type: 'bar',
              barWidth : 15,
              itemStyle: {
                normal: {
                  color: '#e8525b'
                }
              },
              label: {
                normal: {
                    show: true,
                    position: 'top'
                }
              }
            }
        ]
    }
  }

  render() { 
    return (
      <div className={style.main}> 
        <Tabs defaultActiveKey="2" onChange={this.callback} size={"small"} type={'card'} >              
            <TabPane tab="全部" key="1" >
              <div className={style.flexBox} style={{width: '100%',height:'30%'}}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Statistic title=" " value={this.state.presenceNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>在场人数</span>} valueStyle={{fontSize:'36px',color: '#33d0e5'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.enteringNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>进场</span>} valueStyle={{color: '#6957fa'}} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={2}>
                    <Statistic value=' ' prefix={<div style={{width:'1px',height:'40px',backgroundColor:"#eee"}}></div>} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.exitNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>退场</span>} valueStyle={{color: '#e8525b'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
              </div>
                  <ReactEcharts option={this.getOption()} 
                    style={{width: '100%',height:'70%'}}
                    showLoading={this.state.showLoading}/>
            </TabPane>
            <TabPane tab="管理人员" key="2">
            <div className={style.flexBox} style={{width: '100%',height:'30%'}}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Statistic title=" " value={this.state.presenceNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>在场人数</span>} valueStyle={{fontSize:'36px',color: '#33d0e5'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.enteringNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>进场</span>} valueStyle={{color: '#6957fa'}} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={2}>
                    <Statistic value=' ' prefix={<div style={{width:'1px',height:'40px',backgroundColor:"#eee"}}></div>} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.exitNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>退场</span>} valueStyle={{color: '#e8525b'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
              </div>
                  <ReactEcharts option={this.getOption()} 
                    style={{width: '100%',height:'70%'}}
                    showLoading={this.state.showLoading}/>
            </TabPane>
            <TabPane tab="劳务人员" key="3">
            <div className={style.flexBox} style={{width: '100%',height:'30%'}}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Statistic title=" " value={this.state.presenceNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>在场人数</span>} valueStyle={{fontSize:'36px',color: '#33d0e5'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.enteringNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>进场</span>} valueStyle={{color: '#6957fa'}} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={2}>
                    <Statistic value=' ' prefix={<div style={{width:'1px',height:'40px',backgroundColor:"#eee"}}></div>} style={{textAlign:'center'}}/>
                  </Col>
                  <Col span={11}>
                    <Statistic title=" " value={this.state.exitNumber} prefix={<span style={{fontSize:'14px',color: '#8593b0'}}>退场</span>} valueStyle={{color: '#e8525b'}} style={{textAlign:'center'}}/>
                  </Col>
                </Row>
              </div>
                  <ReactEcharts option={this.getOption()} 
                    style={{width: '100%',height:'70%'}}
                    showLoading={this.state.showLoading}/>
            </TabPane>
        </Tabs>
      </div>



    )
  }
}



export default Attendance;