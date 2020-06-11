import React, { Component } from 'react'
import { Form, Modal, Row, Col, Input ,DatePicker} from 'antd'
import { addWorkApply } from '../../../../api/suzhou-api'
import axios from '@/api/axios'
import SelectSection from '@/modules/Suzhou/components/SelectSection';
import * as dataUtil from "@/utils/dataUtil";
const { Item } = Form

class AddApply1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      flag: true
    }
  }

  componentWillReceiveProps({ visibleModal, projectId }) {
    const {flag} = this.state
    if (visibleModal && projectId && flag) {
      this.setState({flag: false})
    }
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {sectionId, applyCode} = values
        const {projectId} = this.props
        const applyWorkDay=dataUtil.Dates().formatTimeString(values.applyWorkDay).substr(0,10)
        axios.post(addWorkApply, {projectId, sectionId, applyCode ,applyWorkDay}).then(res => {
          this.props.handleModalOk(res.data.data)
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title="新增"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={this.props.visibleModal}
        onOk={this.handleOk}
        onCancel={this.props.handleModalCancel}
      >
        <Form {...formLayout}>
          <Row key={1}>
            <Col span={12} key='sectionId'>
              <Item label='选择标段' {...formItemLayout}>
                {getFieldDecorator("sectionId", {
                  rules: [
                    {
                      required: true,
                      message: '请选择标段名称',
                    },
                  ]
                })(
                  <SelectSection
                      projectId={this.props.projectId}
                      callBack={({ sectionId ,sectionCode}) => {
                          this.props.form.setFieldsValue({ sectionId});
                          this.setState({sectionCode})
                      }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  <Input disabled={true} value={this.state.sectionCode} />
                </Form.Item>
            </Col>
            <Col span={12} key='applyCode'>
              <Item {...formItemLayout} label='编号' >
                {getFieldDecorator('applyCode',{
                  rules:[
                    {
                      required:true,
                      message:"请输入申请编号"
                    },
                    {
                      pattern: /^[\_a-zA-Z0-9\-]+$/,
                      message: '可输入字符"0-9 a-z A-Z - _"',

                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
            </Col>
            {/* <Col span={12} key='contract'>
              <Item {...formItemLayout} label='合同号' >
                {getFieldDecorator('contract',{
                  rules:[
                    {
                      required:true,
                      message:"请输入合同号"
                    },
                    {
                      pattern: /^[\_a-zA-Z0-9\-]+$/,
                      message: '可输入字符"0-9 a-z A-Z - _"',
  
                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
            </Col> */}
            <Col span={12} key='applyWorkDay'>
                <Item label='申请开工日期' {...formItemLayout}>
                  {getFieldDecorator("applyWorkDay",{
                    rules: [
                      {
                        required: true,
                        message: '请选择时间',
                      },
                    ]
                  })(
                    <DatePicker  style={{width:'100%'}}/>
                  )}
                </Item>
              </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}
const formLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
}
const formItemLayout1 = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 20},
  },
}
const AddApply = Form.create({name: 'AddApply'})(AddApply1)

export default AddApply