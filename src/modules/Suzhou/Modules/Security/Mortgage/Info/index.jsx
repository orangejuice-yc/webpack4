import React, { Component } from 'react';
import { Row, Col, Button, Form, Select, Input, DatePicker, TreeSelect, InputNumber } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateMortgageRefund } from '@/modules/Suzhou/api/suzhou-api';

import {
  formLayout,
  formItemLayout,
  zipinLayout,
  getBaseData,
} from '@/modules/Suzhou/components/Util/util';
const Option = Select;

export default Form.create()(
  class extends Component {
    state = {
      jclx: [],
      sectionId: null,
    };
    getBaseSelectTreeType = () => {
      getBaseData('szxm-aqgl-wbcheckType').then(data => this.setState({ jclx: data }));
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
                  {getFieldDecorator('sectionName', {
                    initialValue: this.props.rightData.sectionName,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  {getFieldDecorator('sectionCode', {
                    initialValue: this.props.rightData.sectionCode,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="施工单位" {...formItemLayout}>
                  {getFieldDecorator('sgdw', {
                    initialValue: this.props.rightData.sgdw,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="标段类型" {...formItemLayout}>
                  {getFieldDecorator('sectionType', {
                    initialValue: this.props.rightData.sectionType,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {/* <Col span={12}>
                <Form.Item label="发起时间" {...formItemLayout}>
                  {getFieldDecorator('initTime', {
                    initialValue: this.props.rightData.initTime,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="申请退还金额（万元）" {...formItemLayout}>
                  {getFieldDecorator('sqthje', {
                    initialValue: this.props.rightData.sqthje,
                  })(
                    <InputNumber
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag)?false:true)}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} offset={4}>
                <Button
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('MORTGAGE_EDIT-MORTGAGE')==-1?true:false):true}
                  htmlType="submit"
                  type="primary"
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
    componentDidMount() {}
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            sqthje: values['sqthje'],
            id: this.props.rightData.id,
          };
          axios.put(updateMortgageRefund, params, true).then(res => {
            const { data, status } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
