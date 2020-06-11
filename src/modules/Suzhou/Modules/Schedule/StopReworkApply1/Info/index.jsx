import React, { Component } from 'react';
import style from './style.less';
import { Button, Form, Row, Col, Input, TreeSelect,notification} from 'antd';
// import axios from '@/api/axios';
import axios from '../../../../../../api/axios';
import { updateStopRework ,queryStopRework} from '../../../../api/suzhou-api';

const { Item } = Form;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
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
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
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
        axios.put(updateStopRework(), { id, applyNum, contract, content, remark,...values }).then(res => {
          // this.props.closeRightBox()
          if(res.data.status == 200){
            notification.success(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '操作提醒',
                description: '操作成功！'
              }
            )
            this.props.handleModelOk({
              ...res.data.data
            });
          }
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
                <Col span={12} key="projectDictVo">
                  <Item label="项目名称" {...formItemLayout}>
                    {getFieldDecorator('projectDictVo', {
                      rules: [
                        {
                          required: true,
                          message: '请选择项目名称',
                        },
                      ],
                      initialValue: (!this.state.info.projectDictVo || !this.state.info.projectDictVo.name)?'':this.state.info.projectDictVo.name,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key="sectionName">
                  <Item {...formItemLayout} label="标段名称">
                    {getFieldDecorator('sectionName', {
                      initialValue:this.state.info.sectionName,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key="company">
                  <Item {...formItemLayout} label="单位名称">
                    {getFieldDecorator('company', {
                      initialValue:this.state.info.company,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key='stopReworkDate'>
                  <Item label='申请复工日期' {...formItemLayout}>
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
              </Row>
              <Row key={7}>
                <Col span={24} key='extend1'>
                  <Item label='领导小组' {...formItemLayout1}>
                    {getFieldDecorator("extend1",{
                      initialValue:this.state.info.extend1,
                      rules: [
                        {
                          required: true,
                          message: '请输入领导小组',
                        },
                      ]
                    })(
                      <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT' && (this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true} />
                    )}
                  </Item>
                </Col>
                <Col span={24} key="extend2">
                  <Item label="人员管控措施落实情况" {...formItemLayout1}>
                    {getFieldDecorator('extend2', {
                      initialValue:this.state.info.extend2,
                      rules: [
                        {
                          required: true,
                          message: '请输入人员管控措施落实情况',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT' && (this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={24} key="extend3">
                  <Item label="现场防疫管理情况" {...formItemLayout1}>
                    {getFieldDecorator('extend3', {
                      initialValue:this.state.info.extend3,
                      rules: [
                        {
                          required: true,
                          message: '请输入现场防疫管理情况',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT' && (this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={24} key="extend4">
                  <Item label="防疫物资准备情况" {...formItemLayout1}>
                    {getFieldDecorator('extend4', {
                      initialValue:this.state.info.extend4,
                      rules: [
                        {
                          required: true,
                          message: '请输入防疫物资准备情况',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT' && (this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={24} key="extend5">
                  <Item label="现场安全管理" {...formItemLayout1}>
                    {getFieldDecorator('extend5', {
                      initialValue: this.state.info.extend5,
                      rules: [
                        {
                          required: true,
                          message: '请输入现场安全管理',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT' &&(this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
                <Col span={24} key="extend6">
                  <Item label="教育交底工作" {...formItemLayout1}>
                    {getFieldDecorator('extend6', {
                      initialValue: this.state.info.extend6,
                      rules: [
                        {
                          required: true,
                          message: '教育交底工作',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT'&&(this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
              </Row>
              <Row key={5}>
                <Col span={24} key="content">
                  <Item label="申请内容说明" {...formItemLayout1}>
                    {getFieldDecorator('content', {
                      initialValue: this.state.info.content,
                      rules: [
                        {
                          required: true,
                          message: '请输入申请内容说明',
                        },
                      ],
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT'&&(this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?false:true}/>)}
                  </Item>
                </Col>
              </Row>
              <Row key={6}>
                <Col span={24} key="remark">
                  <Item label="备注" {...formItemLayout1}>
                    {getFieldDecorator('remark', {
                      initialValue: this.state.info.remark,
                    })(<TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT'&&(this.props.rightData.creator == this.props.loginUser.id)) || ( this.props.taskFlag))?false:true}/>)}
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
                  disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT'&&(this.props.rightData.creator == this.props.loginUser.id)) || (this.props.taskFlag))?(this.props.permission.indexOf('STOPREVORKAPPLY1_EDIT-STOPRETURNAPPLY')==-1?true:false):true}
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
