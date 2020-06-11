import React, { Component} from 'react';
import { List, Tooltip ,Spin} from 'antd';
import style from './style.less';
import {getLeaderInfo} from '@/api/suzhou-api'
import { firstLoad } from '@/modules/Suzhou/components/Util/firstLoad';
import axios from "@/api/axios"
//计划进展情况
export class ProgressPlanning extends Component {
  constructor(props) {
    super(props);
    this.state = {
        loading:true,
        data:[],  //主数据
    }
  }
componentDidMount(){
    firstLoad().then(res => {
      this.setState(
        {
          projectId: res.projectId,
          projectName: res.projectName,
          sectionIds: res.sectionId,
        },() =>  
        axios.get(getLeaderInfo(res.projectId)).then((res)=>{
          //   const res1=[
          //     {actStartTime: "2019-10-15 08:30:00",
          //     completePct: 69.04,
          //     construction: {id: "11", name: "供电系统1"},
          //     id: 1155303,
          //     org: {id: "1082130", name: "中铁七局集团电务公司"},
          //     planEndTime: "2020-09-10 17:30:00",
          //     planStartTime: "2019-10-15 08:30:00",
          //     section: {id: "1082127", name: "供电系统安装施工1标"},
          //     taskCode: "1",
          //     taskName: "牵引供电系统工程1",
          //     user: {id: "1104432", name: "李俊龙"}},
          // ]
            const dataInfo = []
            const construction=[]
            if(res.data.data.length>0){
              res.data.data.map((item,index)=>{
                if(construction.indexOf(item.construction.id)==-1){
                  construction.push(item.construction.id)
                  const dataItem ={construction:'',data:[]}            
                  dataItem.construction = item.construction.name  
                  dataItem.data.push(
                    { name:item.taskName,width:item.completePct?item.completePct:0,num:item.completePct?item.completePct:0,
                      data1:item.planStartTime?item.planStartTime:'',data2:item.planEndTime?item.planEndTime:'',
                      data3:item.actStartTime?item.actStartTime:'',data4:item.actEndTime?item.actEndTime:'',
                      person:item.user.name}         
                    )
                    dataInfo.push(dataItem)
                  }else{
                    dataInfo.map((item1,index)=>{
                      if(item1.construction==item.construction.name){
                        item1.data.push(
                          { name:item.taskName,width:item.completePct?item.completePct:0,num:item.completePct?item.completePct:0,
                            data1:item.planStartTime?item.planStartTime:'',data2:item.planEndTime?item.planEndTime:'',
                            data3:item.actStartTime?item.actStartTime:'',data4:item.actEndTime?item.actEndTime:'',
                            person:item.user.name}         
                          )
                      }
                    })
                  }
                })
              }else{
                dataInfo.push({construction:'暂无数据',data:[]})
              }
            this.setState({
              data:dataInfo,
              loading:false,
            })
        })
      )
    })
}
// 随机颜色
randomColor=()=>{         
  const r=parseInt(Math.random()*255)
  const g=parseInt(Math.random()*255)
  const b=parseInt(Math.random()*255)
  const color= `rgba(${r},${g},${b},1)`
  return color
}
// Tooltip提示文本
text =(item)=>{ 
             return  (<span >
                          <span>计划开始：<span style={{color:'rgba(0,0,0,0.35)'}}>{item.data1+' '}</span></span><br/><span>计划结束：<span style={{color:'rgba(0,0,0,0.35)'}}>{item.data2+' '}</span></span><br/><hr/>
                          <span>实际开始：<span style={{color:'rgba(0,0,0,0.35)'}}>{item.data3+' '}</span></span><br/><span>实际结束：<span style={{color:'rgba(0,0,0,0.35)'}}>{item.data4+' '}</span></span><br/><hr/>
                          <span>负责人：<span style={{color:'rgba(0,0,0,0.35)'}}>{item.person}</span></span>
                      </span>)
                   }
// 状态背景色
bgColor=(item)=>{
  if(item.data3 && (!item.data4)){
      const color= 'blue'
      return color
  }else if(item.data4){
      const color= 'greenyellow'
      return color
  }else if(!item.data3){
      const color= 'gold'
      return color
  }
}
// 是否延期
isDelay=(item)=>{
  let time = item.data2
  time = time.replace(/-/g, '/');
  let oldTime = new Date(time);
  oldTime = oldTime.getTime();
  let nowTime=new Date().getTime()
  if(oldTime>=nowTime){
    return '否'
  }else{
    return '是'
  }
}
  render() { 
    const {data }= this.state
    return (
        <div className={style.main}>
            <div className={style.header}>
              <div className={style.headerBox1}>
                  <div className={style.spanBox4+' '+style.headerBox}><i></i><i>有问题</i></div>
                  <div className={style.spanBox3+' '+style.headerBox}><i></i><i>未开始</i></div>
                  <div className={style.spanBox2+' '+style.headerBox}><i></i><i>进行中</i></div>
                  <div className={style.spanBox1+' '+style.headerBox}><i></i><i>已完成</i></div>
              </div>
              <div className={style.headerBox2}>
                <div>关键节点名称</div>
                <div>完成百分比</div>
                <div>延期</div>
              </div>
            </div>
            <div style={{width:'98%',height:'85%',margin:'0 auto'}}>
              <Spin spinning={this.state.loading}>
            <div className={style.content} style={{overflow:'auto'}}>
              {
                data&&data.map((item,index)=>{
                  return(
                  <div className={style.contentBox1}>
                  <div className={style.contentLeft1}><div style={{backgroundColor:'skyblue'}}><div style={{backgroundColor:'white'}}><div style={{backgroundColor:'skyblue'}}>{item.construction}</div></div></div></div>
                  <div className={style.contentRight1}>
                      <List
                          size="large"
                          dataSource={item.data}
                          renderItem={(item,index) =><List.Item key={index} className={style.listItem}><Tooltip placement="top" title={this.text.bind(this,item)} overlayClassName={style.toolTipBox}> 
                                                  <div className={style.contentItem}>
                                                    <div className={style.contentItem1}>{item.name}</div>
                                                    <div className={style.contentItem2_1}><div className={style.contentItem2}><div className={style.contentItem4} style={{width:`${item.width}%`,background:this.bgColor(item)}}>&nbsp;{item.num}%</div></div></div>
                                                    <div className={style.contentItem3}>{this.isDelay(item)}</div>
                                                  </div>
                                                </Tooltip></List.Item>}
                        />
                  </div>               
                </div>)})
              }
            </div></Spin>
        </div>
      </div>
    )
  }
}



export default ProgressPlanning;