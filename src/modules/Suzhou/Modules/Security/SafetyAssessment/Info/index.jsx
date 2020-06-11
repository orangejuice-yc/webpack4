import React, { Component } from 'react';
import { Row, Col, Button, TreeSelect, Form, Select, Input, DatePicker } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateTrainDisclosure } from '@/modules/Suzhou/api/suzhou-api';
import { formLayout, formItemLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
import { departmentTree } from '@/modules/Suzhou/api/suzhou-api';
const Option = Select.Option;

export default Form.create()(
  class extends Component {
    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <div className={style.container}>
          <h3 className={style.h3}>基本信息</h3>
          <Form {...formLayout}>
            <Row>
              <Col span={12}>
                <Form.Item label="部门" {...formItemLayout}>
                  {getFieldDecorator('1', {
                    initialValue: this.props.rightData.orgName,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="被考核姓名" {...formItemLayout}>
                  {getFieldDecorator('2', {
                    initialValue: this.props.rightData.bkhrXm,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="职务" {...formItemLayout}>
                  {getFieldDecorator('3', {
                    initialValue: this.props.rightData.bkhrZw,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="考核时间" {...formItemLayout}>
                  {getFieldDecorator('4', {
                    initialValue: this.props.rightData.khsj,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="扣减分数" {...formItemLayout}>
                  {getFieldDecorator('5', {
                    initialValue: this.props.rightData.reduTotal,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="实得分数" {...formItemLayout}>
                  {getFieldDecorator('6', {
                    initialValue: this.props.rightData.actTotal,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="评定" {...formItemLayout}>
                  {getFieldDecorator('7', {
                    initialValue: this.props.rightData.isPassVo.name,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="考核人" {...formItemLayout}>
                  {getFieldDecorator('8', {
                    initialValue: this.props.rightData.assessmenter,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            {/* {this.props.auth ? (
              <Row>
                <Col span={12} offset={4}>
                  <Button htmlType="submit" type="primary" style={{ marginRight: 15 }}
                  disabled={this.props.permission.indexOf('SAFETYASSESSMENT_EDIT-SAFEASSESSMENT')==-1?true:false}>
                    保存
                  </Button>
                  <Button onClick={this.props.closeRightBox}>取消</Button>
                </Col>
              </Row>
            ) : null} */}
          </Form>
        </div>
      );
    }
    // componentDidMount() {
    //   const _ = this.props.rightData;
    //   getBaseData('szxm.aqgl.outtraintype').then(data =>
    //     this.setState({ trainTypes: data }, () => {
    //       this.props.form.setFieldsValue({
    //         trainType: _['trainTypeVo'].code + '',
    //       });
    //     })
    //   );
    //   // 获取发起部门数据
    //   axios.get(departmentTree).then(res => {
    //     this.setState({ department: res.data.data, sponsorDepName: _['sponsorDep'] }, () => {
    //       this.props.form.setFieldsValue({
    //         sponsorDepId: _['sponsorDepId'],
    //       });
    //     });
    //   });
    //   this.props.form.setFieldsValue({
    //     trainTime: moment(new Date(_['trainTime'])),
    //     trainLocation: _['trainLocation'],
    //     trainName: _['trainName'],
    //     trainLearnTime: _['trainLearnTime'],
    //   });
    // }
    // handleSubmit = e => {
    //   e.preventDefault();
    //   this.props.form.validateFields((err, values) => {
    //     if (!err) {
    //       values['id'] = this.props.rightData.id;
    //       values['sponsorDep'] = this.state.sponsorDepName;
    //       values['intExt'] = 0;
    //       axios.put(updateTrainDisclosure(), values, true).then(res => {
    //         const { data, status } = res.data;
    //         this.props.updatetableCallBack(data);
    //       });
    //     }
    //   });
    // };
  }
);
