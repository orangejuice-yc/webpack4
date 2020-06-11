import React, { Component ,Fragment} from 'react';
import { Card ,Spin,Table,Row, Col,Statistic,Icon,Divider,DatePicker} from 'antd';
import style from './style.less';
import axios from "@/api/axios"
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import {peopleBackStatistics,dailyReportStatistics,queryStatisticalStopRework} from '@/modules/Suzhou/api/suzhou-api';
import ReactEcharts from 'echarts-for-react';
import ReturnHome from './ReturnHome'
import MyIcon from '@/components/public/TopTags/MyIcon';
import moment, { months } from 'moment';

export class Echart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading:false,
      xLineStyle:{lineStyle:{color:"#E3E3E3"}},
      xLabelStyle:{color:["#585858"]},
      splitLineStyle:{show:false,lineStyle:{type:'dashed'}},
      barRadius:[15,15,0,0],
      barBgColor: ["#2EB49D","#6195CF","#777F9C"],
      legendData:["未申请","审批中",'已开工'],
      peopleBackNum:'',//人员返苏(返苏)
      isolationPeopleNum:'',//人员返苏(隔离)
      peopleBackNumList:[],//人员返苏（折线返苏人员）
      isolationPeopleNumList:[],//人员返苏（折线隔离人员）
      dateList:[],//人员返苏（折线日期）
      homeFromList:[],//人员返苏（来向）
      jrjcNum:'',//每日疫情(今日进场)
      twycNum:'',//每日疫情(体温异常)
      yxgcNum:'',//每日疫情(医学观察)
      fykzcblNum:'',//每日疫情(口罩)
      xdycblNum:'',//每日疫情(消毒液)
      cwjcblNum:'',//每日疫情(体温计)
      completed:'',//复工统计（完成）
      approval:'',//复工统计（审核）
      todayCompleted:'',//复工统计（今日复工数）
      returnRate:'',//复工统计（复功率）
      fugongProName:[],//复工 项目名称
      fugongCompleted:[],//复工  完成申请
      fugongApproval:[],//复工   申请
      fugongNoApplication:[],//复工  未申请
      time:'',//
    }
  }
  componentDidMount(){
    var day1 = new Date();
    day1.setTime(day1.getTime()-24*60*60*1000);
    var time = day1.getFullYear()+"-" + (((day1.getMonth()+1)+'').length == 1?('0'+(day1.getMonth()+1)):(day1.getMonth()+1)) + "-" + day1.getDate();
    this.setState({time},()=>{
      this.getDailyReport();
    })
   axios.get(peopleBackStatistics).then(res=>{
     if(res.data.data){
       this.setState({
        peopleBackNum:res.data.data.peopleBackNum,
        isolationPeopleNum:res.data.data.isolationPeopleNum,
        homeFromList:!res.data.data.homeFromList?[]:res.data.data.homeFromList
       })
       this.initData(res.data.data.peopleBackStatisticsVoList);
     }
   })
  
   axios.get(queryStatisticalStopRework).then(res=>{
     if(res.data.data){
       const data = res.data.data;
       this.setState({
        completed:data.completed,
        approval:data.approval,
        todayCompleted:data.todayCompleted,
        returnRate:data.returnRate
       })
       this.initData1(data.stopReworkProjectVos);
     }
   })
  }
  getDailyReport=()=>{
    axios.get(dailyReportStatistics+`?writtenDate=${this.state.time}`).then(res=>{
      if(res.data.data){
        this.setState({
         jrjcNum:res.data.data.jrjcNum,
         twycNum:res.data.data.twycNum,
         yxgcNum:res.data.data.yxgcNum,
         fykzcblNum:res.data.data.fykzcblNum,
         xdycblNum:res.data.data.xdycblNum,
         cwjcblNum:res.data.data.cwjcblNum
        })
      }
    })
  }
  initData=(res)=>{
    if(res.length > 0){
      const dateList = [];
      const isolationPeopleNumList = [];
      const peopleBackNumList = [];
      res.map(item=>{
        peopleBackNumList.push(item.peopleBackNum);
        isolationPeopleNumList.push(item.isolationPeopleNum);
        dateList.push(moment(item.backDate).format('MM-DD'))
      })
      this.setState({
        loadFlag:true,
        dateList:dateList.reverse(),
        isolationPeopleNumList:isolationPeopleNumList.reverse(),
        peopleBackNumList:peopleBackNumList.reverse()
      })
    }
  }
  initData1=(res)=>{
    if(res.length > 0){
      const fugongProName = [];
      const fugongCompleted = [];
      const fugongApproval = [];
      const fugongNoApplication = [];
      res.map(item =>{
        fugongProName.push(item.name);
        fugongCompleted.push(item.completed)
        fugongApproval.push(item.approval);
        fugongNoApplication.push(item.noApplication);
      })
      this.setState({
        fugongLoad:true,
        fugongProName,fugongCompleted,fugongApproval,fugongNoApplication
      })
    }
  }
  getOption=()=>{
    var option = {
      //鼠标触发提示数量
      tooltip: {
         trigger: "axis",
         axisPointer:{
           type:"line",
           itemStyle:{
             color:"red"
           }
         }
      },
      //x轴显示
      xAxis: {
          data: this.state.fugongProName,
          axisLine:this.state.xLineStyle,
          axisLabel:this.state.xLabelStyle,
          splitLine:{
          　　　　	show:false
        }
      },
      //y轴显示
      yAxis: {
        axisLine:this.state.xLineStyle,
        axisLabel:{
          formatter:'{value}',color:["#585858"]},
        splitLine:this.state.splitLineStyle,
      },
      series: [
      {
            name: "未申请",
            type: "bar",
            stack: "业务",//折叠显示
            data: this.state.fugongNoApplication,
            barWidth : 20,
            barGap: '-100%', // Make series be overlap
            itemStyle:{  
                 normal:{color:"#cccccc"}  
            }
       },
        {
           name: "审批中",
           type: "bar",
           data: this.state.fugongApproval,
           barWidth : 20,
           z: 10,
            itemStyle:{  
                 normal:{color:"#fffd38"}  
              }
        },
        {
          name: "已开工",
          type: "bar",
          data: this.state.fugongCompleted,
          barWidth : 20,
          z: 10,
           itemStyle:{  
                normal:{color:"#41b9f0"}  
             }
       }
         
       ]
  };
    return option
  }
  getOption1=()=>{
    var option1 = {
          tooltip: {
            trigger: 'axis',
            textStyle:{
              align:'left',
              fontSize:'12',
            }
        },
        grid: {
            left: '3%',
            right: '5%',
            bottom: '0%',
            top:"2%",
            containLabel: true,
        },
        xAxis: {
            type: 'category',
    				boundaryGap: false,
            data: this.state.dateList,
            axisLine:this.state.xLineStyle,
        },
        yAxis: {
            type: 'value',
            axisLine:this.state.xLineStyle,
            splitLine:{
      　　　　		show:false
      　　		},
        },
        series: [
            {
                name:'返苏人员',
                type:'line',
                stack: '总量',
                data:this.state.peopleBackNumList,
                itemStyle:{  
                  normal:{color:"#818cc4"}  
              }
            },
            {
                name:'隔离人员',
                type:'line',
                stack: '总量',
                data:this.state.isolationPeopleNumList,
                itemStyle:{
                  normal:{color:"#353666"}
                }
            },
        ]
    };
    return option1
  }
  onClickHandleCheck(modules){
    this.props.openMenuByMenuCode(modules,true);
  }
  //搜索日期
  changeTime=(date, dateString)=>{
    this.setState({time:dateString},()=>{
      this.getDailyReport();
    })
  }
  render() {
    return (
      <div className={style.gutter}>
        <Row gutter={16}>
          <Col className={style.gutterRow} span={8}>
            <div className={style.gutterBox}>
                <Card title="标段复工情况" bordered={false} extra={<Icon type="right" onClick={this.onClickHandleCheck.bind(this,'RETURNHOME-STOPREVORKAPPLY1')}  /> }>
                        <Row className={style.dataTips} >
                            <Col span={12} className={style.leftBox+' '+style.dataTipsBox}>
                                <span>已复工</span>
                                <span className={style.fr}><label>{this.state.completed}</label>家</span>
                            </Col>
                            <Col span={12} className={style.rightBox+' '+style.dataTipsBox}>
                                <span>审核中</span>
                                <span className={style.fr}><label>{this.state.approval}</label>家</span>
                            </Col>
                            {this.state.returnRate && (
                              <Col span={12} className={style.leftBox+' '+style.dataTipsBox}>
                                <span>复功率</span>
                                <span className={style.fr}><label>{this.state.returnRate}</label></span>
                            </Col>
                            )}
                            <Col span={12} className={style.rightBox+' '+style.dataTipsBox}>
                                <span>今日新增复工</span>
                                <span className={style.fr}><label>{this.state.todayCompleted}</label>家</span>
                            </Col>
                        </Row>
                    <div>
                    {this.state.fugongLoad && (
                      <ReactEcharts option={this.getOption()} 
                        style={{width: '100%',height:'300px'}}/>
                    )}
                    </div>
                </Card>
            </div>
          </Col>
          <Col className={style.gutterRow} span={8}>
            <div className={style.gutterBox}>
              <Card title="人员返苏情况" bordered={false} className={style.returnHome} extra={<Icon type="right" onClick={this.onClickHandleCheck.bind(this,'RETURNHOME-PEOPLEBACK')} /> } >
                      <Row className={style.dataTips+' '+style.dataTips1}>
                          <Col span={12} className={style.leftBox+' '+style.dataTipsBox}>
                              <span>返苏人员</span>
                              <span className={style.fr}><label>{this.state.peopleBackNum}</label>人</span>
                          </Col>
                          <Col span={12} className={style.rightBox+' '+style.dataTipsBox}>
                              <span>隔离人员</span>
                              <span className={style.fr}><label>{this.state.isolationPeopleNum}</label>人</span>
                          </Col>
                      </Row>
                      {this.state.loadFlag &&(
                        <ReactEcharts option={this.getOption1()} 
                        style={{width: '100%',height:'150px'}} />
                      )}
                    
                    <ReturnHome homeFromList = {this.state.homeFromList}></ReturnHome>
              </Card>
            </div>
          </Col>
          <Col className={style.gutterRow} span={8}>
            <div className={style.gutterBox}>
                <Card title="每日疫情上报" bordered={false} className={style.daily} extra={<Icon type="right" onClick={this.onClickHandleCheck.bind(this,'RETURNHOME-REPORT')} /> }>
                  <Row gutter={16} className={style.dailyData}>
                    <Col span={12}>
                    </Col>
                    <Col span={12} className={style.dateBox}>
                      <DatePicker style={{width:'100%'}} value={(this.state.time===undefined||this.state.time==="")?null:moment(this.state.time, 'YYYY-MM-DD')} onChange = {this.changeTime.bind(this)} allowClear={false}/>
                    </Col>
                    <Col span={24}>
                      <Statistic title="当日进场" value={this.state.jrjcNum} suffix="  人" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="体温异常" value={this.state.twycNum} suffix="  人" />
                    </Col>
                    <Col span={12}>
                      <Statistic title="医学观察" value={this.state.yxgcNum} suffix="  人" />
                    </Col>
                  </Row>
                  <div className={style.dividerBox}><Divider>物资准备情况</Divider></div>
                  <div className={style.wuziBox}>
                  
                      <Row gutter={16} className={style.wuzi}>
                          <Col span={6} className={style.iconfont1}>
                              <MyIcon type="iconkouzhao" style={{fontSize:48}}/>
                          </Col>
                          <Col span={6} className={style.tips}>
                            口罩
                          </Col>
                          <Col span={12} className={style.tips1}>
                              {/* <p> */}
                              <span>现有</span><label>{this.state.fykzcblNum}个</label>
                              {/* </p> */}
                          </Col>
                      </Row>
                      <Row gutter={16} className={style.wuzi}>
                          <Col span={6}  className={style.iconfont1}>
                              <MyIcon type="icontiwenji" style={{fontSize:48}}/>
                          </Col>
                          <Col span={6} className={style.tips}>
                            测温计
                          </Col>
                          <Col span={12} className={style.tips1}>
                              <p><span>现有</span><label>{this.state.xdycblNum}支</label></p>
                          </Col>
                      </Row>
                      <Row gutter={16} className={style.wuzi}>
                          <Col span={6} className={style.iconfont1}>
                              <MyIcon type="iconxiaodu" style={{fontSize:48}}/>
                          </Col>
                          <Col span={6} className={style.tips}>
                            消毒液
                          </Col>
                          <Col span={12} className={style.tips1}>
                              <p><span>现有</span><label>{this.state.cwjcblNum}kg</label></p>
                          </Col>
                      </Row>
                  </div>
                </Card>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
export default Echart;