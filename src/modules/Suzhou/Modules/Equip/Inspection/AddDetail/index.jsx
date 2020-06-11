import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button } from 'antd'
import { DatePicker, Select } from 'antd'
import style from './style.less';

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
class AddDetail1 extends Component {
  constructor(props) {
    super(props)
    this.state={}
  }
  // 新增
  handleOk = (type, e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        this.props.handleModalOk(values, type)
        if (type === 'goOn') {
          this.props.form.setFieldsValue({
            deviceName: '',
            type: 1,
            deviceType: '',
            deviceNum: '',
            measurement: '',
            constantCapacity: '',
            constantVoltage: '',
            deviceProducer: '',
            deviceBirthday: null,
            deviceValidity: null,
            deviceCheckYear: null,
          })
        }
      }
    })
  }

  render() {
    const {visibleModal, handleModalCancel} = this.props
    const { getFieldDecorator } = this.props.form
    return (
      <Modal
        title="新增"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModal}
        onCancel={handleModalCancel}
        footer={
          <div className="modalbtn">
            {/* 保存并继续 */}
            <Button key={1} onClick={this.handleOk.bind(this, 'goOn')}>保存并继续</Button>
            {/* 保存 */}
            <Button key={2} onClick={this.handleOk.bind(this, 'save')} type="primary">保存</Button>
          </div>
        }
      >
        <Form {...formLayout} onSubmit={this.handleOk} className={style.mainScorll}>
          <Row key={1}>
            <Col span={12} key='deviceName'>
              <Item label='设备名称' {...formItemLayout}>
                {getFieldDecorator("deviceName", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备名称',
                    },
                  ],
                })(
                  <Input />
                )}
              </Item>
            </Col>
            {/* <Col span={12} key='type'>
              <Item label='是否特种设备' {...formItemLayout}>
                {getFieldDecorator("type", {
                  rules: [
                    {
                      required: true,
                      message: '请选择是否为特种设备',
                    },
                  ], 
                  initialValue: 1,
                })(
                  <Select style={{ width: 255 }} placeholder="请在下拉框中选择">
                    <Option value={1}>是</Option>
                    <Option value={0}>否</Option>
                  </Select>
                )}
              </Item>
            </Col> */}
            <Col span={12} key='deviceCode'>
              <Item label='设备编码' {...formItemLayout}>
                {getFieldDecorator("deviceCode", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备编码',
                    },
                  ],
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='deviceType'>
              <Item label='规格型号' {...formItemLayout}>
                {getFieldDecorator("deviceType", {
                  rules: [
                    {
                      required: false,
                      message: '请输入规格型号',
                    },
                  ],
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
                      required: false,
                      message: '请输入额定容量',
                    }
                  ],
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
                      required: false,
                      message: '请输入额定电压',
                    }
                  ],
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
                      required: false,
                      message: '请输入生产商',
                    },
                  ],
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
const AddDetail = Form.create({name: 'AddDetail'})(AddDetail1)
export default AddDetail