import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker } from 'antd';
import { queryZgzrrInfo, addSecurityCheck } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { getsectionId } from '@/api/suzhou-api';
import {
  formLayout,
  formItemLayout,
  zipinLayout,
  getMapData,
  getBaseData,
} from '@/modules/Suzhou/components/Util/util';
import axios from '@/api/axios';
import style from './style.less';
import moment from 'moment';
import SelectSection from '../SelectSection';
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      sectionIdData: [], // 标段数据列表
      jclx: [],
      jclxCode:'',  //检查类型数据字典
      zgzrrId: [],
      sectionId: null,
      zgzrrName: '',
      sectionId:'',
      sectionIds:''
    };
    componentDidMount(){
      let bizType = this.props.bizType
      if(bizType=='SECURITY-SECURITYCHECK'){  
          this.setState({
            jclxCode : 'szxm.aqgl.nbchecktype'
          })  
      }else if(bizType=='SECURITY-SECURITYCHECKONLY'){ 
          this.setState({    
            jclxCode : 'szxm.aqgl.nbchecktypeonly'
          })  
      }
    }
    // 获取标段
    handleGetSectionIds = () => {
      axios.get(getsectionId(this.props.projectId)).then(res => {
        const { data = [] } = res.data;
        this.setState(() => ({ sectionIdData: getMapData(data) }));
        if (this.state.sectionIdData.length > 0) {
          const { id , code} = this.state.sectionIdData[0];
          this.props.form.setFieldsValue({ sectionId: id });
          this.setState({
            sectionCode: code,
          });
        }
      });
    };
    handleGetqueryZgzrrInfo = () => {
      axios
        .get(queryZgzrrInfo, {
          params: {
            sectionId: this.state.sectionId,
            projectId: this.props.projectId,
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
      return (
        <Fragment>
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={() => {
              this.setState({ visible: true });
              // this.handleGetSectionIds();
            }}
            res={'MENU_EDIT'}
          />
          <Modal
            title="新增"
            width={800}
            destroyOnClose={true}
            centered={true}
            maskClosable={false}
            mask={false}
            visible={this.state.visible}
            onOk={this.handleAddPost}
            onCancel={() => this.setState(() => ({ visible: false }))}
          >
            <div className={style.container}>
              <Form {...formLayout} onSubmit={this.handleAddPost}>
                <Row>
                  <Col span={24}>
                    <Form.Item label="选择标段" {...zipinLayout}>
                      {getFieldDecorator('sectionId', {
                      })(
                        <SelectSection
                            projectId={this.props.projectId}
                            callBack={({ sectionId,sectionIds ,sectionCode}) => {
                                this.props.form.setFieldsValue({ sectionId});
                                this.setState({sectionCode,sectionIds})
                            }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="标段号" {...formItemLayout}>
                      <Input disabled={true} value={this.state.sectionCode} title={this.state.sectionCode}/>
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
                          disabled={!this.state.sectionId}
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
                      })(<Input />)}
                    </Form.Item>
                  </Col> */}
                  {/* <Col span={12}>
                    <Form.Item label="检查编号" {...formItemLayout}>
                      {getFieldDecorator('code', {
                        rules: [
                          {
                            required: true,
                            message: '请输入检查编号',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col> */}
                  <Col span={12}>
                    <Form.Item label="检查类型" {...formItemLayout}>
                      {getFieldDecorator('jclx', {
                        rules: [
                          {
                            required: true,
                            message: '请选择检查类型',
                          },
                        ],
                      })(
                        <Select onFocus={this.getBaseSelectTreeType} placeholder="请选择">
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
                    <Form.Item label="检查标题" {...formItemLayout}>
                      {getFieldDecorator('stationPointInfo', {
                        rules: [
                          {
                            required: true,
                            message: '请输入检查标题',
                          },
                        ],
                      })(<Input />)}
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
                      })(<Input />)}
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
                      })(<DatePicker style={{ width: '100%' }} />)}
                    </Form.Item>
                  </Col>
                  {/* <Col span={12}>
                    <Form.Item label="站点相关问题" {...formItemLayout}>
                      {getFieldDecorator('stationPointInfoDetail', {
                        rules: [
                          {
                            required: true,
                            message: '请输入站点相关问题',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col> */}
                </Row>
                <Row>
                <Col>
                    <Form.Item label="主要施工内容" {...zipinLayout}>
                      {getFieldDecorator('constructionContent', {
                        rules: [
                          {
                            required: true,
                            message: '请输入主要施工内容',
                          },
                        ],
                      })(<Input.TextArea />)}
                    </Form.Item>
                  </Col>
                  </Row>
                {/* <Row>
                <Col>
                    <Form.Item label="检查内容" {...zipinLayout}>
                      {getFieldDecorator('checkContent')(<Input.TextArea />)}
                    </Form.Item>
                  </Col>
                  </Row> */}
              </Form>
            </div>
          </Modal>
        </Fragment>
      );
    }
    // 确定
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            sectionIds:this.state.sectionIds,
            sectionCode:this.state.sectionCode,
            projectId: this.props.projectId,
            checkStatus:this.props.checkStatus,
            jcsx: moment(values.jcsx).format('YYYY-MM-DD'),
            zgzrrName: this.state.zgzrrName,
          };
          axios.post(addSecurityCheck(), params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
  }
);
