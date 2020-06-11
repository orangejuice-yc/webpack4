import React, { Component } from 'react';
import style from './style.less';
import ReactEcharts from 'echarts-for-react';
import axios from "@/api/axios"
import {getCheckStatistic} from '@/api/suzhou-api'
import * as dataUtil from "@/utils/dataUtil"
//安全检查
export class SecurityCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
        showLoading:true,
        issueClosedQuantity: 0,    //关闭数量
        issueClosedRate: 0,    //整改完成率
        issueQuantity: 0,  //问题数量
        orgCheckQuantity: 0,   //组织检查次数
    }
    }
    componentDidMount(){
        this.getList()
    }
    getList=()=>{
      const {projectId} = this.props
      this.setState({showLoading:true},()=>{
          axios.get(getCheckStatistic+`?projectId=${projectId}`).then(res=>{
            if(res.data.data){
                const {issueClosedQuantity,issueClosedRate,issueQuantity,orgCheckQuantity} = res.data.data
                this.setState({
                        issueClosedQuantity,
                        issueClosedRate,
                        issueQuantity,
                        orgCheckQuantity,
                        showLoading:false
                })
            }else{
                this.setState({
                    issueClosedQuantity:0,
                    issueClosedRate:0,
                    issueQuantity:0,
                    orgCheckQuantity:0,
                    showLoading:false
            }) 
            }
          })
      })
      }
  //  跳转页面
  onclick = {
      'click': this.clickEchartsPie.bind(this)
  }
  clickEchartsPie(e) {
      if(e.dataIndex!==null){
        let status= ''
        if(e.dataIndex==0){
            status= '3'
        }else if(e.dataIndex==1){
            status= '0,1,2,4'
        }
        const { projectId,checkStatus} = this.props
        const params = {projectId,checkStatus,status,pageKey:'1'}
        localStorage.setItem("leaderQues", JSON.stringify(params))
        dataUtil.CacheOpenProjectByType("comucate").addLastOpenProject(projectId,name, () => {
            this.props.openMenuByMenuCode("CM-ISSUE", true);
        },"comucate")
    }
  }
getOption=()=>{
    return{
            tooltip: {
                trigger: 'item',
                //formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            animation: false,
            graphic:[{
                type:'text',
                left:'center',
                top:'40%',
                style:{
                    text:this.state.issueClosedRate + '%',
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
                    text:'整改率',
                    fill:'#9b9b9b',
                    width:30,
                    height:30,
                    fontSize:12,
                }
            }],
            legend: {
                inactiveColor:'#6957fa',
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
                data:['整改问题','累计检查','发现问题'],
                selected:{
                    '整改问题':false,
                    '累计检查':false,
                    '发现问题':false
                },
                selectedMode:false,
                formatter:(name)=>{
                    let target;
                    let data= [
                        { value:this.state.issueClosedQuantity, name: '整改问题' },
                        { value:this.state.orgCheckQuantity, name: '累计检查' },
                        { value:this.state.issueQuantity, name: '发现问题' }
                    ]
                    for(let i=0;i<data.length;i++){
                        if(data[i].name===name){
                            target=data[i].value
                            if(i==1){
                                let arr=['{a|'+target+' 次}','{b|'+name+'}']
                                return arr.join("\n")
                            }else{
                                let arr=['{a|'+target+' 件}','{b|'+name+'}']
                                return arr.join("\n")
                            }
                        }
                    }
    
                }
            },
            series: [
                {
                    name:'安全检查',
                    type:'pie',
                    radius: ['75%', '60%'],
                    center: ['50%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center',                        
                        },
                        emphasis: {
                            show: false,
                            textStyle: {
                                fontSize: '12',
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
                            value:this.state.issueClosedQuantity, 
                            name:'已整改',
                            itemStyle: {
                                normal: {
                                    color: '#6957fa'
                                }
                              }},
                        {
                            value:this.state.issueQuantity-this.state.issueClosedQuantity, 
                            name:'未整改',
                            itemStyle: {
                                normal: {
                                    color: '#6957fa',
                                    opacity:0.1
                                }
                              }},
                              {
                                value:this.state.issueClosedQuantity, 
                                name:'整改问题',
                                itemStyle: {
                                normal: {
                                    color: '#e8525b',
                                    // opacity:0.1                           
                                }
                              }
                            }, 
                            {
                                value:this.state.orgCheckQuantity, 
                                name:'累计检查',
                                selected:false,
                                itemStyle: {
                                    normal: {
                                        color: '#33d0e5'
                                    }
                                  }},
                            {
                                value:this.state.issueQuantity, 
                                name:'发现问题',
                                itemStyle: {
                                    normal: {
                                        color: '#6957fa'
                                    }
                                  }}              
                    ]
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



export default SecurityCheck;