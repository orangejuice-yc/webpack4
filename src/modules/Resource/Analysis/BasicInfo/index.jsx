import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker } from 'antd';
import emitter from '../../../../api/ev';
import moment from 'moment';
import intl from 'react-intl-universal'
const locales = {
    "en-US": require('../../../../api/language/en-US.json'),
    "zh-CN": require('../../../../api/language/zh-CN.json')
}
const FormItem = Form.Item;
class MenuInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            info: {
                key: "1",
                projectName: 1,
                wbsName: 1,
                taskName: 1,
                planStartTime: null,
                planEndTime: null,
                rsrcName: 1,
                rsrcRole: 1,
                unit: 1,
                maxUnitNum: 1,
                planNum: 1,
                actStartTime: null,
                actEndTime: null,
                actNum: 1,
            }
        }
    }

    componentDidMount() {
        this.loadLocales();
        this.setState({
            width: this.props.width
        })
    }

    loadLocales() {
        intl.init({
            currentLocale: 'zh-CN',
            locales,
        })
            .then(() => {
                // After loading CLDR locale data, start to render
                this.setState({ initDone: true });
            });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        alert(1)
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
            }
        });
    }

    render() {
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
        return (

            <div className={style.main}>
                {this.state.initDone &&
                    <div>
                        <h3 className={style.listTitle}>基本信息</h3>
                        <Form onSubmit={this.handleSubmit}>
                            <div className={style.content}>
                                <Row gutter={24} type="flex">
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.projectname')} {...formItemLayout}>
                                            {getFieldDecorator('projectName', {
                                                initialValue: this.state.info.projectName,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.projectname'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.wbsname')} {...formItemLayout}>
                                            {getFieldDecorator('wbsName', {
                                                initialValue: this.state.info.wbsName,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.wbsname'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>                                                        <Col span={11}>
                                    <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.taskname')} {...formItemLayout}>
                                        {getFieldDecorator('taskName', {
                                            initialValue: this.state.info.taskName,
                                            rules: [],
                                        })(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.planstarttime')} {...formItemLayout}>
                                            {getFieldDecorator('planStartTime', {
                                                initialValue: this.state.info.planStartTime ? moment(this.state.info.planStartTime, 'YYYY-MM-DD') : null,
                                                rules: [],
                                            })(
                                                <DatePicker style={{ width: "100%" }} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>

                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.rsrcname')} {...formItemLayout}>
                                            {getFieldDecorator('rsrcName', {
                                                initialValue: this.state.info.rsrcName,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.rsrcname'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.planendtime')} {...formItemLayout}>
                                            {getFieldDecorator('planEndTime', {

                                                initialValue: this.state.info.planEndTime ? moment(this.state.info.planEndTime, 'YYYY-MM-DD') : null,
                                                rules: [],
                                            })(
                                                <DatePicker style={{ width: "100%" }} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>                                                        <Col span={11}>
                                    <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.rsrcrole')} {...formItemLayout}>
                                        {getFieldDecorator('rsrcRole', {
                                            initialValue: this.state.info.rsrcRole,
                                            rules: [
                                                //     {
                                                //     required: true,
                                                //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.rsrcrole'),
                                                // }
                                            ],
                                        })(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.unit')} {...formItemLayout}>
                                            {getFieldDecorator('unit', {
                                                initialValue: this.state.info.unit,
                                                rules: [
                                                    //     {
                                                    //     required: true,
                                                    //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.unit'),
                                                    // }
                                                ],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>                                                        <Col span={11}>
                                    <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.maxunitnum')} {...formItemLayout}>
                                        {getFieldDecorator('maxUnitNum', {
                                            initialValue: this.state.info.maxUnitNum,
                                            rules: [
                                                //     {
                                                //     required: true,
                                                //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.maxunitnum'),
                                                // }
                                            ],
                                        })(
                                            <Input />
                                        )}
                                    </Form.Item>
                                </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.plannum')} {...formItemLayout}>
                                            {getFieldDecorator('planNum', {
                                                initialValue: this.state.info.planNum,
                                                rules: [
                                                    //     {
                                                    //     required: true,
                                                    //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.plannum'),
                                                    // }
                                                ],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>                                                                     <Col span={11}>
                                    <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.actstarttime')} {...formItemLayout}>
                                        {getFieldDecorator('actStartTime', {

                                            initialValue: this.state.info.actStartTime ? moment(this.state.info.actStartTime, 'YYYY-MM-DD') : null,
                                            rules: [
                                                //     {
                                                //     required: true,
                                                //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.actstarttime'),
                                                // }
                                            ],
                                        })(
                                            <DatePicker style={{ width: "100%" }} />
                                        )}
                                    </Form.Item>
                                </Col>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.actnum')} {...formItemLayout}>
                                            {getFieldDecorator('actNum', {
                                                initialValue: this.state.info.actNum,
                                                rules: [
                                                    //     {
                                                    //     required: true,
                                                    //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.actnum'),
                                                    // }
                                                ],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={11}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.analysis.actendtime')} {...formItemLayout}>
                                            {getFieldDecorator('actEndTime', {

                                                initialValue: this.state.info.actEndTime ? moment(this.state.info.actEndTime, 'YYYY-MM-DD') : null,
                                                rules: [
                                                    //     {
                                                    //     required: true,
                                                    //     message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.analysis.actendtime'),
                                                    // }
                                                ],
                                            })(
                                                <DatePicker style={{ width: "100%" }} />
                                            )}
                                        </Form.Item>
                                    </Col>

                                </Row>
                                <Row gutter={24}>
                                    <Col span={11} >
                                        <Col offset={8} style={{ padding: 0 }} span={16}>
                                            <div className={style.btn}>
                                                <Button onClick={this.handleSubmit} type="primary">保存</Button>
                                                <Button>取消</Button>
                                            </div>

                                        </Col>

                                    </Col>

                                </Row>
                            </div>
                        </Form>
                    </div>}
            </div>
        )
    }
}
const MenuInfos = Form.create()(MenuInfo);
export default MenuInfos
// {
//            "wsd.i18n.rsrc.analysis.projectname" : "项目名称",
//             "wsd.i18n.rsrc.analysis.wbsname" : "wbs名称",
//             "wsd.i18n.rsrc.analysis.taskname" : "任务名称",
//             "wsd.i18n.rsrc.analysis.planstarttime" : "计划开始时间",
//             "wsd.i18n.rsrc.analysis.planendtime" : "计划结束时间",
//             "wsd.i18n.rsrc.analysis.rsrcname" : "资源名称",
//             "wsd.i18n.rsrc.analysis.rsrcrole" : "资源角色",
//             "wsd.i18n.rsrc.analysis.unit" : "计量单位",
//             "wsd.i18n.rsrc.analysis.maxunitnum" : "单位最大用量",
//             "wsd.i18n.rsrc.analysis.plannum" : "计划用量",
//             "wsd.i18n.rsrc.analysis.actstarttime" : "实际开始时间",
//             "wsd.i18n.rsrc.analysis.actendtime" : "实际结束时间",
//             "wsd.i18n.rsrc.analysis.actnum" : "实际用量",
//     }