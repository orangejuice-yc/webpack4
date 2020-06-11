import React, { Component } from 'react';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {getConstruct} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
//施工考评
export class ConstructionEvaluation extends Component {
  constructor(props) {
    super(props);
    this.state = {
        legendData:[],  //标段名称
        seriesData:[],  //得分
        seriesData1:[],
        showLoading:true
    }
  }
  componentDidMount(){
    this.getList()
}
// 数据排序
//   sortObj=(data,legendDataR,seriesDataR,seriesData1R)=> {    
//     const newData= data.sort(
//         function(a, b) {  
//             return a['totalScore'] - b['totalScore']
//         })
//     let legendDataL = []
//     let seriesDataL = []
//     let seriesData1L = []
//     newData.map((item,index)=>{
//         legendDataL.push(item['sectionCode'])
//         seriesDataL.push({value:item['totalScore'],sectionId:item['sectionId']})
//         seriesData1L.push({value:100-item['totalScore'],sectionId:item['sectionId']})
//     })
//     this.setState({
//         legendData:legendDataR.concat(legendDataL),
//         seriesData:seriesDataR.concat(seriesDataL),
//         seriesData1:seriesData1R.concat(seriesData1L),
//         showLoading:false
//     })
//   }
getList=()=>{
  const {projectId,season,year} = this.props
  const params = {projectId,season,year}
  this.setState({showLoading:true},()=>{
    axios.get(getConstruct,{params}).then(res=>{
        if(res.data.data){
          let legendData = []
          let seriesData = []
          let seriesData1 = []
          res.data.data.map((item,index)=>{
            legendData.push(item['sectionCode'])
            seriesData.push({value:item['totalScore']?item['totalScore']:'未评分',sectionId:item['sectionId']})
            seriesData1.push({value:100-(item['totalScore']?item['totalScore']:0),sectionId:item['sectionId']})
            //   if(item['totalScore']){
            //       data1.push(item)
            //   }else{
            //       legendDataR.push(item['sectionCode'])
            //       seriesDataR.push({value:'未评分',sectionId:item['sectionId']})
            //       seriesData1R.push({value:100,sectionId:item['sectionId']})
            //   }
          })
            this.setState({
                legendData:legendData,
                seriesData:seriesData,
                seriesData1:seriesData1,
                showLoading:false
              })
        //   this.sortObj(data1,legendDataR,seriesDataR,seriesData1R)
      }else{
          this.setState({
              legendData:[],
              seriesData:[],
              seriesData1:[],
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
  const { projectId,year,season} = this.props
  const params = {projectId,sectionId: e.data.sectionId,year,season}
  localStorage.setItem("constructQus", JSON.stringify(params))
  dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
    this.props.openMenuByMenuCode("SECURITY-CONSTRUCTIONEVALUATION", true);
  },"comucate");
}
 getOption=()=>{
     return{
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                // formatter:'{b0}<br/>得分:{c0}'
                formatter: function(params) {
                        var result = '';
                        params.forEach(function (item,index) {
                            if(index==0){
                             result = item.name + "</br>" +item.marker + " " + item.seriesName + " : " + item.value +"</br>";
                            }
                        });
                        return result;
                    }

            },
            legend: {
                x: 'right',
                itemWidth:13,
                itemHeight:13,
                textStyle:{
                    color:'#8593b0'
                },
                data:['得分'],
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
                {   show:false,
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
                    name:'得分',
                    type:'bar',
                    stack: 'chart',
                    barWidth : 10,
                    z: 3,
                    label: {
                        normal: {
                            color:'#8593b0',
                            show: true,
                            position:'right'
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: '#6957fa'
                        }
                    },
                    data:this.state.seriesData
                },
                {
                    type: 'bar',
                    stack: 'chart',
                    silent: false,
                    barWidth : 10, 
                    label: {
                        normal: {
                            color:'#8593b0',
                            show: false,
                            position:'right'
                        }
                    },                   
                    itemStyle: {
                        normal: {
                            color: '#ccc'
                        }
                    },
                    data: this.state.seriesData1
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



export default ConstructionEvaluation;