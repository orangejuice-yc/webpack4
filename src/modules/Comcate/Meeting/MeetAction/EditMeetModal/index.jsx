import React, { Component } from 'react'
import style from './style.less'

import { connect } from 'react-redux'
import { Form, Modal, Row, Col, Input, TreeSelect, Slider, Select, DatePicker, Button } from 'antd';
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
import moment from 'moment'
import { meetingActionAdd, meetingActionUpdate, getUserByOrgId, orgTree, meetingActionInfo ,docOrgSel} from '../../../../../api/api'
import axios from '../../../../../api/axios'
import * as dataUtil from "../../../../../utils/dataUtil"
const Option = Select.Option
class Add extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: false,
            orgList: [],
            info: {}
        }
    }
    handleSubmit = (type) => {
       
        this.props.form.validateFieldsAndScroll((err, values) => {

            values.meetTime = this.state.inputMeetTime;
            let data = {
                ...values,
                planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
                planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
                userId: parseInt(values.userId),
                orgId: parseInt(values.orgId),
                meetingId: this.props.data.id
            }

            if (!err) {
                //添加会议
                let { startContent } = this.props.extInfo || {};
                let url = dataUtil.spliceUrlParams(meetingActionAdd, { startContent });
                axios.post(url, data, true, null, true).then(res => {
                    if (type == "goOn") {
                        this.props.form.resetFields();
                        this.props.addData(res.data.data)
                    } else {
                        this.props.form.resetFields();
                        this.props.handleCancel()
                        this.props.addData(res.data.data)
                    }
                })
            }
        });
    }
    handleOK = () => {
        this.props.form.validateFieldsAndScroll((err, values) => {

            values.meetTime = this.state.inputMeetTime;
            let data = {
                ...values,
                planStartTime: dataUtil.Dates().formatTimeString(values.planStartTime),
                planEndTime: dataUtil.Dates().formatTimeString(values.planEndTime),
                userId: parseInt(values.userId),
                orgId: parseInt(values.orgId),
                id: this.props.selectData.id
            }

            if (!err) {
                //添加会议
                let { startContent } = this.props.extInfo || {};
                let url = dataUtil.spliceUrlParams(meetingActionUpdate, { startContent });
                axios.put(url, data, true, null, true).then(res => {

                    this.props.form.resetFields();
                    this.props.handleCancel()
                    this.props.updateData(res.data.data)

                })
            }
        });
    }
    componentDidMount() {
        if (this.props.type == "modify") {
            axios.get(meetingActionInfo(this.props.selectData.id)).then(res => {
                this.setState({
                    info: res.data.data
                }, () => {
                    const { info } = this.state
                    this.setState({
                        userlist1: info.user ? [info.user] : null,
                        orgList1: info.org ? [{ value: info.org.id, title: info.org.name }] : null
                    })
                })
            })
        }
    }
    //获取责任主体
    getOrgList = () => {
        if (this.state.orgList.length == 0) {
            axios.get(docOrgSel(this.props.projectId)).then(res => {
                if (res.data.data) {
                    this.setState({
                        orgList: res.data.data,
                        orgList1: null
                    })
                }


            })
        }
    }
    //
    selectUser = (id) => {
        this.props.form.setFieldsValue({ userId: null })
        this.getUser(id)
    }
    //责任人
    getUser = (id) => {
        axios.get(getUserByOrgId(id)).then(res => {
            this.setState({
                userlist: res.data.data,
                userlist1: null
            })
        })
    }
    //下拉触发
    getUserData = () => {
        let orgid = this.props.form.getFieldValue("orgId")
        if (!this.state.userlist && orgid) {
            axios.get(getUserByOrgId(orgid)).then(res => {
                this.setState({
                    userlist: res.data.data,
                    userlist1: null
                })
            })
        }
    }
    render() {
        const { intl } = this.props.currentLocale
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
                    title={this.props.title}
                    visible={true}
                    onCancel={this.props.handleCancel}
                    footer={null}
                    width="850px"
                    centered={true}
                    mask={false}
                    maskClosable={false}
                    className={style.addFormInfo}
                    footer={
                        <div className="modalbtn">
                            {/* 保存并继续 */}
                            {this.props.type == "add" &&
                                <span>  <SubmitButton key={1} onClick={this.handleSubmit.bind(this, 'goOn')} content={intl.get('wsd.global.btn.saveandcontinue')} />
                                    {/* 保存 */}
                                    <SubmitButton key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary" content={intl.get('wsd.global.btn.preservation')} /></span>
                            }
                            {this.props.type == "modify" &&
                                <span>  <SubmitButton key={1} onClick={this.props.handleCancel} content={intl.get('wsd.global.btn.cancel')} />
                                    {/* 保存 */}
                                    <SubmitButton key={2} onClick={this.handleOK} type="primary" content={intl.get('wsd.global.btn.preservation')} /></span>
                            }
                        </div>
                    }
                >
                    <div className={style.main}>
                        <Form onSubmit={this.props.getEdirMeetTem}>
                            <div className={style.content}>
                                <Row >
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meetingaction.actionname')} {...formItemLayout}>
                                            {getFieldDecorator('actionName', {
                                                initialValue: this.state.info.actionName,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meetingaction.actionname'),
                                                }],
                                            })(
                                                <Input maxLength={66}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meetingaction.planstarttime')} {...formItemLayout}>
                                            {getFieldDecorator('planStartTime', {
                                                initialValue: dataUtil.Dates().formatDateMonent(this.state.info.planStartTime),
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meetingaction.planstarttime'),
                                                }],
                                            })(
                                                <DatePicker style={{ width: '100%' }} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meetingaction.planendtime')} {...formItemLayout}>
                                            {getFieldDecorator('planEndTime', {
                                                initialValue: dataUtil.Dates().formatDateMonent(this.state.info.planEndTime),
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meetingaction.planendtime'),
                                                }],
                                            })(
                                                <DatePicker style={{ width: '100%' }} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meetingaction.iptname')} {...formItemLayout}>
                                            {getFieldDecorator('orgId', {
                                                initialValue: this.state.info.org ? this.state.info.org.id : null,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meetingaction.iptname'),
                                                }],
                                            })(
                                                <TreeSelect

                                                    style={{ width: "100%" }}
                                                    onFocus={this.getOrgList}
                                                    treeData={this.state.orgList1 ? this.state.orgList1 : this.state.orgList}
                                                    // allowClear
                                                    treeDefaultExpandAll
                                                    onChange={this.selectUser}
                                                />

                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>

                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meetingaction.username')} {...formItemLayout}>
                                            {getFieldDecorator('userId', {
                                                initialValue: this.state.info.user ? this.state.info.user.id : null,
                                                rules: [],
                                            })(

                                                <Select onDropdownVisibleChange={this.getUserData}>
                                                    {this.state.userlist1 ? this.state.userlist1.map(item => {
                                                        return <Option value={item.id} key={item.id}>{item.name}</Option>
                                                    }) : this.state.userlist && this.state.userlist.map(item => {
                                                        return <Option value={item.value} key={item.value}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>

                            </div>
                        </Form>

                    </div>
                </Modal>
            </div>
        )
    }
}

const EditMeets = Form.create()(Add);
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(EditMeets);
