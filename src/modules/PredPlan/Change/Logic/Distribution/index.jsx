import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button, notification } from 'antd';
import intl from 'react-intl-universal'
import SelectPlanTopBtn from "../../../Prepared/SelectPlanByIdTopBtn"
import MyIcon from '../../../../../components/public/TopTags/MyIcon'
import * as dataUtil from "../../../../../utils/dataUtil";
import axios from "../../../../../api/axios"
import {
    getPlanChgtaskAssignTree,
    addPlanChgtaskpred
} from "../../../../../api/api"
import * as util from '../../../../../utils/util';
import { func } from 'prop-types';
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
export class PlanPreparedPlanAccoDistribution extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            selectArray: [],
            selectData: null,
            activeIndex: []
        }
    }

    // 执行逻辑关系分配
    handleSubmit = (type) => {
        this.addPlanTaskPred(type)
    }

    componentDidMount() {
        const { rightData } = this.props
        this.getPlanTaskPredAssginTree(rightData[0]['defineId'], rightData[0]['id'], rightData[0]['changeId'] ? 'change' : 'task')
    }

    // 获取计划管理分配列表
    getPlanTaskPredAssginTree = (defineId, taskId, type) => {
        axios.get(getPlanChgtaskAssignTree(defineId, taskId, type)).then(res => {
            const { data } = res.data
            this.setState({
                data
            })
        })
    }

    // 获取选择计划列表
    openPlan = (selectArray) => {
        this.setState({
            selectArray: selectArray
        }, () => {
            const { rightData } = this.props
            this.getPlanTaskPredAssginTree(selectArray[0], rightData[0]['id'],rightData[0]['changeId'] ? 'change' : 'task')
        })
    }

    // 增加紧前/后续任务
    addPlanTaskPred = (type) => {
        const { rightData } = this.props
        const { selectData } = this.state
        if (selectData) {
            if (selectData['type'] == 'wbs') {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 2,
                        message: '选中数据类型有误',
                        description: '请选择任务!'
                    }
                )
                return
            }
            const data = {
                "taskId": type == 'pred' ? rightData[0]['id'] : selectData['id'],
                "predTaskId": type == 'pred' ? selectData['id'] : rightData[0]['id'],
                "type": type == 'pred' ? rightData[0]['changeId'] && rightData[0]['changeType'].id == 'ADD' ? 'change' : 'task': selectData['changeId'] ? 'change' : 'task',
                "predType": type == 'pred' ? selectData['changeId'] ? 'change' : 'task' : rightData[0]['changeId'] && rightData[0]['changeType'].id == 'ADD' ? 'change' : 'task',
            }
            let { startContent } = this.props.extInfo || {};
            let url = dataUtil.spliceUrlParams(addPlanChgtaskpred, { startContent });
            axios.post(url, data, true,null,true).then(res => {
                this.props.handleCancel()
                this.props.getPlanTaskPredList()
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选中数据',
                    description: '请选择数据进行操作'
                }
            )
            return
        }
    }
    getInfo = (record, index) => {

        let id = record.id
        this.setState({
            activeIndex: id,
            selectData: record
        })
    }
    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }
    render() {
        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    if (record.type == 'project') {
                        return <span><MyIcon type="icon-xiangmuqun" style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
                    }
                    if (record.type == 'define') {
                        return <span><MyIcon type="icon-jihua1" style={{ fontSize: '16px', marginRight: '8px' }} /> {text}</span>
                    }
                    if (record.type == 'wbs') {
                        return <span><MyIcon type="icon-WBS" style={{ fontSize: '16px', marginRight: '8px' }} /> {text}</span>
                    }
                    if (record.type == 'task') {
                        if(record.taskType == 1 || record.taskType == 4){
                            return <span><MyIcon type="icon-renwu1" style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
                        }
                        if(record.taskType == 2 || record.taskType == 3){
                            return <span><MyIcon type="icon-lichengbei" style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
                        }
                    }
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
                render: data => data && data.name
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.username'),
                dataIndex: 'user',
                key: 'user',
                render: data => data && data.name
            }
        ]
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="分配计划" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="1" type="primary" onClick={this.handleSubmit.bind(this, 'follow')} content="分配后续任务" />
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit.bind(this, 'pred')}  content="分配紧前任务" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <SelectPlanTopBtn openPlan={this.openPlan}  projectId={this.props.rightData[0]['projectId']} />
                    </div>
                    <Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        size="small"
                        name={this.props.name}
                        columns={columns}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index)
                                    //event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click()
                                }
                            }
                        }
                        } />
                </div>
            </Modal>
        )
    }
}


export default PlanPreparedPlanAccoDistribution
