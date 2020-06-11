import React, { Component } from 'react';
import { Row, Col, Button, Form, Select, Input, DatePicker, TreeSelect } from 'antd';
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import { updateTrainDisclosure } from '@/modules/Suzhou/api/suzhou-api';
import { queryZgzrrInfo, updateSecurityCheck } from '@/modules/Suzhou/api/suzhou-api';

import {
  formLayout,
  formItemLayout,
  zipinLayout,
  getBaseData,
} from '@/modules/Suzhou/components/Util/util';
const {Option} = Select;

export default Form.create()(
  class extends Component {
    state = {
      jclx: [],
      jclxCode:'',  //检查类型数据字典
      zgzrrId: [],
      sectionId: null,
      zgzrrName: '',
      editPermission:'',
      sectionNames: '',
      sectionCode: '',
      formFlag:false,
    };
    handleGetqueryZgzrrInfo = () => {
      axios
        .get(queryZgzrrInfo, {
          params: {
            sectionId: this.state.sectionId,
            projectId: this.props.rightData.projectId,
          },
        })
        .then(res => {
          let { data } = res.data;
          data = data.map(item => {
            return {
              id: item.user.id,
              name: item.user.name,
              position: item.roles.map(item => item.name).join('/'),
            };
          });         
          this.setState({
            zgzrrId: data,
          });
        });
    };
    getBaseSelectTreeType = () => {
      getBaseData(this.state.jclxCode).then(data => this.setState({ jclx: data }));
    };
    render() {
      const { getFieldDecorator } = this.props.form;
      const {editPermission} = this.state;
      // console.log(this.state.formFlag);
      // console.log(this.state.formFlag);
      // console.log(this.props.permission.indexOf(editPermission)==-1)
      return (
        <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} onSubmit={this.handleSubmit} className={style.mainScorll}>
            <Row>
              <Col span={12}>
                <Form.Item label="标段名称" {...formItemLayout}>
                  {getFieldDecorator('sectionNames')(<Input disabled={true} title={this.state.sectionNames}/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  {getFieldDecorator('sectionCode')(<Input disabled={true} title={this.state.sectionCode}/>)}
                </Form.Item>
              </Col>
            {/* <Row>
              <Col span={12}>
                <Form.Item label="选择整改责任人" {...formItemLayout}>
                  {getFieldDecorator('zgzrrId', {
                    rules: [
                      {
                        required: true,
                        message: '请选择整改责任人',
                      },
                    ],
                  })(
                    <Select
                      disabled={
                        !this.state.sectionId || this.props.rightData.statusVo.code !== 'INIT'
                      }
                      onFocus={this.handleGetqueryZgzrrInfo}
                      onChange={id => {
                        const item = this.state.zgzrrId.filter(item => item.id === id);
                        this.setState({
                          zgzrrName: item[0].name,
                        });
                        this.props.form.setFieldsValue({
                          zgzrrPosition: item[0].position,
                        });
                      }}
                    >
                      {this.state.zgzrrId.map(item => (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="责任人身份" {...formItemLayout}>
                  {getFieldDecorator('zgzrrPosition')(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row> */}
              {/* <Col span={12}>
                <Form.Item label="工程名称" {...formItemLayout}>
                  {getFieldDecorator('gcmc', {
                    rules: [
                      {
                        required: true,
                        message: '工程名称',
                      },
                    ],
                  })(<Input disabled={this.props.rightData.statusVo.code !== 'INIT'} />)}
                </Form.Item>
              </Col> */}
              <Col span={12}>
                <Form.Item label="检查类型" {...formItemLayout}>
                  {getFieldDecorator('jclx', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检查类型',
                      },
                    ],
                  })(
                    <Select
                      onFocus={this.getBaseSelectTreeType}
                      disabled={this.state.formFlag}
                      placeholder="请选择"
                    >
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
                <Form.Item label="检查编号" {...formItemLayout}>
                  {getFieldDecorator('code', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检查编号',
                      },
                    ],
                  })(<Input 
                  disabled={this.state.formFlag} 
                  />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                    <Form.Item label="检查标题" {...formItemLayout}>
                      {getFieldDecorator('stationPointInfo', {
                        rules: [
                          {
                            required: true,
                            message: '请输入检查标题',
                          },
                        ],
                      })(<Input disabled={this.state.formFlag} />)}
                    </Form.Item>
                  </Col>
                <Col span={12}>
                    <Form.Item label="检查地点" {...formItemLayout}>
                      {getFieldDecorator('checkLocation', {
                        rules: [
                          {
                            required: true,
                            message: '请输入检查地点',
                          },
                        ],
                      })(<Input disabled={this.state.formFlag} />)}
                    </Form.Item>
                  </Col> 
             <Col span={12}>
                <Form.Item label="检查时间" {...formItemLayout}>
                  {getFieldDecorator('jcsx', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检查时间',
                      },
                    ],
                  })(
                    <DatePicker
                      disabled={this.state.formFlag}
                      style={{ width: '100%' }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                    <Form.Item label="受检单位" {...formItemLayout}>
                      {getFieldDecorator('sjdw', {
                        
                      })(<Input disabled/>)}
                    </Form.Item>
                  </Col>
              <Col span={24}>
                    <Form.Item label="主要施工内容" {...zipinLayout}>
                      {getFieldDecorator('constructionContent', {
                        rules: [
                          {
                            required: true,
                            message: '请输入主要施工内容',
                          },
                        ],
                      })(<Input.TextArea disabled={this.state.formFlag} />)}
                    </Form.Item>
                  </Col>    
              </Row>
            {/* <Row>
              <Col>
                <Form.Item label="检查内容" {...zipinLayout}>
                  {getFieldDecorator('checkContent')(
                    <Input.TextArea disabled={this.state.formFlag} />
                  )}
                </Form.Item>
              </Col>
            </Row> */}
            <Row>
              <Col span={12} offset={4}>
                <Button
                  htmlType="submit"
                  type="primary"
                  style={{ marginRight: 15 }}
                  disabled={this.state.formFlag?true:(this.props.permission.indexOf(editPermission)==-1 ?true:false)}
                >
                  保存
                </Button>
                <Button onClick={this.props.closeRightBox}>取消</Button>
              </Col>
            </Row>
          </Form>
        </div>
        </div>
      );
    }
    componentDidMount() {
      if(this.props.checkStatus == '0'){//个人检查
        this.setState({formFlag:false})
      }else if(this.props.checkStatus == '1'){//组织检查
        this.props.rightData.statusVo.code == 'INIT' ||( this.props.taskFlag)?(this.setState({formFlag:false})):(this.setState({formFlag:true}))
      }
      const _ = this.props.rightData;
      if(this.props.bizType=='SECURITY-SECURITYCHECK'){
        this.setState({
          editPermission:'SECURITYCHECK_EDIT-ORG-CHECK',
          jclxCode : 'szxm.aqgl.nbchecktype'      
        },()=>{
          getBaseData(this.state.jclxCode).then(data => {
            this.setState({ jclx: data }, () => {
              this.props.form.setFieldsValue({
                jclx: _['jclxVo'].code,
              });
            });
          });
        })       
      }else if(this.props.bizType=='SECURITY-SECURITYCHECKONLY'){
        this.setState({
          editPermission:'SECURITYCHECKONLY_EDIT-PERSON-CHECK',
          jclxCode : 'szxm.aqgl.nbchecktypeonly'
        },()=>{
          getBaseData(this.state.jclxCode).then(data => {
            this.setState({ jclx: data }, () => {
              this.props.form.setFieldsValue({
                jclx: _['jclxVo'].code,
              });
            });
          });
        })
      }
      axios
        .get(queryZgzrrInfo, {
          params: {
            sectionId: this.state.sectionId || _['sectionId'],
            projectId: this.props.rightData.projectId,
          },
        })
        .then(res => {
          let { data } = res.data;
          data = data.map(item => {
            return {
              id: item.user.id,
              name: item.user.name,
              position: item.roles.map(item => item.name).join('/'),
            };
          });
          this.setState(
            {
              zgzrrId: data,
              sectionId: _['sectionId'],
            },
            () => {
              this.props.form.setFieldsValue({
                zgzrrId: _['zgzrrId'],
              });
            }
          );
        });
      this.props.form.setFieldsValue({
        sectionNames: _['sectionNames'],
        sectionCode: _['sectionCode'],
        checkLocation:_['checkLocation'],
        constructionContent:_['constructionContent'],
        stationPointInfo:_['stationPointInfo'],
        stationPointInfoDetail:_['stationPointInfoDetail'],
        jcsx: moment(new Date(_['jcsx'])),
        // jclx: _['jclxVo'].name ,
        sjdw: _['sjdw'],
        zgzrrPosition: _['zgzrrPosition'],
        // gcmc: _['gcmc'],
        checkContent: _['checkContent'],
        code: _['code'],
        creater: _['creater'],
      });
      this.setState({
        zgzrrName: _['zgzrrName'],
        sectionNames: _['sectionNames'],
        sectionCode: _['sectionCode'],
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
            zgzrrName: this.state.zgzrrName,
            id: this.props.rightData.id,
          };
          // console.log(params);
          axios.put(updateSecurityCheck(), params, true).then(res => {
            const { data } = res.data;
            this.props.updatetableCallBack(data);
          });
        }
      });
    };
  }
);
