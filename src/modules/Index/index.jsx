import React, { Component } from 'react'
import { Table, Icon, Input, Row, Col, DatePicker, Button, Select } from 'antd'
import style from './style.less'
import MessageTem from './MessageTem/index.jsx'
import MyWarnTem from './MyWarnTem/index.jsx'
import MyQuestionTem from './MyQuestionTem/index.jsx'
import TaskTem from './TaskTem/index.jsx'
import MyToDoTem from './MyToDoTem/index.jsx'
import MyActionTem from "./MyActionTem/index.jsx"
import MyIcon from "../../components/public/TopTags/MyIcon"
import LeaderPage from "./LeaderPage/index.jsx"
import LeaderPagePlan from "./LeaderPagePlan/index.jsx"
import LeaderPagePeople from "./LeaderPagePeople/index.jsx"
const Search = Input.Search
const { RangePicker } = DatePicker
const Option = Select.Option;
function onChange(value, dateString) {
}
function onOk(value) {
}
export class Index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: [
                { tabName: "我的任务", id: 1, iconType: "icon-daiban" },
                { tabName: "我的待办", id: 2, iconType: "icon-xiaoxi" },
                { tabName: "我的消息", id: 3, iconType: "icon-39" },
                { tabName: "我的预警", id: 4, iconType: "icon-weibiaoti--" },
                { tabName: "我的问题", id: 5, iconType: "icon-wenti" },
               // { tabName: "我的行动项", id: 6, iconType: "icon-hangdongxiang" }
            ],
            currentIndex: 2,
            mainHeight: '', //盒子高度
            mainLeftWidth: '',  //left盒子宽度
        };
    }

    tabChoiced = (id) => {
        //tab切换到方法
        this.setState({
            currentIndex: id,
        });
    };

    componentDidMount() {
        //初始化css样式
        var h = document.documentElement.clientHeight || document.body.clientHeight - 55;   //浏览器高度，用于设置组件高度
        var w = document.documentElement.offsetWidth || document.body.offsetWidth;
        this.setState({
            mainHeight: h - 160,
            mainLeftWidth: w - 55
        })
    }


    render() {
        var _this = this;
        var isTable1Show = this.state.currentIndex == 1 ? 'block' : 'none';
        var isTable2Show = this.state.currentIndex == 2 ? 'block' : 'none';
        var isTable3Show = this.state.currentIndex == 3 ? 'block' : 'none';
        var isTable4Show = this.state.currentIndex == 4 ? 'block' : 'none';
        var isTable5Show = this.state.currentIndex == 5 ? 'block' : 'none';
        var isTable6Show = this.state.currentIndex == 6 ? 'block' : 'none';
        var tabList = this.state.tabs.map(function (res, index) {
            var tabStyle = res.id == this.state.currentIndex ? 'homeActivity' : null;
            return <li key={index} onClick={this.tabChoiced.bind(_this, res.id)} className={tabStyle}><MyIcon type={res.iconType}
                style={{ fontSize: 40, color: '#fff' }} />
                <span className={index.title}>{res.tabName}</span>
            </li>
        }.bind(_this));

        return (
            <div className={style.main} style={{ height: this.state.mainHeight +10}}>
                <ul className={style.itemlist}>
                    {tabList}
                </ul>
                {
                    this.state.mainHeight && (
                        <div className={style.rightMain} style={{ height: this.state.mainHeight -20}}>
                        {/*我的任务*/}
                        {this.state.currentIndex == 1 &&
                                    <TaskTem openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight} />
                          
                        }
                        {/*我的代办*/}
                        {this.state.currentIndex == 2 &&                             
                                    <MyToDoTem openWorkFlowMenu = {this.props.openWorkFlowMenu } callBackBanner={this.props.callBackBanner} height={this.state.mainHeight}/>  
                        }
                        {/*我的消息*/}
                        {this.state.currentIndex == 3 &&   <MessageTem openMenuByMenuCode={this.props.openMenuByMenuCode}
                        callBackBanner={this.props.callBackBanner} height={this.state.mainHeight}/>  }
                        {/*我的预警*/}
                        {this.state.currentIndex == 4 &&
                           
                                    <MyWarnTem openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight}/>
                              
                        }
                        {/*我的问题*/}
                        {this.state.currentIndex == 5 &&
    
                            <MyQuestionTem openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight}/>
    
                        }
                        {/*我的行动*/}
                        {this.state.currentIndex == 6 &&
                          <MyActionTem openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight}/>              
                        }
                        {/*领导首页*/}
                        {this.state.currentIndex == 7 &&       
                            (<div>
                                <LeaderPage openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight}/>
                                <LeaderPagePeople openMenuByMenuCode={this.props.openMenuByMenuCode} height={this.state.mainHeight}/> 
                            </div>)                                                    
                        }
                          </div>
                          
                    )

                }
               
              

            </div>

        )
    }
}

export default Index
