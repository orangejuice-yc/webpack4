import React from 'react';
import { Button, Row, Col, Form, Input } from 'antd';
import { updateQuaSuperv } from '@/api/suzhou-api';
import axios from '@/api/axios';
import style from './style.less';
const { TextArea } = Input
class Info extends React.Component {
  handleRequst = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .put(
            updateQuaSuperv(),
            {
              id: this.props.data.id,
              registerNum: values['registerNum'],
              remark:values['remark']
            },
            true
          )
          .then(res => {
            const { data, status } = res.data;
            if (status === 200) {
              this.props.handleUpdate(data);
            }
          });
      }
    });
  };
  componentDidMount() {
    const {
      sectionName,
      sgdw,
      // jldw,
      yzdb,
      creater,
      creatTime,
      registerNum,
      isConfirmVo,
      projectName,
      sectionId,
      sectionCode,
      remark
    } = this.props.data;
    this.props.form.setFieldsValue({
      projectName,
      sectionName,
      sgdw,
      // jldw,
      yzdb,
      creater,
      creatTime,
      registerNum,
      isConfirm: isConfirmVo.name,
      tx: '每周',
      sectionId,
      sectionCode,
      remark
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={style.container}>
        <h3 className={style.h3}>基本信息</h3>
        <Form
          style={{ overflowY: 'auto', height: 'calc(100% - 100px)' }}
          {...formLayout}
          onSubmit={this.handleRequst}
        >
          <Row>
            <Col span={12}>
              <Form.Item label="项目名称" {...formItemLayout}>
                {getFieldDecorator('projectName')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="标段名称" {...formItemLayout}>
                {getFieldDecorator('sectionName')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="标段号" {...formItemLayout}>
                {getFieldDecorator('sectionCode')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="施工单位" {...formItemLayout}>
                {getFieldDecorator('sgdw')(<Input disabled={true} />)}
              </Form.Item>
            </Col>  
          </Row>          
          <Row>
            <Col span={12}>
              <Form.Item label="业主代表" {...formItemLayout}>
                {getFieldDecorator('yzdb')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="登记证号" {...formItemLayout}>
                {getFieldDecorator('registerNum')(
                  <Input disabled={this.props.data.isConfirmVo.code !== '1'} />
                )}
              </Form.Item>
            </Col> 
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="提醒周期" {...formItemLayout}>
                {getFieldDecorator('tx')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="确认状态" {...formItemLayout}>
                {getFieldDecorator('isConfirm')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="创建人" {...formItemLayout}>
                {getFieldDecorator('creater')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="创建日期" {...formItemLayout}>
                {getFieldDecorator('creatTime')(<Input disabled={true} />)}
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item label="监理单位" {...formItemLayout}>
                {getFieldDecorator('jldw')(<Input disabled={true} />)}
              </Form.Item>
            </Col> */}
          </Row>         
          <Row >
            <Col span={24} key='remark'>
              <Form.Item label='备注' {...formItemLayout1}>
                {getFieldDecorator("remark",{
                  // rules: [
                  //   {
                  //     required: false,
                  //     message: '请输入备注',
                  //   },
                  // ]
                })(
                  <TextArea rows={2} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12} offset={4}>
              <Button
                disabled={this.props.data.isConfirmVo.code !== '1'||this.props.permission.indexOf(this.props.editPermission)==-1}
                type="primary"
                htmlType="submit"
              >
                保存
              </Button>{' '}
              <Button onClick={this.props.closeRightBox} style={{ marginRight: 15 }}>
                取消
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
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
const formLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
};
export default Form.create()(Info);
