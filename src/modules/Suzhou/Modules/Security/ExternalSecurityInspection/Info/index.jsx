import React, { Component } from 'react';
import { Row, Col, Button, Form, Select, Input, DatePicker, TreeSelect } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateOutUnitSecurityCheck } from '@/modules/Suzhou/api/suzhou-api';

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
                <Form.Item label="检查标题" {...formItemLayout}>
                  {getFieldDecorator('title', {
                    rules: [
                      {
                        required: true,
                        message: '检查标题',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="检查编号" {...formItemLayout}>
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        required: true,
                        message: '检查编号',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="检查类型" {...formItemLayout}>
                  {getFieldDecorator('jclx', {
                    rules: [
                      {
                        required: true,
                        message: '检查类型',
                      },
                    ],
                  })(
                    <Select onFocus={this.getBaseSelectTreeType} placeholder="请选择">
                      {this.state.jclx.map(item => {
                        return (
                          <Option value={item.value} key={item.value}>
                            {item.title}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="检查单位" {...formItemLayout}>
                  {getFieldDecorator('jcdwName')(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item label="发现问题" {...zipinLayout}>
                  {getFieldDecorator('question')(<Input.TextArea />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} offset={4}>
                <Button htmlType="submit" type="primary" style={{ marginRight: 15 }}
                disabled = {this.props.permission.indexOf('CHECK_SCENE-CHECK')==-1?true:false}>
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
      getBaseData('szxm-aqgl-wbcheckType').then(data => {
        this.setState({ jclx: data }, () => {
          this.props.form.setFieldsValue({
            jclx: _['jclxVo'].code + '',
          });
        });
      });

      this.props.form.setFieldsValue({
        sectionName: _['sectionName'],
        sectionCode: _['sectionCode'],
        title: _['title'],
        question: _['question'],
        code: _['code'],
        jcdwName: _['jcdwName'],
      });
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            projectId: this.props.rightData.projectId,
            jcsx: moment(values.jcsx).format('YYYY-MM-DD'),
            id: this.props.rightData.id,
          };
          axios.put(updateOutUnitSecurityCheck, params, true).then(res => {
            const { data, status } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
