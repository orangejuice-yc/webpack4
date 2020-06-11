import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, TreeSelect } from 'antd';
import moment from 'moment';
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
import { meetingUpdate, meetingInfo, getdictTree, docOrgSel } from '../../../../api/api'
import axios from '../../../../api/axios'
import { connect } from 'react-redux'
import * as dataUtil from "../../../../utils/dataUtil"
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option
//会议问题->基本信息
class ComcateMeetingInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            info: {},
            orgList: [],
            orgList1: []
        }
    }
    componentDidMount() {
        axios.get(meetingInfo(this.props.data.id)).then(res => {
            if (res.data.data) {
                this.setState({
                    info: res.data.data
                }, () => {
                    const { info } = this.state
                    this.setState({
                        typeList1: info.meetingType ? [info.meetingType] : null,
                        orgList1: info.org ? [{ value: info.org.id, title: info.org.name }] : null
                    })
                })
            }

        })
    }
    //获取会议类型
    getTypeList = () => {
        if (!this.state.typeList) {
            axios.get(getdictTree("comu.meeting.type")).then(res => {
                if (res.data.data) {
                    this.setState({
                        typeList: res.data.data
                    }, () => {
                        this.setState({
                            typeList1: null
                        })
                    })
                }


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
    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
            if (!err) {

                let data = {
                    ...fieldsValue,
                    meetingTime: dataUtil.Dates().formatTimeString(fieldsValue.meetingTime),
                    creatTime: dataUtil.Dates().formatTimeString(fieldsValue.creatTime),
                    orgId: parseInt(fieldsValue.orgId),
                    id: this.props.data.id
                }
                //更新会议基本信息
                let url = dataUtil.spliceUrlParams(meetingUpdate, { "startContent": "项目【" + this.props.projectName + "】" });
                axios.put(url, data, true, null, true).then(res => {
                    this.props.updateSuccess(res.data.data);
                })
            }
        });
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
        const formItemLayout1 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 20 },
            },
        };

        return (
            <LabelFormLayout title={this.props.title} >
                <Form onSubmit={this.handleSubmit}>

                    <Row type="flex">
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.title')} {...formItemLayout}>
                                {getFieldDecorator('title', {
                                    initialValue: this.state.info.title,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.title'),
                                    }],
                                })(
                                    <Input maxLength={66} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingtype')} {...formItemLayout}>
                                {getFieldDecorator('meetingType', {
                                    initialValue: this.state.info.meetingType ? this.state.info.meetingType.id : null,
                                    rules: [],
                                })(
                                    <Select onDropdownVisibleChange={this.getTypeList}>
                                        {this.state.typeList1 ? this.state.typeList1.map(item => {
                                            return <Option value={item.id} key={item.id}>{item.name}</Option>
                                        }) : this.state.typeList && this.state.typeList.map(item => {
                                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.projectname')} {...formItemLayout}>
                                {getFieldDecorator('projectName', {
                                    initialValue: this.state.info.project,
                                    rules: [],
                                })(

                                    <Input disabled />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                                {getFieldDecorator('orgId', {
                                    initialValue: this.state.info.org ? this.state.info.org.id : null,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                                    }],
                                })(

                                    //  <Input    onFocus={this.getOrgList}/>
                                    <TreeSelect

                                        style={{ width: "100%" }}
                                        onFocus={this.getOrgList}
                                        treeData={this.state.orgList1 ? this.state.orgList1 : this.state.orgList}
                                        // allowClear
                                        treeDefaultExpandAll

                                    />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>


                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingaddress')} {...formItemLayout}>
                                {getFieldDecorator('meetingAddress', {
                                    initialValue: this.state.info.meetingAddress,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.meetingaddress'),
                                    }],
                                })(
                                    <Input maxLength={66} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.meettime')} {...formItemLayout}>
                                {getFieldDecorator('meetingTime', {
                                    initialValue: dataUtil.Dates().formatDateMonent(this.state.info.meetingTime),
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.meettime'),
                                    }],
                                })(
                                    <DatePicker style={{ width: '100%' }} />
                                )}
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetinguser')} {...formItemLayout}>
                                {getFieldDecorator('meetingUser', {
                                    initialValue: this.state.info.meetingUser,
                                    rules: [],
                                })(
                                    <Input maxLength={33} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.creator')} {...formItemLayout}>
                                {getFieldDecorator('creator', {
                                    initialValue: this.state.info.creator ? this.state.info.creator.name : null,
                                    rules: [],
                                })(
                                    <Input disabled />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.creattime')} {...formItemLayout}>
                                {getFieldDecorator('creatTime', {
                                    initialValue: dataUtil.Dates().formatDateMonent(this.state.info.creatTime),
                                    rules: [],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingremark')} {...formItemLayout1}>
                                {getFieldDecorator('meetingRemark', {
                                    initialValue: this.state.info.meetingRemark,
                                    rules: [],
                                })(
                                    <TextArea maxLength={66} rows={4} />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} disabled={!this.props.meetActionEditAuth} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={!this.props.meetActionEditAuth} style={{ width: "100px", marginLeft: "20px" }} type="primary">保存</Button>
                </LabelFormButton>
            </LabelFormLayout>
        )
    }
}


const ComcateMeetingInfos = Form.create()(ComcateMeetingInfo);
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(ComcateMeetingInfos);
