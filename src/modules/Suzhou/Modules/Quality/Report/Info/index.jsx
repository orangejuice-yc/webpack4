import React, { Component } from 'react';
import { Row, Col, Button, Form, Input, DatePicker,Radio} from 'antd';
import moment from 'moment';

import style from './style.less';
import axios from '@/api/axios';
import { updateQuaInsp } from '@/modules/Suzhou/api/suzhou-api';
const { TextArea } = Input;

export default Form.create()(
  class extends Component {
    state = {
      currentTime: null,
      ysTypeShow:false,
    };
    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <div className={style.container}>
          <h3 className={style.h3}>基本信息</h3>
          <Form onSubmit={this.handleSubmit} {...formLayout}>
            <Row>
              <Col span={12}>
                <Form.Item label="选择标段" {...formItemLayout}>
                  {getFieldDecorator('sectionName')(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="工程名称" {...formItemLayout}>
                  {getFieldDecorator('engineName')(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="验收分类" {...formItemLayout}>
                  {getFieldDecorator('checkType')(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={12} style={{display:this.state.ysTypeShow?'block':'none'}}>
                <Form.Item label=" " {...formItemLayout}>
                  {getFieldDecorator('ysType')(
                    <Radio.Group>
                        <Radio key={'0'} value={'0'}>预验收</Radio>
                        <Radio key={'1'} value={'1'}>验收</Radio>
                    </Radio.Group>,
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="施工单位" {...formItemLayout}>
                  {getFieldDecorator('sgdw')(<Input disabled />)}
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item label="监理单位" {...formItemLayout}>
                  {getFieldDecorator('jldw')(<Input disabled />)}
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="验收时间" {...formItemLayout}>
                  {getFieldDecorator('checkTime')(
                    <DatePicker
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}
                      style={{ width: '100%' }}
                      disabledDate={this.disabledDate}
                    />
                  )}
                </Form.Item>
              </Col>
            {/*{this.props.rightData.checkType === '5' ? (
              <Row>
                <Col span={12}>
                  <Form.Item label="所属部位" {...formItemLayout}>
                    {getFieldDecorator('checkPos')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="站点" {...formItemLayout}>
                    {getFieldDecorator('belongSta')(<Input />)}
                  </Form.Item>
                </Col>
              </Row>
            ) : null} */}

              <Col span={24}>
                <Form.Item label="自评" {...zipinLayout}>
                  {getFieldDecorator('selfOpinion')(
                    <TextArea disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} offset={4}>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{ marginRight: 15 }}
                  disabled={(((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true)||this.props.permission.indexOf('REPORT_EDIT-QUALITY-REPORT')==-1}
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
      const {
        sectionName,
        engineName,
        checkTypeVo,
        sgdw,
        jldw,
        checkTime,
        checkPos,
        belongSta,
        selfOpinion,
        ysTypeVo,
      } = this.props.rightData;
      checkTypeVo.code === '1'?this.setState({ysTypeShow:true}):this.setState({ysTypeShow:false}),
      this.props.form.setFieldsValue({
        sectionName,
        engineName,
        checkType: checkTypeVo.code === '5' ? '检验批' : checkTypeVo.name,
        sgdw,
        jldw,
        checkTime: moment(checkTime),
        checkPos,
        belongSta,
        selfOpinion,
        ysType:checkTypeVo.code === '1'?ysTypeVo.code:'',
       
      });
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          values['checkTime'] = moment(values['checkTime']).valueOf();
          values['id'] = this.props.rightData.id;
          values['quaSysId'] = this.props.rightData.quaSysId;
          axios.put(updateQuaInsp(), values, true).then(res => {
            const { data, status } = res.data;
            if (status === 200) {
              this.props.updateInfoTabel(data);
              // this.props.closeRightBox();
            }
          });
        }
      });
    };
    // 禁止开始时间
    disabledDate = current => current && current <= moment().startOf('day');
  }
);
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
const zipinLayout = {
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
