import React, { Component } from 'react';
import { Row, Col, Button, Form, Select, Input, DatePicker, InputNumber} from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateTrainDisclosure } from '@/modules/Suzhou/api/suzhou-api';
import { formLayout, formItemLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
const Option = Select;

export default Form.create()(
  class extends Component {
    state = {
      trainTypes: [], // 培训类型
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      // console.log(this.props.permission.indexOf('EXTERNALTRAINING_EDIT-EX-TRAINING')==-1);
      // console.log(((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag)));
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
                <Form.Item label="培训单位" {...formItemLayout}>
                  {getFieldDecorator('trainUnitName')(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="培训类型" {...formItemLayout}>
                  {getFieldDecorator('trainType')(
                    <Select placeholder="培训类型" disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}>
                      {this.state.trainTypes.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.title}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="培训地点" {...formItemLayout}>
                  {getFieldDecorator('trainLocation')(<Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="培训名称" {...formItemLayout}>
                  {getFieldDecorator('trainName')(<Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="培训时间" {...formItemLayout}>
                  {getFieldDecorator('trainTime')(
                    <DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>
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
                  })(<InputNumber max={999} min={0} style={{width:'100%'}} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} offset={4}>
                <Button htmlType="submit" type="primary" style={{ marginRight: 15 }} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('EXTERNALTRAINING_EDIT-EX-TRAINING')==-1?true:false):true}>
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
      getBaseData('szxm.aqgl.outtraintype').then(data =>
        this.setState({ trainTypes: data }, () => {
          this.props.form.setFieldsValue({
            trainType: _['trainTypeVo'].code + '',
          });
        })
      );
      this.props.form.setFieldsValue({
        sectionName: _['sectionName'],
        sectionCode: _['sectionCode'],
        trainTime: moment(new Date(_['trainTime'])),
        trainLearnTime: _['trainLearnTime'],
        trainLocation: _['trainLocation'],
        trainName: _['trainName'],
        trainUnitName: _['trainUnitName'],
      });
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values['id'] = this.props.rightData.id;
          values['intExt'] = 1;
          axios.put(updateTrainDisclosure(), values, true).then(res => {
            const { data, status } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
