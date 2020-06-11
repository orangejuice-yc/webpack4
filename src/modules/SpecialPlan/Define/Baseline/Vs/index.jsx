import React, { Component } from 'react'
import { Modal, Form, Row, Col, Button, Select,notification } from 'antd';
import style from './style.less'
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import {
    getdictTree,
    defineBaselineInfo,
    getFieldBaseLineCompare,
} from '../../../../../api/api'

class PlanDefineBaselineVs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            formData: {},
            baselineTypeList: [],
            planBaseLineCompareList: []
        }
    }

    componentDidMount() {

        axios.get(getdictTree('plan.define.baselinetype'), {}, null, null, false).then(res => {
            this.setState({
                baselineTypeList: res.data.data
            })
        })

        axios.get(getFieldBaseLineCompare(this.props.defineId), {}, null, null, false).then(res => {
            this.setState({
                planBaseLineCompareList: res.data.data
            })
        })

        if (this.props.type == 'amend') {
            this.getData();
        }

    }

    getData = () => {
        axios.get(defineBaselineInfo(this.props.record.id)).then(res => {
            this.setState({
                formData: res.data.data
            })
        })
    }
    handleSubmit = (e) => {
        e.preventDefault()
        this.props.form.validateFieldsAndScroll((err, val) => {
            if (!err) {
                //关闭弹窗
                this.props.handleCancel()
                const firstBaseLine = val.firstBaseLine
                const secondBaseLine = val.secondBaseLine
                if(firstBaseLine == secondBaseLine){
                    notification.warning(
                        {
                          placement: 'bottomRight',
                          bottom: 50,
                          duration: 2,
                          message: "警告",
                          description: "请选择不同的基线!"
                        }
                      )
                      return false
                }
                const defineId = this.props.defineId
                const projectId = this.props.projectId
                localStorage.setItem("planBaseLineParam",JSON.stringify({firstBaseLine,secondBaseLine, defineId,projectId}))
                this.props.callBackBanner({id:-12,menuName:"基线对比",url:"Plan/Define/Baseline/Compare"},true)
            }
         
        })
    }

    render() {
        const { intl } = this.props.currentLocale;
        const {
            getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
          } = this.props.form;
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
        return (
            <div className={style.main}>
                <Modal className={style.formMain} width="850px" footer={null} centered={true} title={'基线对比'}
                    visible={true} onCancel={this.props.handleCancel} footer={
                        <div className="modalbtn">
                          <Button key="abolish" onClick={this.props.handleCancel}>取消</Button>
                          <Button key="save" type="primary" onClick={this.handleSubmit}>对比</Button>
                        </div>
                    }>
                    <Form onSubmit={this.handleSubmit}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={12}>
                                    <Form.Item label={"执行计划"} {...formItemLayout}>
                                        {/* 基线1 */}
                                        
                                        {getFieldDecorator('firstBaseLine', {
                                            initialValue: null,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + "执行计划",
                                            }],
                                        })(
                                            <Select >
                                                {this.state.planBaseLineCompareList.length ? this.state.planBaseLineCompareList.map(item => {
                                                    return (
                                                        <Select.Option key={item.id} value={item.id}>{item.baselineName}</Select.Option>
                                                    )
                                                }) : null}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={intl.get('wsd.i18n.plan.baseline.comparebaseline')} {...formItemLayout}>
                                        {/* 基线2*/}
                                        {getFieldDecorator('secondBaseLine', {
                                            initialValue: null,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + " 对比基线",
                                            }],
                                        })(
                                            <Select >
                                                {this.state.planBaseLineCompareList.length ? this.state.planBaseLineCompareList.map(item => {
                                                    return (
                                                        <Select.Option key={item.id} value={item.id}>{item.baselineName}</Select.Option>
                                                    )
                                                }) : null}
                                            </Select>
                                        )}
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

const PlanDefineBaselineVss = Form.create()(PlanDefineBaselineVs);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineBaselineVss)
