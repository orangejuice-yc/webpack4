import React, { Component } from 'react';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {getQuaInspectStatistics} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
//质量报验
export class QualityInspection extends Component {
  constructor(props) {
    super(props);
    this.state = {
        showLoading:true,
        total:0, //报验总数
        oneShot:0,  //一次通过数量
        corrective:0,  //整改通过数量
        notApproved:0,  //未通过数量
        oneShotRate:0,  //一次通过率
    }
  }
  componentDidMount(){
    this.getList()
  }
  getList=()=>{
  const {projectId} = this.props
      axios.get(getQuaInspectStatistics+`?projectId=${projectId}`).then(res=>{
          if(res.data.data){
              const {total,oneShot,corrective,notApproved,oneShotRate}= res.data.data
              this.setState({
                  total, 
                  oneShot,  
                  corrective,  
                  notApproved,  
                  oneShotRate,
                  showLoading:false  
              })
          }else{
            this.setState({
                total:0, 
                oneShot:0,  
                corrective:0,  
                notApproved:0,  
                oneShotRate:0,
                showLoading:false  
            })  
          }      
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
                top:'40%',
                style:{
                    text:this.state.oneShotRate+'%',
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
                    text:'一次通过率',
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
                data:['一次通过', '整改后通过','未通过' ],
                formatter:(name)=>{
                    let target;
                    let data= [
                        { value: this.state.oneShot, name: '一次通过' },
                        { value: this.state.corrective, name: '整改后通过' },
                        { value: this.state.notApproved, name: '未通过' }
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
                    name:'质量报验',
                    type:'pie',
                    radius: ['75%', '60%'],
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
                            value:this.state.oneShot,
                            name:'一次通过',
                            itemStyle: {
                            normal: {
                                color: '#6957fa'
                            }
                          }},
                        {
                            value:this.state.corrective, 
                            name:'整改后通过',
                            itemStyle: {
                            normal: {
                                color: '#33d0e5'
                            }
                          }},
                        {
                            value:this.state.notApproved, 
                            name:'未通过',
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
onclick = {
    'click': this.clickEchartsPie.bind(this)
}
clickEchartsPie(e) {
    if(e.dataIndex!==null){
        let status= ''
        if(e.dataIndex==0){
            status= '1'
        }else if(e.dataIndex==1){
            status= '0'
        }else if(e.dataIndex==2){
            status= '2'
        }
        const { projectId} = this.props
        const params = {projectId,status}
        localStorage.setItem("getQuaInspectStatistics", JSON.stringify(params))
        dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
        this.props.openMenuByMenuCode("QUALITY-REPORT", true);
        },"comucate")
    }
}

  render() { 
    return (
        <ReactEcharts
            option={this.getOption()} 
            style={{width: '100%',height:'100%'}}
            showLoading={this.state.showLoading}
            onEvents={this.onclick}
        />       
    )
  }
}



export default QualityInspection;