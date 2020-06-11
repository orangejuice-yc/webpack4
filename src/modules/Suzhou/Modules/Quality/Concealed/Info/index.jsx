import React, { Component } from 'react';
import { Row, Col, Button, Select, Form, Input, DatePicker } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateQuaConce, station } from '@/modules/Suzhou/api/suzhou-api';
const { TextArea } = Input;
const { Option } = Select;

export default Form.create()(
  class extends Component {
    state = {
      currentTime: null,
      list: [],
    };
    getBelongStaList = () => {
      axios.get(station(this.props.projectId)).then(res => {
        const { data } = res.data;
        const belong = this.props.rightData.belongStaVoList.map(item => item.name);
        this.setState({
          list: data.filter(item => !belong.includes(item)),
        });
      });
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
                <Form.Item label="施工单位" {...formItemLayout}>
                  {getFieldDecorator('sgdw')(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              {/* <Col span={12}>
                <Form.Item label="监理单位" {...formItemLayout}>
                  {getFieldDecorator('jldw')(<Input disabled />)}
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="隐蔽工程名称" {...formItemLayout}>
                  {getFieldDecorator('engineName')(
                    <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="验收时间" {...formItemLayout}>
                  {getFieldDecorator('checkTime')(
                    <DatePicker
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true}
                      style={{ width: '100%' }}
                      disabledDate={this.disabledDate}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>             
              <Col span={12}>
                <Form.Item label="站点" {...formItemLayout}>
                  {getFieldDecorator('belongSta')(
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="请选择站点"
                      onFocus={this.getBelongStaList}
                      disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}
                    >
                      {this.state.list.map(item => {
                        return (
                          <Option key={item.id} value={item.code}>
                            {item.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Item label="自评" {...zipinLayout}>
                  {getFieldDecorator('selfOpinion')(
                    <TextArea disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true} />
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
                  disabled={(((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true)||this.props.permission.indexOf('CONCEALED_EDIT-CONCEALED')==-1}
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
        sectionId,
        sysId = '',
        checkType,
        sgdw,
        jldw,
        checkTime,
        checkPos,
        selfOpinion,
        engineName,
        belongStaVoList,
      } = this.props.rightData;
      this.props.form.setFieldsValue({
        sectionName,
        sectionId,
        sysId,
        checkType,
        sgdw,
        jldw,
        checkTime: moment(checkTime),
        checkPos,
        belongSta: belongStaVoList.map(item => item.name),
        selfOpinion,
        engineName,
      });
    }
    handleSubmit = e => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            id: this.props.rightData.id,
            sectionId:this.props.rightData.sectionId,
            checkTime: moment(values['checkTime']).valueOf(),
            belongSta: Array.isArray(values['belongSta'])
              ? values['belongSta'].join(',')
              : values['belongSta'],
            selfOpinion: values['selfOpinion'],
            engineName: values['engineName'],
          };
          axios.put(updateQuaConce(), params, true).then(res => {
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
