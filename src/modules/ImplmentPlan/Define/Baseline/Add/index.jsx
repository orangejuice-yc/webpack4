import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, Icon, Select, DatePicker, Slider, InputNumber, Switch } from 'antd';
import style from './style.less'
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import {
  defineBaselineAdd,
  getdictTree,
  defineBaselineInfo,
  defineBaselineUpdate,
  defineBaselineDel
} from '../../../../../api/api'
import * as dataUtil from "../../../../../utils/dataUtil";

const { TextArea } = Input

export class PlanDefineBaselineAdd extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formData: {},
            baselineTypeList: []
        }
    }

    componentDidMount() {

        axios.get(getdictTree('plan.define.baselinetype'), {}, null, null, false).then(res => {
            
            this.setState({
                baselineTypeList: res.data.data
            })
        })

        if (this.props.type == 'amend') {
            this.getData();
        }

    }

    getData = () => {
        axios.get(defineBaselineInfo(this.props.record.id)).then(res => {
            ;
            this.setState({
                formData: res.data.data
            })
        })
    }

    handleSubmit = (val, e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
            if (!err) {
                if (this.props.type == 'add') {

                    let data = {
                        ...fieldsValue,
                        projectId: this.props.projectId,
                        defineId: this.props.data.id,
                    }
                    let {startContent} = this.props.extInfo  || {};
                    let url = dataUtil.spliceUrlParams(defineBaselineAdd,{startContent});
                    axios.post(url, data, true).then(res => {
                        // ;
                        this.props.addData(res.data.data)
                        if (val == 'save') {
                            // 关闭弹窗
                            this.props.handleCancel()
                        } else {
                            // 清空表单项
                            this.props.form.resetFields()
                        }
                    })

                } else if (this.props.type == 'amend') {
                    let data = {
                        ...fieldsValue,
                        projectId: this.props.projectId,
                        defineId: this.props.data.id,
                        id: this.props.record.id
                    }
                    let {startContent} = this.props.extInfo  || {};
                    let url = dataUtil.spliceUrlParams(defineBaselineUpdate,{startContent});
                    axios.put(url, data, true).then(res => {
                        ;
                        this.props.upDate(res.data.data)
                         // 关闭弹窗
                         this.props.handleCancel()
                    })

                }



                // // 清空表单项
                // this.props.form.resetFields()
                // // 关闭弹窗
                // this.props.handleCancel()
            }
        })
    }

    render() {
        const { intl } = this.props.currentLocale;
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 18 },
            },
        };
        const formItemLayout2 = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 3 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 21 },
            },
        };
        return (
            <div className={style.main}>
                <Modal className={style.formMain} width="850px" footer={null} centered={true} title={this.props.title + '基线'}
                    visible={this.props.modalVisible} onCancel={this.props.handleCancel} footer={
                        <div className="modalbtn">
                            {this.props.type == 'add' ?
                                <Button key="submit" onClick={this.handleSubmit.bind(this, 'goOn')}>保存并继续</Button>
                                : <Button key="abolish" onClick={this.props.handleCancel}>取消</Button>
                            }

                        <Button key="save" type="primary" onClick={this.handleSubmit.bind(this, 'save')}>保存</Button>
                        </div>
                    }>
                    <Form onSubmit={this.handleSubmit}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={12}>
                                    <Form.Item label={intl.get("wsd.i18n.plan.baseline.baselinename")} {...formItemLayout}>
                                    {/* 基线名称 */}
                                        <div className={style.list}>
                                            {getFieldDecorator('baselineName', {
                                                initialValue: this.state.formData.baselineName,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.baseline.baselinename'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={intl.get('wsd.i18n.plan.baseline.baselinetype')} {...formItemLayout}>
                                    {/* 基线类型 */}
                                        <div className={style.list}>
                                            {getFieldDecorator('baselineType', {
                                                initialValue: this.state.formData.baselineType ? this.state.formData.baselineType.id : null,
                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.baseline.baselinetype'),
                                                }],
                                            })(
                                                <Select>
                                                    {this.state.baselineTypeList.length ? this.state.baselineTypeList.map(item => {
                                                        return (
                                                            <Select.Option key={item.value} value={item.value}>{item.title}</Select.Option>
                                                        )
                                                    }) : null}
                                                </Select>
                                            )}
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={intl.get('wsd.i18n.plan.baseline.remark')} {...formItemLayout2}>
                                    {/* 备注 */}
                                        <div className={style.list}>
                                            {getFieldDecorator('remark', {
                                                initialValue: this.state.formData.remark,
                                                rules: [],
                                            })(
                                                <TextArea rows={4} style={{ width: '100%' }} />
                                            )}
                                        </div>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </Modal>
            </div>
        )
    }
}

const PlanDefineBaselineAdds = Form.create()(PlanDefineBaselineAdd);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineBaselineAdds)
