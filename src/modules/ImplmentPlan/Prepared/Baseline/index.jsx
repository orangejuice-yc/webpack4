import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input} from 'antd';
import intl from 'react-intl-universal'

import axios from "../../../../api/axios"
import {
    getPlanBaselineInfo
} from "../../../../api/api"
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"


class PlanPreparedBaseline extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            info: {}
        }
    }

    componentDidMount() {
        this.getPlanBaselineInfo()
    }

    // 获取Task基线计划
    getPlanBaselineInfo = () => {
        const { rightData } = this.props
        if (rightData[0]['nodeType'] == 'task' || rightData[0]['nodeType'] == 'wbs') {
            axios.get(getPlanBaselineInfo(rightData[0]['id'], rightData[0]['defineId'])).then(res => {
                const { data } = res.data
                if(data){
                    this.setState({
                        info: data
                    })
                }
               
            })
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
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

          <LabelFormLayout title = {this.props.title} >
            <Form onSubmit={this.handleSubmit}>
              <Row gutter={24} type="flex">
                <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.plan.baseline.baselinename')} {...formItemLayout}>
                    {getFieldDecorator('taskName', {
                      initialValue:  this.state.info.taskName ,
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="代码" {...formItemLayout}>
                    {getFieldDecorator('taskCode', {
                      initialValue: this.state.info ? this.state.info.taskCode : "",
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24} type="flex">
                <Col span={12}>
                  <Form.Item label="基线责任主体" {...formItemLayout}>
                    {getFieldDecorator('org', {
                      initialValue: this.state.info.org ? this.state.info.org.name : '',
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="基线责任人" {...formItemLayout}>
                    {getFieldDecorator('user', {
                      initialValue: this.state.info.user ? this.state.info.user.name : '',
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24} type="flex">
                <Col span={12}>
                  <Form.Item label="基线开始" {...formItemLayout}>
                    {getFieldDecorator('planStartTime', {
                      initialValue:  this.state.info.planStartTime,
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="基线完成" {...formItemLayout}>
                    {getFieldDecorator('planEndTime', {
                      initialValue:  this.state.info.planEndTime,
                      rules: [],
                    })(
                      <Input disabled={true} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </LabelFormLayout>
        )
    }
}
const PlanPreparedBaselines = Form.create()(PlanPreparedBaseline);
export default PlanPreparedBaselines
