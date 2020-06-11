import React, { Component } from 'react';
import { Tabs} from 'antd';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {getAttendanceRecords} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
const { TabPane } = Tabs;
//质量报验
export class QualityInspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
        showLoading:true,
        type:'0',
        cqrs:0 ,//全部出勤人员
        jcrysl:0, //全部人员
        qqrs:0, //全部缺勤人员
        qjrs:0 ,//全部请假人员
        attendance:0 ,//出勤率
        legendData:[],  //标段号
        seriesData:[],  //缺勤
        seriesData1:[], //出勤
        seriesData2:[], //请假
        seriesData3:[], //总人数

    }
  }
  componentDidMount(){
    this.getList(this.state.type)
  }
  callback=(type)=>{
    this.setState({type},()=>{
        this.getList(this.state.type)
    })
  }
  getList=(type)=>{
  const {projectId} = this.props
  this.setState({showLoading:true},()=>{
      axios.get(getAttendanceRecords+`?projectId=${projectId}&type=${type}`).then(res=>{
          if(res.data.data){
            let legendData=[]
            let seriesData=[]
            let seriesData1=[]
            let seriesData2=[]
            let seriesData3=[]
              const {cqrs,qqrs,qjrs,attendance,list}= res.data.data
              list.map((item,index)=>{
                legendData.push(item['sectionCode'])
                seriesData.push({value:item['absenceNumber'],sectionId:item['sectionId']})
                seriesData1.push({value:item['attendanceQuantity'],sectionId:item['sectionId']})
                seriesData2.push({value:item['leaveNumber'],sectionId:item['sectionId']})
                seriesData3.push(item['allNums'])
            })
              this.setState({
                    cqrs,
                    qqrs, 
                    qjrs,
                    attendance,
                    legendData,
                    seriesData,
                    seriesData1,
                    seriesData2,
                    seriesData3,
                  showLoading:false  
              })
          }else{
            this.setState({
                cqrs:0,
                qqrs:0, 
                qjrs:0,
                attendance:0,
                legendData:[],
                seriesData:[],
                seriesData1:[],
                seriesData2:[],
                seriesData3:[],
                showLoading:false  
            })  
          }      
      })
  })
  }
  getOption=()=>{
    return{
            tooltip: {
                trigger: 'item',
                //formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            animation:false,
            graphic:[{
                type:'text',
                left:'center',
                top:'35%',
                style:{
                    text:this.state.attendance+'%',
                    fill:'#2f3a4f',
                    width:30,
                    height:30,
                    fontSize:26,
                }
            },{
                type:'text',
                left:'center',
                top:'60%',
                style:{
                    text:'出勤率',
                    fill:'#9b9b9b',
                    width:30,
                    height:30,
                    fontSize:12,
                }
            }],
            legend: {
                itemWidth:3,
                itemHeight:25,
                orient: 'vertical',
                align:'left',
                x: 'right',
                textStyle:{
                    rich:{
                        a:{
                            fontSize:13,
                            fontWeight:'400',
                            color:'#000'
                        },
                        b:{
                            fontSize:12,
                            color:'#9b9b9b'
                        }
                    }
                },
                data:['出勤人数', '请假人数','缺勤人数' ],
                formatter:(name)=>{
                    let target;
                    let data= [
                        { value: this.state.cqrs, name: '出勤人数' },
                        { value: this.state.qjrs, name: '请假人数' },
                        { value: this.state.qqrs, name: '缺勤人数' }
                    ]
                    for(let i=0;i<data.length;i++){
                        if(data[i].name===name){
                            target=data[i].value
                        }
                    }
                    let arr=['{a|'+target+'}','{b|'+name+'}']
                    return arr.join("\n")
    
                }
            },
            series: [
                {
                    name:'实时考勤',
                    type:'pie',
                    radius: ['85%', '70%'],
                    avoidLabelOverlap: false,
                    center: ['50%', '50%'],
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {
                            value:this.state.cqrs,
                            name:'出勤人数',
                            itemStyle: {
                            normal: {
                                color: '#6957fa'
                            }
                          }},
                        {
                            value:this.state.qjrs, 
                            name:'请假人数',
                            itemStyle: {
                            normal: {
                                color: '#33d0e5'
                            }
                          }},
                        {
                            value:this.state.qqrs, 
                            name:'缺勤人数',
                            itemStyle: {
                                normal: {
                                    color: '#e8525b'
                                }
                              }}               
                    ]
                }
            ]
    }
}
getOption2=()=>{
    return{
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function(params) {
                        let result = ''
                        let data = ''
                        params.forEach(function (item,index) {        
                            result += item.marker + " " + item.seriesName + " : " + item.value +"</br>";
                            data = item.name + "</br>" + result
                        });
                        return data;
                }
            },
            legend: {
                x: 'right',
                itemWidth:13,
                itemHeight:13,
                textStyle:{
                    color:'#8593b0'
                },
                data:['出勤人数', '请假人数','缺勤人数' ],
                show:true
            },
            grid: {
                left: '4%',
                right: '10%',
                bottom: '5%',
                top:'3%',
                containLabel: true
            },
            xAxis : 
                {
                    show:false,
                    axisLabel:{
                        color:'#8593b0'
                      },
                    type : 'value'
                }
            ,
            yAxis : 
                {
                    type : 'category',
                    axisTick : {show: false},
                    axisLine:{show:false},
                    axisLabel:{
                        color:'#8593b0'
                      },
                    data : this.state.legendData
                    
                }
            ,
            dataZoom: [
                {
                    id: 'dataZoomY',
                    type: 'inside',
                    yAxisIndex: [0],
                    filterMode: 'empty',
                }
            ],
            series : [           
                {
                    name:'出勤人数',
                    type:'bar',
                    stack: 'chart',
                    barWidth:10,
                    z: 3,
                    label: {
                        normal: {
                            color:'#6957fa',
                            show: false,
                            position:'top'
                        }
                    },
                    itemStyle: {
                        normal: {
                            // barBorderRadius:[10, 0, 0, 10],
                            color: '#6957fa'
                        }
                    },
                    data:this.state.seriesData1
                },
                {
                    name:'请假人数',
                    type: 'bar',
                    stack: 'chart',
                    silent: false,
                    barWidth : 10, 
                    z: 2,
                    label: {
                        normal: {
                            color:'#33d0e5',
                            show: false,
                            position:'top'
                        }
                    },                   
                    itemStyle: {
                        normal: {
                            color: '#33d0e5'
                        }
                    },
                    data:this.state.seriesData2
                },
                {
                    name:'缺勤人数',
                    type: 'bar',
                    stack: 'chart',
                    silent: false,
                    barWidth : 10, 
                    label: {
                        normal: {
                            color:'#e8525b',
                            show: true,
                            position:'right',
                            formatter: (params)=> {　
                                return params.data.value + '/' + this.state.seriesData3[params.dataIndex]
                            }
                        }
                    },                   
                    itemStyle: {
                        normal: {
                            // barBorderRadius:[0, 10, 10, 0],
                            color: '#e8525b'
                        }
                    },
                    data: this.state.seriesData
                }
            ]
        }
    }
