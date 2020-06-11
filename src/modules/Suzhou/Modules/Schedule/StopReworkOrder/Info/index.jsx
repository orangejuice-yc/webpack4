import React, { Component } from 'react';
import style from './style.less';
import { Button, Form, Row, Col, Input, DatePicker } from 'antd';
import axios from '@/api/axios';
import { updateStopRework } from '../../../../api/suzhou-api';
const { Item } = Form;
const { TextArea } = Input;
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
class StopReworkOrderInfo1 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleOk = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { applyNum, contract } = values;
        const { id } = this.props.rightData;
        axios.put(updateStopRework(), { id, applyNum, contract },true).then(res => {
          this.props.handleModelOk({ ...this.props.rightData, applyNum, contract });
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { applyNum, contract, sgdw, jldw, sectionName, sectionCode,creater,creatTime ,remark} = this.props.rightData;
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.handleOk}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key="sectionName">
                  <Item label="选择标段" {...formItemLayout}>
                    {getFieldDecorator('sectionName', {
                      rules: [
                        {
                          required: true,
                          message: '请选择标段名称',
                        },
                      ],
                      initialValue: sectionName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key="sectionCode">
                  <Item {...formItemLayout} label="标段号">
                    {getFieldDecorator('sectionCode', {
                      initialValue: sectionCode,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                <Col span={12} key="applyNum">
                  <Item {...formItemLayout} label="编号">
                    {getFieldDecorator('applyNum', {
                      rules: [
                        {
                          required: true,
                          message: '请输入编号',
                        },
                      ],
                      initialValue: applyNum,
                    })(<Input />)}
                  </Item>
                </Col>
                <Col span={12} key="contract">
                  <Item {...formItemLayout} label="合同号">
                    {getFieldDecorator('contract', {
                      rules: [
                        {
                          required: true,
                          message: '请输入合同号',
                        },
                      ],
                      initialValue: contract,
                    })(<Input />)}
                  </Item>
                </Col>
              </Row>
              <Row key={3}>
                <Col span={12} key="sgdw">
                  <Item {...formItemLayout} label="施工单位">
                    {getFieldDecorator('sgdw', {
                      initialValue: sgdw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                {/* <Col span={12} key="jldw">
                  <Item {...formItemLayout} label="监理单位">
                    {getFieldDecorator('jldw', {
                      initialValue: jldw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col> */}
                <Col span={12} key="creater">
                  <Item {...formItemLayout} label="创建人">
                    {getFieldDecorator('creater', {
                      initialValue: creater,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key="creatTime">
                  <Item {...formItemLayout} label="创建时间">
                    {getFieldDecorator('creatTime', {
                      initialValue: creatTime,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              </Row>
              <Row key={5}>
                <Col span={24} key="remark">
                  <Item label="备注" {...formItemLayout1}>
                    {getFieldDecorator('remark', {
                      initialValue: remark,
                    })(<TextArea rows={2} />)}
                  </Item>
                </Col>
              </Row>
              <Item wrapperCol={{ offset: 4 }}>
                <Button
                  className="globalBtn"
                  htmlType="submit"
                  onClick={this.handleOk}
                  style={{ marginRight: 20 }}
                  type="primary"
                  disabled={this.props.permission.indexOf('STOPREWORKORDER_EDIT-STOP-RE-ORDER')==-1?true:false}
                >
                  保存
                </Button>
                <Button className="globalBtn" onClick={this.props.closeRightBox}>
                  取消
                </Button>
              </Item>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

const StopReworkOrderInfo = Form.create({ name: 'StopReworkOrderInfo' })(StopReworkOrderInfo1);
export default StopReworkOrderInfo;
