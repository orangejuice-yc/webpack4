import React, { Component } from 'react';
import { Statistic, Row, Col, Tabs} from 'antd';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';
import 'echarts/map/js/china.js';
import { chinaMap } from '@/modules/Suzhou/components/Util/util';
chinaMap
export class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList:[]
    }
  }

  componentDidMount(){
      
  }
  getOption=()=>{
    var option = {
      textStyle: {
          fontSize: 8,
          color: '#666'
      },
      tooltip: {
        formatter:function(params,ticket, callback){
            return params.seriesName+'<br />'+params.name+':'+params.value
        }//数据格式化
      },
      visualMap: {
          itemGap:5,
          color:'#666',
          bottom: 10,
          left: 'center',
          pieces: [
            {
              value:0,
              color: '#faa98a',
              label:"0"
          }, 
          {
              gte: 1,
              lte: 9,
              color: '#fd7c6b',
              label:"1-9"
          }, {
              gte: 10,
              lte: 99,
              color: '#ca292e',
              label:"10-99",
          }, {
              gte: 100,
              lte: 999,
              color: '#8b1a19',
              label:"100-999"
          }, {
              gte: 1000,
              color: '#630e0d',
              label:">1000"
          }],
        outOfRange: {
            color: '#fff'
        },
        orient:'horizontal',
        itemWidth:'10',
        itemHeight :'4',
        textGap:0,
      },
      geo: {
          map: 'china',
          top: 15,
          roam: false,//不开启缩放和平移
          zoom: 1,//视角缩放比例
          label: {
              normal: {
                  show: true,
                  fontSize:'7',
                  color: 'rgba(0,0,0,0.7)'
              }
          },
          itemStyle: {
              normal:{
                  borderColor: 'rgba(0, 0, 0, 0.2)'
              }
          }
      },
      series : [
          {
              name: '返苏人员',
              type: 'map',
              geoIndex: 0,
              data:chinaMap.concat(this.props.homeFromList)
          }
      ]
  };
    return option;
  }

  render() { 
    return (
      <div className={style.main}> 
      <p className={style.echartTitle}>返苏人员来向分布</p>
       <ReactEcharts option={this.getOption()} 
              style={{width: '100%',height:'240px'}} />
      </div>
    )
  }
}



export default Map;