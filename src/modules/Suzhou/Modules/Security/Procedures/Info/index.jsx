import React, { Component } from 'react';
import { Row, Col, Select, Button, Form, Input } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateSubcontrApproval } from '@/modules/Suzhou/api/suzhou-api';
import { formItemLayout, formLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
const Option = Select.Option;

export default Form.create()(
  class extends Component {
    state = {
      subcontrType: [],
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <div className={style.container}>
          <h3 className={style.h3}>基本信息</h3>
          <Form {...formLayout} onSubmit={this.handleSubmit}>
            <Row>
              <Col span={12}>
                <Form.Item label="标段名称" {...formItemLayout}>
                  {getFieldDecorator('sectionName')(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  {getFieldDecorator('sectionCode')(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="分包类型" {...formItemLayout}>
                  {getFieldDecorator('subcontrType')(
                    <Select
                      placeholder="分包类型"
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true}
                    >
                      {this.state.subcontrType.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.title}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="分包编号" {...formItemLayout}>
                  {getFieldDecorator('subcontrCode')(
                    <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="分包名称" {...formItemLayout}>
                  {getFieldDecorator('subcontrName')(
                    <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="施工单位" {...formItemLayout}>
                  {getFieldDecorator('sgdw')(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="发起日期" {...formItemLayout}>
                  {getFieldDecorator('initTime')(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="发起人" {...formItemLayout}>
                  {getFieldDecorator('initiator')(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
            <Col span={12} key='signDate'>
              <Form.Item label='签订日期' {...formItemLayout}>
                {getFieldDecorator("signDate",{
                  rules: [
                    {
                      required: true,
                      message: '请选择签订日期',
                    },
                  ]
                })(
                  <Input disabled/>
                )}
              </Form.Item>
            </Col>
          </Row>
            <Row>
              <Col span={12} offset={4}>
                <Button
                  htmlType="submit"
                  type="primary"
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('PROCEDURES_EDIT-SUBCONTRACT')==-1?true:false):true}
                  style={{ marginRight: 15 }}
                >
                  保存
                </Button>
                <Button onClick={this.props.closeRightBox}>取消</Button>
              </Col>
            </Row>
          </Form>
        </div>
      );
    }

    componentDidMount() {
      const _ = this.props.rightData;
      this.props.form.setFieldsValue({
        sectionName: _['sectionName'],
        sectionCode: _['sectionCode'],
        subcontrCode: _['subcontrCode'],
        subcontrName: _['subcontrName'],
        sgdw: _['sgdw'],
        initTime: _['initTime'],
        initiator: _['initiator'],
        subcontrType: _.subcontrTypeVo['code'],
        signDate:_['signDate']
      });
      getBaseData('szxm.aqgl.subcontrtype').then(data => this.setState({ subcontrType: data }));
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values['id'] = this.props.rightData.id;
          axios.put(updateSubcontrApproval(), values, true).then(res => {
            this.props.updatetableCallBack(res.data.data);
          });
        }
      });
    };
  }
);
