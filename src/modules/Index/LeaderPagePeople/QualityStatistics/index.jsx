import React, { Component } from 'react';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
//质量问题统计
export class QualityStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLoading:false
    
    }
  }

getOption=()=>{
  return{
      legend: {
        x: 'right',
        itemWidth:13,
        itemHeight:13,
        textStyle:{
          color:'#8593b0'
      }
      },
      tooltip: {
        trigger: 'axis',
        // axisPointer: {  //鼠标悬浮时中轴线
        //   type: 'none'
  
        //   }
      },
      grid:{
        //  left: '5%',   // 与容器左侧的距离
        //  right: '5%', // 与容器右侧的距离
        //  top: '5%',   // 与容器顶部的距离
         bottom: '0%', // 与容器底部的距离
         containLabel: true
      },
      dataset: {
          dimensions: ['product', '已处理', '未处理', '逾期待处理'],
          source: [
              {product: '质量报验', '已处理': 43.3, '未处理': 85.8, '逾期待处理': 93.7},
              {product: '隐蔽工程', '已处理': 83.3, '未处理': 55.8, '逾期待处理': 33.7},
          ]
      },
      xAxis: {
        type: 'category',
        axisLine:{
          show:false
        },
        axisTick: {
          show: false
        },
        axisLabel:{
          color:'#8593b0'
        }
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
            type: 'bar',
            barWidth : 15,
            barGap:'200%',
            itemStyle: {
              normal: {
                  barBorderRadius:[10, 10, 10, 10],
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
            barGap:'200%',
            itemStyle: {
              normal: {
                  barBorderRadius:[10, 10, 10, 10],
                  color: '#33d0e5'
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
            barGap:'200%',
            itemStyle: {
              normal: {
                  barBorderRadius:[10, 10, 10, 10],
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
      <ReactEcharts option={this.getOption()} 
      style={{width: '100%',height:'100%'}}
      showLoading={this.state.showLoading}/>
    )
  }
}



export default QualityStatistics;