onclick = {
    'click': this.clickEchartsPie.bind(this)
}
clickEchartsPie(e) {
        const { projectId} = this.props
        const params = {projectId,sectionId:e.data.sectionId,type:this.state.type}
        localStorage.setItem("AttenQus", JSON.stringify(params))
        dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
        this.props.openMenuByMenuCode("STAFF-ATTENDLOG", true);
        },"comucate")
}

  render() { 
    return (
        <div className={style.main}>
            <Tabs defaultActiveKey="0" onChange={this.callback} size={"small"} type={'card'} >              
                <TabPane tab="全部" key="2" >
                    <ReactEcharts
                        option={this.getOption()} 
                        style={{width: '100%',height:'30%'}}
                        showLoading={this.state.showLoading}
                    /> 
                    <ReactEcharts
                        option={this.getOption2()} 
                        style={{width: '100%',height:'70%'}}
                        showLoading={this.state.showLoading}
                        onEvents={this.onclick}
                    />
                </TabPane>
                <TabPane tab="管理人员" key="0" >
                    <ReactEcharts
                        option={this.getOption()} 
                        style={{width: '100%',height:'30%'}}
                        showLoading={this.state.showLoading}
                    /> 
                    <ReactEcharts
                        option={this.getOption2()} 
                        style={{width: '100%',height:'70%'}}
                        showLoading={this.state.showLoading}
                        onEvents={this.onclick}
                    />
                </TabPane>
                <TabPane tab="劳务人员" key="1" >
                    <ReactEcharts
                        option={this.getOption()} 
                        style={{width: '100%',height:'30%'}}
                        showLoading={this.state.showLoading}
                    /> 
                    <ReactEcharts
                        option={this.getOption2()} 
                        style={{width: '100%',height:'70%'}}
                        showLoading={this.state.showLoading}
                        onEvents={this.onclick}
                    />
                </TabPane>
            </Tabs>
        </div>
              
    )
  }
}



export default QualityInspection;