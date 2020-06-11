import React, { Component } from 'react'
import { Table, Progress, Badge, notification, Modal } from 'antd'

import style from './style.less'
import { connect } from 'react-redux'
import axios from "../../../../../api/axios"
import { getfeedbacklist } from "../../../../../api/api"

import * as dataUtil from "../../../../../utils/dataUtil"
export class PlanComponentsLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'PlanComponentsLog',
            initDone: false,
            columns: [],
            data: []
        }
    }

    componentDidMount() {
        axios.get(getfeedbacklist(this.props.data.id)).then(res => {
            this.setState({
                data: res.data.data
            })
        })
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? `${style['clickRowStyl']}` : "";
    }

    getInfo = (record, index) => {
        let id = record.id, records = record
        if (this.state.activeIndex == id) {
            this.setState({
                activeIndex: null,
                rightData: null
            })
        } else {
            this.setState({
                activeIndex: id,
                rightData: record
            })

        }
    }

    render() {

        const { intl } = this.props.currentLocale
        const columns = [

            {
                title: intl.get('wsd.i18n.plan.progressLog.endtime'),  //填报日期
                dataIndex: 'deadline',
                key: 'deadline',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.progresstime'),  //"进展报告日期",
                dataIndex: 'reportingTime',
                key: 'reportingTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: "申请完成%",  //"进度",
                dataIndex: 'completePct',
                key: 'completePct',
                width: 140,
                render: text => (
                    <Progress percent={text} className={style.myProgress} strokeWidth={18} />
                ),
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.actstarttime'),  //"实际开始日期",
                dataIndex: 'actStartTime',
                key: 'actStartTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.actendtime'),  //"实际完成日期",
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.plancomplete'),  //"估计完成",
                dataIndex: 'estimatedTime',
                key: 'estimatedTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.progressdesc'),  //"进展说明",
                dataIndex: 'remark',
                key: 'remark',
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.status'),  //"状态",
                dataIndex: 'status',
                key: 'status',
                render: (text) => {
                    if (!text) {
                        return
                    }
                    if (text.id == "EDIT") {
                        //编制中
                        return <Badge status="warning" text={text.name} />
                    }
                    if (text.id == "APPROVED") {
                        //已审批
                        return <Badge status="success" text={text.name} />
                    }
                    if (text.id == "APPROVAL") {
                        //审批中
                        return <Badge status="processing" text={text.name} />
                    }
                }
            }
        ]
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="进展日志" visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }} footer={null}>
                <div className={style.tableMain}>
                    <Table rowKey={record => record.id} columns={columns} dataSource={this.state.data} pagination={false} size="small"
                        rowClassName={this.setClassName} onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index)
                                }
                            }
                        }
                        }
                    />
                </div>
            </Modal>
        )
    }
}


const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(PlanComponentsLog);