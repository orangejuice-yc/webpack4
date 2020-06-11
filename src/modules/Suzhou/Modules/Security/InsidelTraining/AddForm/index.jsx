import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker,InputNumber } from 'antd';
import { addTrainDisclosure, departmentTree } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { formLayout, formItemLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
import axios from '@/api/axios';
import style from './style.less';
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      trainTypes: [],
      // department: [],
    };
    // 确定
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = { ...values, intExt: 0 };
          axios.post(addTrainDisclosure(), params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
    // 获取培训类型
    getBaseSelectTreeType = () => {
      getBaseData('szxm.aqgl.intraintype').then(data => this.setState({ trainTypes: data }));
    };
    // 获取发起部门数据
    // getDepartmentTree = () => {
    //   axios.get(departmentTree).then(res => {
    //     this.setState({ department: res.data.data });
    //   });
    // };
    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Fragment>
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={() => this.setState({ visible: true })}
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
                  <Col span={12}>
                    <Form.Item label="培训类型" {...formItemLayout}>
                      {getFieldDecorator('trainType', {
                        rules: [
                          {
                            required: true,
                            message: '请选择培训类型',
                          },
                        ],
                      })(
                        <Select placeholder="培训类型" onFocus={this.getBaseSelectTreeType}>
                          {this.state.trainTypes.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.title}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="培训时间" {...formItemLayout}>
                      {getFieldDecorator('trainTime', {
                        rules: [
                          {
                            required: true,
                            message: '请选择培训时间',
                          },
                        ],
                      })(<DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  {/* <Col span={12}>
                    <Form.Item label="发起部门" {...formItemLayout}>
                      {getFieldDecorator('sponsorDepId', {
                        rules: [
                          {
                            required: true,
                            message: '请选择发起部门',
                          },
                        ],
                      })(
                        <TreeSelect
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          allowClear
                          placeholder="请选择发起部门"
                          treeData={this.state.department}
                          onFocus={this.getDepartmentTree}
                          onChange={(id, name) => {
                            this.setState({
                              sponsorDepName: name[0],
                            });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col> */}
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label="培训地点" {...formItemLayout}>
                      {getFieldDecorator('trainLocation', {
                        rules: [
                          {
                            required: true,
                            message: '请输入培训地点',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="培训名称" {...formItemLayout}>
                      {getFieldDecorator('trainName', {
                        rules: [
                          {
                            required: true,
                            message: '请输入培训名称',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label="培训学时" {...formItemLayout}>
                      {getFieldDecorator('trainLearnTime', {
                        rules: [
                          {
                            required: true,
                            message: '请输入培训学时',
                          },
                        ],
                      })(<InputNumber min={0} max={999} style={{width:'100%'}} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Modal>
        </Fragment>
      );
    }
  }
);
