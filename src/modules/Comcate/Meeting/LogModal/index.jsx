import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Table, Select, DatePicker, Modal } from 'antd';
import moment from 'moment'
import { getfeedbacklist } from '../../../../api/api'
import { connect } from 'react-redux'
import axios from '../../../../api/axios'


const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

export class Add extends Component {
    constructor(props) {
        super(props)
        this.state = {
           data:[]
        }
    }

    componentDidCatch() {
        axios.get(getfeedbacklist(this.props.logid)).then(res=>{
            this.setState({
                data:res.data.data
            })
        })
    }
    
    render() {
        const { intl } = this.props.currentLocale
        const columns=[

            {
                title: intl.get('wsd.i18n.plan.progressLog.endtime'),  //截止日期
                dataIndex: 'deadline',
                key: 'deadline',
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.progresstime'),  //"进展报告日期",
                dataIndex: 'reportingTime',
                key: 'reportingTime',
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.progress'),  //"进度",
                dataIndex: 'completePct ',
                key: 'completePct ',
                render: progress => (
                    <span style={{ display: 'inline-block', width: '100px' }}>
                        {progress.map(tag => <Progress key={tag} percent={progress} />)}
                    </span>
                ),
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.actstarttime'),  //"实际开始日期",
                dataIndex: 'actStartTime',
                key: 'actStartTime',
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.actendtime'),  //"实际完成日期",
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.plan.progressLog.plancomplete'),  //"估计完成",
                dataIndex: 'estimatedTime',
                key: 'estimatedTime',
                render: text => text ? text.substr(0, 10) : null
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
                    if (text == '已批准') {
                        return (<span><Icon type="bulb" theme="filled" className={style.approve} /> {text}</span>)
                    } else if (text == '审批中') {
                        return (<span><Icon type="bulb" theme="filled" className={style.examineApprove} /> {text}</span>)
                    }

                }
            }
        ]
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
        } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        const formLayout = {
            labelCol: {
                sm: { span: 4 }
            },
            wrapperCol: {
                sm: { span: 20 }
            }
        }

        return (
            <div className={style.main}>
                <Modal
                    title={intl.get("wsd.i18n.comu.meeting.looklog")}
                    visible={true}
                    onCancel={this.props.handleCancel}
                    footer={null}
                    width="850px"
                    mask={false}
                    maskClosable={false}
                    centered={true}
                    className={style.addFormInfo}
                >
                    <div className={style.addcontentBox}>
                    <div className={style.rightTopTogs}>
                 
                    </div>
                    <div className={style.mainScorll} >
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
                    </div>
                    {/* <AddInfo /> */}
                </Modal>
            </div>
        )
    }
}

const Adds = Form.create()(Add)

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(Adds);