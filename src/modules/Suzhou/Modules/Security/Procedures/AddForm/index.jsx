import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect,DatePicker } from 'antd';
import { addSubcontrApproval } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import {
  formLayout,
  formItemLayout,
  getMapData,
  getBaseData,
} from '@/modules/Suzhou/components/Util/util';
import { getsectionId } from '@/api/suzhou-api';
import axios from '@/api/axios';
import style from './style.less';
import SelectSection from '@/modules/Suzhou/components/SelectSection';
import * as dataUtil from "@/utils/dataUtil";
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      sectionIdData: [], // 标段数据列表
      subcontrType: [], // 分包类型
      sectionId:''
    };
    // 获取标段
    handleGetSectionIds = () => {
      // axios.get(getsectionId(this.props.projectId)).then(res => {
      //   const { data = [] } = res.data;
      //   if (data) {
      //     this.setState(() => ({ sectionIdData: getMapData(data) }));
      //     if (this.state.sectionIdData.length > 0) {
      //       const { id , code} = this.state.sectionIdData[0];
      //       this.props.form.setFieldsValue({ sectionId: id });
      //       this.setState({
      //         sectionCode: code,
      //       });
      //     }
      //   }
      // });
    };
    // 获取分包类型
    getBaseSelectTreeType = () => {
      getBaseData('szxm.aqgl.subcontrtype').then(data => this.setState({ subcontrType: data }));
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
              this.handleGetSectionIds();
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
              <Form {...formLayout}>
                <Row>
                  <Col span={12}>
                    <Form.Item label="选择标段" {...formItemLayout}>
                      {getFieldDecorator('sectionId', {
                        rules: [
                          {
                            required: true,
                            message: '请选择标段',
                          },
                        ],
                      })(
                          <SelectSection
                              projectId={this.props.projectId}
                              callBack={({ sectionId ,sectionCode}) => {
                                  this.props.form.setFieldsValue({ sectionId});
                                  this.setState({sectionCode})
                              }}
                          />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="标段号" {...formItemLayout}>
                      <Input disabled={true} value={this.state.sectionCode} />
                    </Form.Item>
                  </Col>
                  
                </Row>
                <Row>
                <Col span={12}>
                    <Form.Item label="分包类型" {...formItemLayout}>
                      {getFieldDecorator('subcontrType', {
                        rules: [
                          {
                            required: true,
                            message: '请选择分包类型',
                          },
                        ],
                      })(
                        <Select placeholder="分包类型" onFocus={this.getBaseSelectTreeType}>
                          {this.state.subcontrType.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.title}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="分包单位名称" {...formItemLayout}>
                      {getFieldDecorator('subcontrName', {
                        rules: [
                          {
                            required: true,
                            message: '请输入分包单位',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
            <Col span={12} key='signDate'>
              <Form.Item label='签订日期' {...formItemLayout}>
                {getFieldDecorator("signDate",{
                  rules: [
                    {
                      required: true,
                      message: '请选择签订日期',
                    },
                  ]
                })(
                  <DatePicker format='YYYY-MM-DD' style={{width:'100%'}}/>
                )}
              </Form.Item>
            </Col>
          </Row> 
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
          const params = { ...values, projectId: this.props.projectId,
            signDate:dataUtil.Dates().formatTimeString(values.signDate).substr(0,10) };
          axios.post(addSubcontrApproval(), params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
  }
);
