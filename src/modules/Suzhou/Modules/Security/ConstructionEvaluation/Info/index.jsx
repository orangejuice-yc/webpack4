import React, { Component } from 'react';
import { Row, Col, Button, Form, Select, Input, DatePicker, TreeSelect } from 'antd';
import style from './style.less';
import moment from 'moment';
import axios from '@/api/axios';
import { updateConstructEvaluation } from '@/modules/Suzhou/api/suzhou-api';
import { formLayout, formItemLayout } from '@/modules/Suzhou/components/Util/util';
import DatePickerYear from '@/modules/Suzhou/components/DatePickerYear';

const Option = Select;

export default Form.create()(
  class extends Component {
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
                <Form.Item label="专业类型" {...formItemLayout}>
                  {getFieldDecorator('professionVo', {
                    initialValue: this.props.rightData.professionVo.name,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="施工单位" {...formItemLayout}>
                  {getFieldDecorator('sgdw', {
                    initialValue: this.props.rightData.sgdw,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="中心季度检查得分" {...formItemLayout}>
                  {getFieldDecorator('zxjdScore', {
                    initialValue: this.props.rightData.zxjdScore,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="部门月度检查得分" {...formItemLayout}>
                  {getFieldDecorator('bmydScore', {
                    initialValue: this.props.rightData.bmydScore,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Form.Item label="日常安全检查得分" {...formItemLayout}>
                  {getFieldDecorator('rcjcScore', {
                    initialValue: this.props.rightData.rcjcScore,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="季度考评综合得分" {...formItemLayout}>
                  {getFieldDecorator('totalScore', {
                    initialValue: this.props.rightData.totalScore,
                  })(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row>
            {/*  */}
            <Row>
              <Col span={12}>
                <Form.Item label="年份" {...formItemLayout}>
                  {getFieldDecorator('year', {
                    rules: [{ required: true, message: '请选择年份' }],
                    initialValue: moment(new Date(this.props.rightData.year + '')),
                  })(
                    <DatePickerYear
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}
                      callBackDateValue={value => {
                        this.props.form.setFieldsValue({ year: value });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="季度" {...formItemLayout}>
                  {getFieldDecorator('season', {
                    rules: [{ required: true, message: '请选择季度' }],
                    initialValue: this.props.rightData.seasonVo.code.toString(),
                  })(
                    <Select
                      placeholder="请选择季度"
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}
                    >
                      <Option value={'0'} key={'0'}>
                        一季度
                      </Option>
                      <Option value={'1'} key={'1'}>
                        二季度
                      </Option>
                      <Option value={'2'} key={'2'}>
                        三季度
                      </Option>
                      <Option value={'3'} key={'3'}>
                        四季度
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/*  */}
            <Row>
              <Col span={12} offset={4}>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{ marginRight: 15 }}
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('CONSTRUCTIONEVALUATION_EDIT-SHIGONGKAOPING')==-1?true:false):true}
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
            projectId: this.props.rightData.projectId,
            id: this.props.rightData.id,
            sectionId: this.props.rightData.sectionId,
            year: moment(values.year).format('YYYY'),
            season: values.season,
          };
          axios.put(updateConstructEvaluation, params, true).then(res => {
            const { data } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
