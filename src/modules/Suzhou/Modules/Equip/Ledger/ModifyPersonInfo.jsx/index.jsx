import React, { Component } from 'react'
import { Form, Row, Col, Input, Modal } from 'antd'

const {Item} = Form
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

class ModifyPersonInfo1 extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {name, craft} = values
        const {id} = this.props.rightData
        this.props.handleModalOk({id, name, craft})
      }
    })
  }

  render() {
    const {visibleModifyPerson, handleModalCancel} = this.props
    const {getFieldDecorator} = this.props.form;
    if (this.props.rightData === null) {
      return <span></span>
    }
    const {name, craft} = this.props.rightData
    return (
      <Modal
        title="修改"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModifyPerson}
        onOk={this.handleOk}
        onCancel={handleModalCancel}
      >
        <Form {...formLayout}>
          <Row>
            <Col span={12} key={"name"}>
              <Item label={"姓名"} {...formItemLayout}>
                {getFieldDecorator("name", {
                  rules: [
                    {
                      required: true,
                      message: '请输入姓名',
                    },
                  ],
                  initialValue: name,
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key={"craft"}>
              <Item label={"工种"} {...formItemLayout}>
                {getFieldDecorator("craft", {
                  rules: [
                    {
                      required: true,
                      message: '请输入工种',
                    },
                  ],
                  initialValue: craft,
                })(
                  <Input />
                )}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}
const ModifyPersonInfo = Form.create({name: 'ModifyPersonInfo'})(ModifyPersonInfo1)
export default ModifyPersonInfo