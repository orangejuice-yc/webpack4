import React, { Component } from 'react';
import style from './style.less';
import { Button, Form, Row, Col, Input ,DatePicker } from 'antd';
import axios from '@/api/axios';
import * as dataUtil from "@/utils/dataUtil";
import moment from 'moment';
import { updateWorkApply ,queryWorkApply} from '../../../../api/suzhou-api';

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
class WorkApplyInfo1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      info:{}
    };
  }
  getData = (id) => {
    // 请求获取info数据
    axios.get(queryWorkApply(id)).then(res => {
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
        const {applyCode} = values
        const applyWorkDay = dataUtil.Dates().formatTimeString(values.applyWorkDay).substr(0,10)
        const { id,sectionId,projectId} = this.props.rightData;
        axios.put(updateWorkApply, { id,sectionId,projectId,applyCode,applyWorkDay},true).then(res => {
          this.props.handleModelOk({
            ...this.props.rightData,
            applyCode,
            applyWorkDay
          });
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.handleOk}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key="projectName">
                  <Item label="项目名称" {...formItemLayout}>
                    {getFieldDecorator('projectName', {
                      rules: [
                        {
                          required: true,
                          message: '请选择标段名称',
                        },
                      ],
                      initialValue: this.state.info.projectName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key="sectionCodeName">
                  <Item {...formItemLayout} label="标段名称">
                    {getFieldDecorator('sectionCodeName', {
                      initialValue:this.state.info.sectionCodeName,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                <Col span={12} key="applyCode">
                  <Item {...formItemLayout} label="编号">
                    {getFieldDecorator('applyCode', {
                      initialValue: this.state.info.applyCode,
                      rules: [
                        {
                          required: true,
                          message: '请输入编号',
                        },
                        {
                          pattern: /^[\_a-zA-Z0-9\-]+$/,
                          message: '可输入字符"0-9 a-z A-Z - _"',
                        },
                      ],
                    })(<Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={12} key="contract">
                  <Item {...formItemLayout} label="合同号">
                    {getFieldDecorator('contract', {
                      rules: [
                        // {
                        //   required: false,
                        //   message: '请输入合同号',
                        // },
                        // {
                        //   pattern: /^[\_a-zA-Z0-9\-]+$/,
                        //   message: '可输入字符"0-9 a-z A-Z - _"',
                        // },
                      ],
                      initialValue: this.state.info.contract,
                    })(<Input disabled={true}/>)}
                  </Item>
                </Col>
              </Row>
              {/* <Row key={4}>
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
              </Row> */}
              <Row key={3}>
                <Col span={12} key="sgdw">
                  <Item {...formItemLayout} label="施工单位">
                    {getFieldDecorator('sgdw', {
                      initialValue: this.state.info.sgdw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
              <Col span={12} key='applyWorkDay'>
                <Item label='申请开工日期' {...formItemLayout}>
                  {getFieldDecorator("applyWorkDay",{
                    rules: [
                      {
                        required: true,
                        message: '请选择时间',
                      },
                    ],
                    initialValue: moment(this.state.info.applyWorkDay),
                  })(
                    <DatePicker  style={{width:'100%'}}/>
                  )}
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
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?
                  (this.props.permission.indexOf('WORKAPPLY_EDIT')==-1?true:false):true}
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

const WorkApplyInfo = Form.create({ name: 'WorkApplyInfo' })(WorkApplyInfo1);
export default WorkApplyInfo;
