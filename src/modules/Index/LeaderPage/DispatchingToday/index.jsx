import React, { Component } from 'react';
import { Pagination } from 'antd';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/modules/Suzhou/components/Axios/axiosLong"
import {getPgdList} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
//今日派工统计

export class DispatchingToday extends Component {
  constructor(props) {
    super(props);
    this.state = {
        legendData:[],
        seriesData:[],  //出勤人数
        seriesData1:[], //派工单数量
        seriesData2:[], //派工人数
        showLoading:true,  
    }
  }

  componentDidMount(){
      this.getList()
  }
  getList=()=>{
    const {projectId,viewType} = this.props
    const params = {projectId,viewType}
    let type = ''
    if(viewType=='section'){
        type='sectionCode'
    }else if(viewType=='station'){
        type='stationName'
    }
    this.setState({showLoading:true},()=>{
        axios.get(getPgdList,{params}).then(res=>{
            if(res.data.data){
                let legendData = []
                let seriesData = []
                let seriesData1 = []
                let seriesData2 = []
                res.data.data.map((item,index)=>{
                    legendData.push(item[type])
                    seriesData.push(item['attendance']+'人')
                    seriesData1.push({value:item['pgdQuantity'],stationId:item['stationId'],sectionId:item['sectionId']})
                    seriesData2.push(item['workerQuantity']+'人')
                })
                this.setState({
                    seriesData,
                    legendData,
                    seriesData1,
                    seriesData2,
                    showLoading:false
                })
            }else{
                this.setState({
                    seriesData:[],
                    legendData:[],
                    seriesData1:[],
                    seriesData2:[],
                    showLoading:false
                })
            }
        })
    }) 
    }
//  跳转问题页面
onclick = {
    'click': this.clickEchartsPie.bind(this)
}
clickEchartsPie(e) {
    const { projectId,viewType} = this.props
    const params = {projectId,viewType,sectionId: e.data.sectionId,stationId: e.data.stationId}
    localStorage.setItem("pgdQus", JSON.stringify(params))
    dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
      this.props.openMenuByMenuCode("ST-DAILYSHEET", true);
    },"comucate");
}
getOption=()=>{
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
                data:['派工单数量'],
                show:true
            },
            grid: {
                left:'5%',
                right:'7%',
                top:'9%',
                bottom:'7%',
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
                    name:'派工单数量',
                    type:'bar',
                    stack: 'chart',
                    barWidth:10,
                    z: 3,
                    label: {
                        normal: {
                            color:'#6957fa',
                            show: true,
                            position:'right'
                        }
                    },
                    itemStyle: {
                        normal: {
                            // barBorderRadius:[10, 10, 10, 10],
                            color: '#6957fa'
                        }
                    },
                    data:this.state.seriesData1
                },
                {
                    name:'派工人数',
                    type: 'bar',
                    stack: 'chart',
                    silent: true,
                    barWidth : 10, 
                    label: {
                        normal: {
                            color:'#e8525b',
                            show: false,
                            position:'right'
                        }
                    },                   
                    itemStyle: {
                        normal: {
                            // barBorderRadius:[0, 10, 10, 0],
                            color: '#e8525b'
                        }
                    },
                    data:this.state.seriesData2
                },
                {
                    name:'出勤人数',
                    type: 'bar',
                    stack: 'chart',
                    silent: true,
                    barWidth : 10, 
                    label: {
                        normal: {
                            color:'#33d0e5',
                            show: false,
                            position:'right'
                        }
                    },                   
                    itemStyle: {
                        normal: {
                            // barBorderRadius:[0, 10, 10, 0],
                            color: '#33d0e5'
                        }
                    },
                    data: this.state.seriesData
                }
            ]
        }
    }
  render() { 
    return (
            <ReactEcharts option={this.getOption()} 
                style={{width: '100%',height:'100%'}}
                showLoading={this.state.showLoading}
                onEvents={this.onclick}
            />
    )
  }
}



export default DispatchingToday;