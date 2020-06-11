import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker ,InputNumber} from 'antd';
import { addTrainDisclosure } from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { getsectionId, getProjInfoList } from '@/api/suzhou-api';
import {
  formLayout,
  formItemLayout,
  getMapData,
  getBaseData,
} from '@/modules/Suzhou/components/Util/util';
import axios from '@/api/axios';
import style from './style.less';
import SelectSection from '@/modules/Suzhou/components/SelectSection';
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      sectionIdData: [], // 标段数据列表
      trainTypes: [], // 分包类型
      trainUnitNames: [], // 培训单位
      trainUnitName: '',
      sectionCode: '',
    };
    // 获取标段
    handleGetSectionIds = () => {
      axios.get(getsectionId(this.props.projectId)).then(res => {
        const { data = [] } = res.data;
        this.setState(() => ({ sectionIdData: getMapData(data) }));
        if (this.state.sectionIdData.length > 0) {
          const { id , code} = this.state.sectionIdData[0];
          this.props.form.setFieldsValue({ sectionId: id });
          this.handleGetTrainUnitNames({
            projectId: this.props.projectId,
            sectionIds: id,
          });
          this.setState({
            sectionCode: code,
          });
        }
      });
    };
    // 根据标段获取培训单位
    handleGetTrainUnitNames = params => {
      axios.get(getProjInfoList, { params }).then(res => {    
        this.setState({
          trainUnitNames: getMapData(res.data.data, ['value', 'title'], ['id', 'orgName']),
        });
      });
    };
    // 标段监听
    handleOnChange = (value,select,info) => {
      this.props.form.setFieldsValue({ trainUnitName: '' });
      this.setState({
        // sectionCode:info.triggerNode.props.code
      },()=>{
        this.handleGetTrainUnitNames(
          {
          projectId: this.props.projectId,
          sectionIds: value,
        });
      })
    };
    getBaseSelectTreeType = () => {
      getBaseData('szxm.aqgl.outtraintype').then(data => this.setState({ trainTypes: data }));
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
                                this.props.form.setFieldsValue({ sectionId,trainUnitId:''});
                                this.setState({sectionCode})
                                this.handleOnChange(sectionId);
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
                    <Form.Item label="培训单位" {...formItemLayout}>
                      {getFieldDecorator('trainUnitId', {
                        rules: [
                          {
                            required: true,
                            message: '请选择培训单位',
                          },
                        ],
                      })(
                        <TreeSelect
                          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                          allowClear
                          treeDefaultExpandAll
                          placeholder="请选择培训单位"
                          treeData={this.state.trainUnitNames}
                          onSelect={(a, b,c) => {
                            this.setState({ trainUnitName:b.props.orgName });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="培训类型" {...formItemLayout}>
                      {getFieldDecorator('trainType')(
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
                  
                </Row>
                <Row>
                <Col span={12}>
                    <Form.Item label="培训时间" {...formItemLayout}>
                      {getFieldDecorator('trainTime')(
                        <DatePicker style={{ width: '100%' }} disabledDate={this.disabledDate} />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="培训地点" {...formItemLayout}>
                      {getFieldDecorator('trainLocation')(<Input />)}
                    </Form.Item>
                  </Col>
                  
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label="培训名称" {...formItemLayout}>
                      {getFieldDecorator('trainName')(<Input />)}
                    </Form.Item>
                  </Col>
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
    // 确定
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = { ...values, projectId: this.props.projectId, intExt: 1 };
          if (params['trainUnitId']) {
            params['trainUnitName'] = this.state.trainUnitName;
          }
          axios.post(addTrainDisclosure(), params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
  }
);
