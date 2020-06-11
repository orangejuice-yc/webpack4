import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input } from 'antd'
import { DatePicker, Select } from 'antd'
import * as dataUtil from "@/utils/dataUtil"
const {Item} = Form
const {Option} = Select
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
class ModifyDetail1 extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  // 确认修改
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {id} = this.props.rightData
        const {deviceBirthday, deviceValidity, deviceCheckYear} = values
        const birthday = dataUtil.Dates().formatTimeString(deviceBirthday)
        const validity = dataUtil.Dates().formatTimeString(deviceValidity)
        const checkYear = dataUtil.Dates().formatTimeString(deviceCheckYear)
        const data = {...values, id, deviceBirthday:birthday, deviceValidity:validity, deviceCheckYear:checkYear}
        this.props.handleModalOkDetail(data)
      }
    })
  }

  render() {
    const { visibleModalDetail, handleModalCancel } = this.props
    const { getFieldDecorator } = this.props.form
    if (this.props.rightData === null) {
      return <span></span>
    }
    const {deviceCode, deviceName, typeVo, deviceType, deviceNum, deviceProducer, measurement, 
      constantCapacity, constantVoltage, deviceBirthday, deviceValidity, deviceCheckYear} = this.props.rightData
    let type, flag = false
    if (Object.prototype.toString.call(this.props.rightData.typeVo) === '[object Object]') {
      type = typeVo.code 
    } else if (Object.prototype.toString.call(this.props.rightData.type) === '[object String]') {
      type = this.props.rightData.type
    }

    return (
      <Modal
        title="修改"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModalDetail}
        onOk={this.handleOk}
        onCancel={handleModalCancel}
      >
        <Form {...formLayout} onSubmit={this.handleOk}>
          <Row key={1}>
            <Col span={12} key='deviceCode'>
              <Item label='设备编码' {...formItemLayout}>
                {getFieldDecorator("deviceCode", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备编码',
                    },
                    {
                      pattern: /^[\_a-zA-Z0-9\-]+$/,
                      message: '可输入字符"0-9 a-z A-Z - _"',

                    }
                  ],
                  initialValue: deviceCode
                })(
                  <Input disabled={true} />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceName'>
              <Item label='设备名称' {...formItemLayout}>
                {getFieldDecorator("deviceName", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备名称',
                    },
                  ],
                  initialValue: deviceName
                })(
                  <Input />
                )}
              </Item>
            </Col>
          {/* 
            <Col span={12} key='type'>
              <Item label='是否特种设备' {...formItemLayout}>
                {getFieldDecorator("type", {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否为特种设备',
                    },
                  ],
                  initialValue: type
                })(
                  <Select style={{ width: 255 }} placeholder="请在下拉框中选择">
                    <Option value="1">是</Option>
                    <Option value="0">否</Option>
                  </Select>
                )}
              </Item>
            </Col> */}
            <Col span={12} key='deviceType'>
              <Item label='规格型号' {...formItemLayout}>
                {getFieldDecorator("deviceType", {
                  rules: [
                    {
                      required: true,
                      message: '请输入规格型号',
                    },
                  ],
                  initialValue: deviceType
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceNum'>
              <Item label='数量' {...formItemLayout}>
                {getFieldDecorator("deviceNum", {
                  rules: [
                    {
                      required: true,
                      message: '请输入数量',
                    },
                    {
                      pattern: /^[0-9]+$/,
                      message: '可输入字符"0-9"',

                    }
                  ],
                  initialValue: deviceNum
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='measurement'>
              <Item label='计量单位' {...formItemLayout}>
                {getFieldDecorator("measurement", {
                  rules: [
                    {
                      required: true,
                      message: '请输入计量单位',
                    }
                  ],
                  initialValue: measurement
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='constantCapacity'>
              <Item label='额定容量' {...formItemLayout}>
                {getFieldDecorator("constantCapacity", {
                  rules: [
                    {
                      required: true,
                      message: '请输入额定容量',
                    }
                  ],
                  initialValue: constantCapacity
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='constantVoltage'>
              <Item label='额定电压' {...formItemLayout}>
                {getFieldDecorator("constantVoltage", {
                  rules: [
                    {
                      required: true,
                      message: '请输入额定电压',
                    }
                  ],
                  initialValue: constantVoltage
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceProducer'>
              <Item label='生产商' {...formItemLayout}>
                {getFieldDecorator("deviceProducer", {
                  rules: [
                    {
                      required: true,
                      message: '请输入生产商',
                    },
                  ],
                  initialValue: deviceProducer
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceBirthday'>
              <Item label='设备生产日期' {...formItemLayout}>
                {getFieldDecorator("deviceBirthday", {
                  rules: [
                    {
                      required: true,
                      message: '请选择设备生产日期',
                    },
                  ],
                  initialValue: dataUtil.Dates().formatDateMonent(deviceBirthday)
                })(
                  <DatePicker style={{width: 255}} />
                    // onChange={data => {this.setState({deviceBirthday: dataUtil.Dates().formatTimeString(data)})}} />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceValidity'>
              <Item label='设备有效期' {...formItemLayout}>
                {getFieldDecorator("deviceValidity", {
                  rules: [
                    {
                      required: true,
                      message: '请选择设备有效期',
                    },
                  ],
                  initialValue: dataUtil.Dates().formatDateMonent(deviceValidity)
                })(
                  <DatePicker style={{width: 255}} />
                    // onChange={data => {this.setState({deviceValidity: dataUtil.Dates().formatTimeString(data)})}} />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceCheckYear'>
              <Item label='设备年检时间' {...formItemLayout}>
              {getFieldDecorator("deviceCheckYear", {
                  rules: [
                    {
                      required: true,
                      message: '请选择设备年检时间',
                    },
                  ],
                  initialValue: dataUtil.Dates().formatDateMonent(deviceCheckYear)
                })(
                  <DatePicker style={{width: 255}} />
                    // onChange={data => {this.setState({deviceCheckYear: dataUtil.Dates().formatTimeString(data)})}} />
                )}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
const ModifyDetail = Form.create({name: 'ModifyDetail'})(ModifyDetail1)
export default ModifyDetail