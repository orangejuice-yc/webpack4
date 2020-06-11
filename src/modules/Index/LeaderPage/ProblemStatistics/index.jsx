import React, { Component, Fragment } from 'react';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {issueClassificationStatistic} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
//问题趋势统计
export class ProblemStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading:true,
      classVosX:[], //问题类型
      classVosY1:[],  //问题已关闭
      classVosY2:[],  //问题未关闭
      classVosY3:[],  //问题总数
      monthVosX:[], //月份
      monthVosY:[], //按月份问题数量
    }
  }
  componentDidMount(){
    this.getList()
}
getList=()=>{
  const {projectId} = this.props
      axios.get(issueClassificationStatistic+`?projectId=${projectId}`).then(res=>{
        if(res.data.data){
            let data = res.data.data
            let classVosX = []
            let classVosY1 = []
            let classVosY2 = []
            let classVosY3 = []
            let monthVosX = []
            let monthVosY = []
            data['questionClassVos'].map((item,index)=>{
              classVosX.push(item.issueType)
              classVosY1.push({value:item.issueQuantity-item.unclosedQuantity,type:item.issueTypeCode})
              classVosY2.push({value:item.unclosedQuantity,type:item.issueTypeCode})
              classVosY3.push(item.issueQuantity)
            })
            data['questionMonthVos'].map((item,index)=>{
              monthVosX.push(item.month)
              monthVosY.push(item.monthIssueQuantity)
            })
            this.setState({
                classVosX, //问题类型
                classVosY1,  //问题已关闭
                classVosY2,  //问题未关闭
                classVosY3,
                monthVosX, //月份
                monthVosY, //按月份问题数量
                showLoading:false
            })
        }else{
          this.setState({
            classVosX:[], 
            classVosY1:[],  
            classVosY2:[], 
            classVosY3:[], 
            monthVosX:[], 
            monthVosY:[], 
            showLoading:false
        })
        }
      })
  }
//  跳转页面
onclick = {
  'click': this.clickEchartsPie.bind(this)
}
clickEchartsPie(e) {
    let status= ''
    if(e.seriesIndex==0){
        status= '3'
    }else if(e.seriesIndex==1){
        status= '0,1,2,4'
    }
    const { projectId} = this.props
    const params = {projectId,status,type:e.data.type,pageKey:'2'}
    localStorage.setItem("leaderQues", JSON.stringify(params))
    dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
        this.props.openMenuByMenuCode("CM-ISSUE", true);
    },"comucate")
}
  getOption1=()=>{
    return{
        legend: {
          x: 'right',
          itemWidth:13,
          itemHeight:13,
          textStyle:{
            color:'#8593b0'
          },
          data:['已关闭','未关闭']
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {  //鼠标悬浮时中轴线
            type: 'none'
            }
        },
        grid:{
            left:'5%',
            right:'7%',
            top:'9%',
            bottom:'4%',
            containLabel: true
        },
        xAxis: {
          type: 'category',
          axisLine:{
            show:true
          },
          axisTick: {
            show: false
          },
          axisLabel:{
            color:'#8593b0'
          },
          data: this.state.classVosX
      },
        yAxis: {
          axisLine:{show:false},
          show:false,
          axisLabel:{
            color:'#8593b0'
          }
        },
        series: [
            {
              name:'已关闭',
              type: 'bar',
              stack: 'chart',
              barWidth : 15,
              z: 3,
              itemStyle: {
                normal: {
                    color: '#6957fa'
                }
              },
              label: {
                normal: {
                    show: false,
                    position: 'inside'
                }
              },
              data:this.state.classVosY1
            },
            {
              name:'未关闭',
              type: 'bar',
              stack: 'chart',
              barWidth : 15,
              itemStyle: {
                normal: {
                    color: '#e8525b'
                }
              },
              label: {
                normal: {
                    show: true,
                    position: 'top',
                    formatter: (params)=> {　
                      return params.data.value + '/' + this.state.classVosY3[params.dataIndex]
                  }
                }
              },
              data:this.state.classVosY2
            }
        ]
    }
  }
 getOption2=()=>{
   return{
      title: {
         
      },
      tooltip: {
          trigger: 'axis'
      },
      legend: {
          x: 'right',
          itemWidth:13,
          itemHeight:13,
          icon:'roundRect',
          textStyle:{
            color:'#8593b0'
        },
          data:['问题数量']
      },
      grid: {
          left:'5%',
          right:'7%',
          top:'9%',
          bottom:'4%',
          containLabel: true
      },
      xAxis: {
          type: 'category',
          boundaryGap: true,
          axisTick : {show: true},
          // axisLine:{show:false},
          splitLine:{
            　　　　show:false
          }, 
          axisLabel:{
            color:'#8593b0'
          },
          data: this.state.monthVosX
      },
      yAxis: {
          type: 'value',
          axisTick : {show: true},
          // axisLine:{show:false},
          axisLabel:{
            color:'#8593b0'
          },
          splitLine:{
            　　　　show:false
          }
      },
      series: [
          {
              name:'问题数量',
              type:'line',
              stack: '总量',
              itemStyle: {
                normal: {
                    color: '#6957fa'
                }
              },
              label: {
                normal: {                    
                    show: false,
                    position: 'top'
                }
              },
              data:this.state.monthVosY
          }
      ]
   }
 }


  render() { 
    return (
      <Fragment>
        <ReactEcharts option={this.getOption1()} 
          style={{width: '100%',height:'50%'}}
          showLoading={this.state.showLoading}
          onEvents={this.onclick}/>
        <ReactEcharts option={this.getOption2()} 
          style={{width: '100%',height:'50%'}}
          showLoading={this.state.showLoading}/>
      </Fragment>
    )
  }
}



export default ProblemStatistics;