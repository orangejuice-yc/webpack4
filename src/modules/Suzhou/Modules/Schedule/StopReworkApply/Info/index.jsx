import React, { Component } from 'react';
import style from './style.less';
import { Button, Form, Row, Col, Input } from 'antd';
import axios from '@/api/axios';
import { updateStopRework ,queryStopRework} from '../../../../api/suzhou-api';

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
class StopReworkApplyInfo1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info:{}
    };
  }
  getData = (id) => {
    // 请求获取info数据
    axios.get(queryStopRework(id)).then(res => {
        this.setState({
            info: res.data.data,
        });
    });
};
  componentDidMount(){
    this.props.rightData ? this.getData(this.props.rightData.id) : null;
  }
  handleOk = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { applyNum, contract, content, remark } = values;
        const { id } = this.props.rightData;
        axios.put(updateStopRework(), { id, applyNum, contract, content, remark },true).then(res => {
          // this.props.closeRightBox()
          this.props.handleModelOk({
            ...this.props.rightData,
            applyNum,
            contract,
            content,
            remark,
          });
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    // const { treeData } = this.state
    // const {
    //   // applyNum,
    //   content,
    //   contract,
    //   sgdw,
    //   jldw,
    //   remark,
    //   sectionName,
    //   sectionCode,
    //   creater,creatTime
    // } = this.state.info;
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
                      initialValue: this.state.info.sectionName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key="sectionCode">
                  <Item {...formItemLayout} label="标段号">
                    {getFieldDecorator('sectionCode', {
                      initialValue:this.state.info.sectionCode,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                <Col span={12} key="applyNum">
                  <Item {...formItemLayout} label="申请编号">
                    {getFieldDecorator('applyNum', {
                      initialValue: this.state.info.applyNum,
                      rules: [
                        {
                          required: true,
                          message: '请输入申请编号',
                        },
                        {
                          pattern: /^[\_a-zA-Z0-9\-]+$/,
                          message: '可输入字符"0-9 a-z A-Z - _"',
                        },
                      ],
                    })(<Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>)}
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
                        {
                          pattern: /^[\_a-zA-Z0-9\-]+$/,
                          message: '可输入字符"0-9 a-z A-Z - _"',
                        },
                      ],
                      initialValue: this.state.info.contract,
                    })(<Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={12} key="sgdw">
                  <Item {...formItemLayout} label="施工单位">
                    {getFieldDecorator('sgdw', {
                      initialValue: this.state.info.sgdw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                {/* <Col span={12} key="jldw">
                  <Item {...formItemLayout} label="监理单位">
                    {getFieldDecorator('jldw', {
                      initialValue: this.state.info.jldw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col> */}
             
                <Col span={12} key="creater">
                  <Item {...formItemLayout} label="创建人">
                    {getFieldDecorator('creater', {
                      initialValue: this.state.info.creater,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key="creatTime">
                  <Item {...formItemLayout} label="创建时间">
                    {getFieldDecorator('creatTime', {
                      initialValue: this.state.info.creatTime,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              
              <Col span={12} key='stopReworkDate'>
                  <Item label='停复工日期' {...formItemLayout}>
                    {getFieldDecorator("stopReworkDate",{
                      initialValue:this.state.info.stopReworkDate,
                      rules: [
                        {
                          required: true,
                          message: '请选择时间',
                        },
                      ]
                    })(
                      <Input disabled/>
                    )}
                  </Item>
                </Col>
                </Row>
              <Row key={5}>
                <Col span={24} key="content">
                  <Item label="申请内容说明" {...formItemLayout1}>
                    {getFieldDecorator('content', {
                      rules: [
                        {
                          required: true,
                          message: '请输入申请内容说明',
                        },
                      ],
                      initialValue: this.state.info.content,
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
              </Row>
              <Row key={6}>
                <Col span={24} key="remark">
                  <Item label="备注" {...formItemLayout1}>
                    {getFieldDecorator('remark', {
                      initialValue: this.state.info.remark,
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true}/>)}
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
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('STOPREVORKAPPLY_EDIT-STOPRETURNAPPLY')==-1?true:false):true}
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

const StopReworkApplyInfo = Form.create({ name: 'StopReworkApplyInfo' })(StopReworkApplyInfo1);
export default StopReworkApplyInfo;
