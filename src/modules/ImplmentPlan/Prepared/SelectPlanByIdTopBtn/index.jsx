/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:35:16 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-04-28 17:30:21
 */

import React from 'react'
import { Icon, Popover, Button, Table,notification } from 'antd';

import style from './style.less'
import Search from "../../../../components/public/Search"
import { throws } from 'assert';
import axios from "../../../../api/axios"
import {getPlanDefineListByProjectId_} from "../../../../api/suzhou-api"
import MyIcon from "../../../../components/public/TopTags/MyIcon"
class SelectProjectBtn extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
           
            visible: false,
            activeIndex: [],
            rightData:[],
            data: []
        }
    }

    handleKeyPress = (e) => {}
    
    handleKeyup = (e) => {}

    handleClose = () => {
        this.setState({
            visible: false,
        });
    }

    handleOpen = () => {
        const { activeIndex } = this.state
        if(activeIndex.length > 0) {
            this.setState({
                visible: false,
                activeIndex:[]
            });
            this.props.openPlan(activeIndex)
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有选择数据！'
                }
            )
            return
        }
        return
        this.setState({
            visible: false,
        });
    }

    handleVisibleChange = (visible) => {
        this.setState({ visible });
        if(visible){
            axios.get(getPlanDefineListByProjectId_(this.props.projectId,"3,4")).then(res=>{
                this.setState({
                    data:res.data.data
                })
            })
        }
    }

    //双击打开
    handleDouble=(record)=>{
        let i = this.state.activeIndex.findIndex((value) => value === record.id)
        if(record.type=="eps"){
            return
        }
        //选择项目
        if(record.type=="project"){
            return
        }
        this.setState({
            activeIndex: [record.id],
            projectId : record.parentId
        },()=>{
            this.handleOpen()
        })
    }

    getInfo = (record, event) => {
        let i = this.state.activeIndex.findIndex((value) => value === record.id)
        if(record.type=="eps"){
            return
        }
        //选择项目
        if(record.type=="project"){
            return
        }
        if (event.ctrlKey || event.shiftKey) {
            if (i != -1) {
                this.setState((preState, props) => {
                    preState.activeIndex.splice(i, 1)
                 
                    return {
                        activeIndex: preState.activeIndex,
                     
                    }
                })
            } else {
                this.setState((prevState, props) => ({
                    activeIndex: [...prevState.activeIndex, record.id]
    
                }));
            }

        } else {
            if (i != -1) {
                this.setState({
                    activeIndex: []
                })
            } else {
                this.setState({
                    activeIndex: [record.id]
                })
            }

        }

    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        if (this.state.activeIndex.findIndex(value => record.id === value) > -1) {
            return 'tableActivty'
        } else {
            return "";
        }

    }
    render() {
        const { data } = this.state
        const columns = [
            {
                title: "名称",
                dataIndex: 'planName',
                key: 'planName',
                render: text => <span><MyIcon type="icon-jihua1" style={{ fontSize: '18px' }} /> {text}</span>
            }
        ]
        const content = (
            <div className={style.main}>
                <Search></Search>
                <div className={style.project} >
                    <Table columns={columns} dataSource={data} pagination={false}
                        rowClassName={this.setClassName}
                        rowKey={record => record.id}
                        scroll={{ y: 240 }}
                        size="small"
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, event)

                                },
                                onDoubleClick:(event)=>{
                                    this.handleDouble(record)
                                }

                            }
                        }
                        } />
                </div>
                <div className={style.footer}>            
                    <div className={style.btn}>            
                        <Button type="primary" onClick={this.handleOpen.bind(this)}>打开计划</Button>
                    </div>
                </div>
            </div>
        );
        return (
            <div className={style.main}>
                <Popover
                    placement="bottomLeft"
                    content={content} trigger="click"
                    visible={this.state.visible}
                    onVisibleChange={this.handleVisibleChange}
                >
                    <div className={style.titleass}>
                        <Icon type="table" style={{ paddingRight: "5px" }} />
                        <span>选择计划</span>
                        <Icon type="caret-down" />
                    </div>
                </Popover>
            </div>
        )
    }
}

export default SelectProjectBtn