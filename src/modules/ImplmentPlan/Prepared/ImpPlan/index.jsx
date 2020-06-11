import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Form,Button,notification } from 'antd';
import Search from '../../../../components/public/Search'
import intl from 'react-intl-universal'
import '../../../../asserts/antd-custom.less'
import axios from "../../../../api/axios"
import {
    impPlan_
} from "../../../../api/suzhou-api"
import MyIcon from '../../../../components/public/TopTags/MyIcon'
import * as dataUtil from "../../../../utils/dataUtil";
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
export class ImpPlan extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            initData: [],
            currentData: []
        }
    }

    handleSubmit = () => {
        this.putImpPlanTask()
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
        this.getImpPlanTaskTree()
    }

    //获取引入计划树
    getImpPlanTaskTree = () => {
        let year = this.props.menuCode == "ST-IMPLMENT-M-TASK" ? this.props.year : "";
        let planType = this.props.menuCode == "ST-IMPLMENT-Y-TASK" ? "ST-IMPLMENT-TASK" : this.props.menuCode == "ST-IMPLMENT-M-TASK" ? "ST-IMPLMENT-Y-TASK": "";
        //let loginUser = JSON.parse(sessionStorage.getItem('userInfo'));
        // 获取查询条件
        let searchParams = {
            custom01:year,
            planType:planType,
            //userId:loginUser.id,
            status:["RELEASE"],
            fuzzySearch : false,
            children : false
        }
        this.props.getPlanTaskTree(searchParams,this);
    }

    // 确认计划
    putImpPlanTask = () => {
        const { activeIndex } = this.state
        if(!activeIndex || activeIndex.length == 0 ){
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '未勾选数据',
                description: '请勾选数据再操作'
            });
            return;
        }
        axios.put(impPlan_(this.props.menuCode),{year:this.props.year,month:this.props.month,ids:[...activeIndex]}, true).then(res => {
             this.props.getPreparedTreeList();
             this.props.handleCancel();
        })
    }

    search = (value) => {
      const {initData } = this.state;
      let newData = dataUtil.search(initData,[{"key":"name|code","value":value}],true);
      this.setState({data:newData});
    }

    render() {

        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    let icon = dataUtil.getIcon(record.nodeType,record.taskType);
                    let year = record.custom01;
                    let text1 = year ? "("+year+"年) "+text : text;
                    return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text1}</span>
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.code'),
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planendtime'),
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.iptname'),
                dataIndex: 'org',
                key: 'org',
                render: data => data ? data.name : ''
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.username'),
                dataIndex: 'user',
                key: 'user',
                render: data => data ? data.name : ''
            }
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    activeIndex: selectedRowKeys,
                    selectData: selectedRows
                })
            },
            getCheckboxProps: (record) => {
                //let item = dataUtil.Table(this.state.data).getItemById(record.id);
                //return ({
                //    disabled: item && item.children ? true : false
                //})
                return ({
                    disabled: record && record.nodeType == "task" ? false : true
                })
            }
        };
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="引入计划" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="back" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="3" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                      <Search search={this.search.bind(this)} />
                    </div>
                    {<Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        name={this.props.name}
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={() => {
                            return {
                                onClick: (event) => {

                                }
                            }
                        }
                        }
                    />}
                </div>
            </Modal>

        )
    }
}

const ImpPlans = Form.create()(ImpPlan)

export default ImpPlans
