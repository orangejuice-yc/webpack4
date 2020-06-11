import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button, notification } from 'antd';
import intl from 'react-intl-universal'
import SelectPlanTopBtn from "../../../Prepared/SelectPlanByIdTopBtn"
import MyIcon from '../../../../../components/public/TopTags/MyIcon'
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import axios from "../../../../../api/axios"
import {
    getPlanTaskPredAssginTree,
    addPlanTaskPred
} from "../../../../../api/api"
import * as util from '../../../../../utils/util';
import { func } from 'prop-types';
import * as dataUtil from '../../../../../utils/dataUtil';
export class PlanPreparedPlanAccoDistribution extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            selectArray: [],
            selectData: [],
            activeIndex: []
        }
    }

    // 执行逻辑关系分配
    handleSubmit = (type) => {
        this.addPlanTaskPred(type)
    }

    componentDidMount() {
        const { selectData, rightData } = this.props
        this.getPlanTaskPredAssginTree(rightData[0]['defineId'])
    }

    // 获取计划管理分配列表
    getPlanTaskPredAssginTree = (defineId) => {
        axios.get(getPlanTaskPredAssginTree(defineId)).then(res => {
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
            this.getPlanTaskPredAssginTree(selectArray[0])
        })
    }

    getInfo = (record, index) => {
       
        if(record.nodeType != 'task') return
       
            this.setState({
                activeIndex: record.id,
                selectData: record
            })
        
    };

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    // 增加紧前任务
    addPlanTaskPred = (type) => {

        const { rightData } = this.props
        const { selectData } = this.state
        if (selectData) {
            if (selectData['nodeType'] != 'task') {
                dataUtil.message("请选中任务操作");
                return
            }
            if (type == 'pred') {
                let {startContent} = this.props.extInfo  || {};
                let url = dataUtil.spliceUrlParams(addPlanTaskPred(rightData[0]['id'], selectData['id']),{startContent});
                axios.post(url, null, true,null,true).then(res => {
                    this.props.addItem(selectData['id'],rightData[0]['id'])
                    this.props.refreshDataList();
                })
            } else {
                let {startContent} = this.props.extInfo  || {};
                let url = dataUtil.spliceUrlParams(addPlanTaskPred(selectData['id'], rightData[0]['id']),{startContent});
                axios.post(url, null, true,null,true).then(res => {
                    this.props.addItem(rightData[0]['id'], selectData['id']);
                    this.props.refreshDataList();
                })
            }

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

    render() {
        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => dataUtil.getIconCell(record.nodeType,text,record.taskType)
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
                mask={false} maskClosable={false}
                title="分配计划" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit.bind(this, 'pred')} content="分配紧前任务" />
                        <SubmitButton key="1" type="primary" onClick={this.handleSubmit.bind(this, 'follow')}  content="分配后续任务" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <SelectPlanTopBtn openPlan={this.openPlan} projectId={this.props.rightData[0]['projectId']} />
                    </div>
                    <Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        size="small"
                        name={this.props.name}
                        columns={columns}
                        // rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={record => {
                            return {
                                onClick: this.getInfo.bind(this, record),
                            };
                        }} />
                </div>
            </Modal>
        )
    }
}


export default PlanPreparedPlanAccoDistribution
