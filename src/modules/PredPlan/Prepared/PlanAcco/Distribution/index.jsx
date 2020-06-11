import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Button } from 'antd';
import intl from 'react-intl-universal'
import SelectPlanTopBtn from "../../SelectPlanTopBtn"
import MyIcon from '../../../../../components/public/TopTags/MyIcon'
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import axios from "../../../../../api/axios"
import {
    getPlanTaskAssginTree,
    doPlanTaskAssgin
} from "../../../../../api/api"
import * as util from '../../../../../utils/util';
import { func } from 'prop-types';
import * as dataUtil from "../../../../../utils/dataUtil"
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

    // 执行计划关联
    handleSubmit = () => {
        const { rightData } = this.props
        const { selectData } = this.state
        const postBody = []
        selectData.map(v => {
            if (v.nodeType == 'wbs' || v.nodeType == 'task') {
                postBody.push(v.id)
            }
        })
        let {startContent} = this.props.extInfo  || {};
        let url = dataUtil.spliceUrlParams(doPlanTaskAssgin(rightData[0]['id']),{startContent});
        axios.post(url, postBody, true,null,true).then(res => {
            this.props.handleCancel()
            this.props.getPlanTaskRelationTree()
        })
    }

    componentDidMount() {
        const { selectData, rightData } = this.props
        this.getPlanTaskAssginTree(rightData[0]['defineId'])
    }

    // 获取计划管理分配列表
    getPlanTaskAssginTree = (defineId) => {
        axios.get(getPlanTaskAssginTree(defineId)).then(res => {
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
            this.getPlanTaskAssginTree(selectArray[0])
        })
    }

    render() {
        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => dataUtil.getIconCell(record.nodeType, text,record.taskType)
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
                    selectData: selectedRows
                })
            },
            getCheckboxProps: record => ({
              disabled: record.nodeType=="project" ||  record.nodeType=="define", // Column configuration not to be checked
             
            }),
        };
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="分配计划" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <SelectPlanTopBtn openPlan={this.openPlan} />
                    </div>
                    <Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        size="small"
                        name={this.props.name}
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click()
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
