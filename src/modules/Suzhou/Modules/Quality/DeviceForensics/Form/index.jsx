import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Row, Col, Button } from 'antd'
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

class FormComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    return (
      <Form {...formLayout}>
        {this.props.formListData.map((item, index) => (
          <Row key={index}>
            {item.map(item => (
              <Col span={12} key={item.label}>
                <Form.Item label={item.label} {...formItemLayout}>
                  <Input disabled={item.disabled} />
                </Form.Item>
              </Col>
            ))}
          </Row>
        ))}
      </Form>
    )
  }
}

FormComponent.PropTypes = {
  formListData: PropTypes.array
}

export default FormComponent