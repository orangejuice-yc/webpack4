import { PureComponent } from 'react';
import { Modal, Form, Row, Col, Input, Select } from 'antd';
import axios from '@/api/axios';
import { addQuaSupervDesc, updateQuaSupervDesc } from '@/api/suzhou-api';
const { Option } = Select;

class AddForm extends PureComponent {
  state = {
    isregisterNum: 0,
  };
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // 增加
        if (this.props.modalData.modalType === 'ADD') {
          axios
            .post(
              addQuaSupervDesc(),
              {
                ...values,
                supervisorId: this.props.modalData.supervisorId,
              },
              true
            )
            .then(res => {
              const { status, data } = res.data;
              if (status === 200) {
                this.setState({
                  visible: false,
                });
                this.props.callBackAdd(data);
              }
            });
        }
        // 更新
        if (this.props.modalData.modalType === 'UPDATE') {
          axios
            .put(
              updateQuaSupervDesc(),
              {
                ...values,
                id: this.props.modalData.formValue.id,
                supervisorId: this.props.supervisorId,
              },
              true
            )
            .then(res => {
              const { status, data } = res.data;
              if (status === 200) {
                this.setState({
                  visible: false,
                });
                this.props.callbackUpdate(data);
              }
            });
        }
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title={this.props.modalData.title}
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={this.props.modalData.isModal}
        onOk={this.handleSubmit}
        onCancel={this.props.onCancel}
      >
        <Form {...formLayout}>
          <Row>
            <Col span={24}>
                  <Form.Item label={'内容描述'} {...formItemLayout1}>
                    {getFieldDecorator('supervisorDesc', {
                      rules: [{
                      required: true,
                      message: '请输入',
                    }],
                    })(
                      <Input.TextArea rows={2} />,
                    )}
                  </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" {...formItemLayout}>
                {getFieldDecorator('descStatus', {
                  rules: [
                    {
                      required: true,
                      message: '请输入',
                    },
                  ],
                })(
                  <Select
                    onChange={value =>
                      this.setState({
                        isregisterNum: value,
                      })
                    }
                    disabled={this.props.modalData.modalType === 'UPDATE'}
                    placeholder="请选择"
                  >
                    <Option value={1}>已完成</Option>
                    <Option value={0}>进行中</Option>
                  </Select>
                )}
              </Form.Item>
            </Col>
          {/* 登记证号 */}
          {this.state.isregisterNum ? (
              <Col span={12}>
                <Form.Item label="登记证号" {...formItemLayout}>
                  {getFieldDecorator('registerNum', {
                    rules: [
                      {
                        required: true,
                        message: '请输入',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
          ) : null}
          </Row>
        </Form>
      </Modal>
    );
  }
  componentDidUpdate(prevProps) {
    if (prevProps.modalData !== this.props.modalData) {
      if (this.props.modalData.modalType === 'UPDATE') {
        this.props.form.setFieldsValue({
          ...this.props.modalData.formValue,
        });
      }
    }
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
const formLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
};
export default Form.create()(AddForm);
