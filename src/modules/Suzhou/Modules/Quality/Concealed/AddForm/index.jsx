import React, { Component, Fragment } from 'react';
import moment from 'moment';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker } from 'antd';
import style from './style.less';
import { addQuaConce, station } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import { getsectionId, queryQuaSystem } from '@/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectSection from '@/modules/Suzhou/components/SelectSection';

const { TextArea } = Input;
const { Option } = Select;

export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      currentTime: null,
      list: [],
      treeData: [],
      sectionId:''
    };
    getBelongStaList = () => {
      axios.get(station(this.props.projectId)).then(res => {
        const { data } = res.data;
        this.setState({
          list: data,
        });
      });
    };
    getData = () => {
      axios.get(getsectionId(this.props.projectId)).then(res => {
        const { data = [] } = res.data;
        this.setState(() => ({ treeData: treeFunMap(data) }));
        if (this.state.treeData.length > 0) {
          const { id , code} = this.state.treeData[0];
          this.props.form.setFieldsValue({ sectionId: id });
          this.setState({
            sectionId: code,
          });
        }
      });
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
              // this.getData();
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
                    <Form.Item label="验收时间" {...formItemLayout}>
                      {getFieldDecorator('checkTime', {
                        rules: [
                          {
                            required: true,
                            message: '请选择时间',
                          },
                        ],
                      })(<DatePicker style={{ width: '100%' }} />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="隐蔽工程名称" {...formItemLayout}>
                      {getFieldDecorator('engineName', {
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                      })(<Input />)}
                    </Form.Item>
                  </Col>
                  
                </Row>
                <Row>
                <Col span={12}>
                    <Form.Item label="站点" {...formItemLayout}>
                      {getFieldDecorator('belongSta', {
                        rules: [
                          {
                            required: true,
                            message: '请选择站点',
                          },
                        ],
                      })(
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="请选择站点"
                          onFocus={this.getBelongStaList}
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
                      {getFieldDecorator('selfOpinion')(<TextArea />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Modal>
        </Fragment>
      );
    }
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            checkTime: values.checkTime.valueOf(),
            projectId: this.props.projectId || '',
            belongSta: values.belongSta.join(','),
          };
          axios.post(addQuaConce(), params, true).then(res => {
            const { status, data } = res.data;
            this.setState(
              () => ({ visible: false }),
              () => {
                if (status === 200) {
                  this.props.addTabelData(data);
                }
              }
            );
          });
        }
      });
    };
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
const treeFunMap = arr => {
  for (let i = 0; i < arr.length; i++) {
    arr[i].title = arr[i].name;
    arr[i].value = arr[i].id;
    if (arr[i].children) {
      treeFunMap(arr[i].children);
    }
  }
  return arr;
};
