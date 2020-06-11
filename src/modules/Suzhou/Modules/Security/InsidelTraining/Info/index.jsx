import React, { Component } from 'react';
import { Row, Col, Button, TreeSelect, Form, Select, Input, DatePicker,InputNumber} from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateTrainDisclosure } from '@/modules/Suzhou/api/suzhou-api';
import { formLayout, formItemLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
import { departmentTree } from '@/modules/Suzhou/api/suzhou-api';
const Option = Select.Option;

export default Form.create()(
  class extends Component {
    state = {
      trainTypes: [], // 培训类型
      department: [], // 发起部门
      sponsorDepName: '',
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <div className={style.container}>
          <h3 className={style.h3}>基本信息</h3>
          <Form {...formLayout} onSubmit={this.handleSubmit}>
            <Row>
              <Col span={12}>
                <Form.Item label="培训类型" {...formItemLayout}>
                  {getFieldDecorator('trainType', {
                    rules: [
                      {
                        required: true,
                        message: '请选择培训类型',
                      },
                    ],
                  })(
                    <Select placeholder="培训类型" onFocus={this.getBaseSelectTreeType}>
                      {this.state.trainTypes.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.title}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="培训时间" {...formItemLayout}>
                  {getFieldDecorator('trainTime', {
                    rules: [
                      {
                        required: true,
                        message: '请选择培训时间',
                      },
                    ],
                  })(<DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="发起部门" {...formItemLayout}>
                  {getFieldDecorator('sponsorDepId', {
                    rules: [
                      {
                        required: true,
                        message: '请选择发起部门',
                      },
                    ],
                  })(
                    <TreeSelect
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      allowClear
                      placeholder="请选择发起部门"
                      treeData={this.state.department}
                      onChange={(id, name) => {
                        this.setState({
                          sponsorDepName: name[0],
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="培训学时" {...formItemLayout}>
                  {getFieldDecorator('trainLearnTime', {
                    rules: [
                      {
                        required: true,
                        message: '请输入培训学时',
                      },
                    ],
                  })(<InputNumber min={0} max={999} style={{width:'100%'}} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="培训地点" {...formItemLayout}>
                  {getFieldDecorator('trainLocation', {
                    rules: [
                      {
                        required: true,
                        message: '请输入培训地点',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="培训名称" {...formItemLayout}>
                  {getFieldDecorator('trainName', {
                    rules: [
                      {
                        required: true,
                        message: '请输入培训名称',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            {this.props.auth ? (
              <Row>
                <Col span={12} offset={4}>
                  <Button htmlType="submit" type="primary" style={{ marginRight: 15 }}
                    disabled={this.props.permission.indexOf('INSIDELTRAINING_EDIT-IN-TRAINING')==-1?true:false}
                    >
                    保存
                  </Button>
                  <Button onClick={this.props.closeRightBox}>取消</Button>
                </Col>
              </Row>
            ) : null}
          </Form>
        </div>
      );
    }
    componentDidMount() {
      const _ = this.props.rightData;
      getBaseData('szxm.aqgl.outtraintype').then(data =>
        this.setState({ trainTypes: data }, () => {
          this.props.form.setFieldsValue({
            trainType: _['trainTypeVo'].code + '',
          });
        })
      );
      // 获取发起部门数据
      axios.get(departmentTree).then(res => {
        this.setState({ department: res.data.data, sponsorDepName: _['sponsorDep'] }, () => {
          this.props.form.setFieldsValue({
            sponsorDepId: _['sponsorDepId'],
          });
        });
      });
      this.props.form.setFieldsValue({
        trainTime: moment(new Date(_['trainTime'])),
        trainLocation: _['trainLocation'],
        trainName: _['trainName'],
        trainLearnTime: _['trainLearnTime'],
      });
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values['id'] = this.props.rightData.id;
          values['sponsorDep'] = this.state.sponsorDepName;
          values['intExt'] = 0;
          axios.put(updateTrainDisclosure(), values, true).then(res => {
            const { data, status } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
