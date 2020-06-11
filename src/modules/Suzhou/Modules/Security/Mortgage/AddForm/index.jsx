import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker } from 'antd';
import { addMortgageRefund } from '@/modules/Suzhou/api/suzhou-api';
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
import SelectSection from '@/modules/Suzhou/components/SelectSection';
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      sectionIdData: [], // 标段数据列表
      sectionId:''
    };
    // 获取标段
    handleGetSectionIds = () => {
      // axios.get(getsectionId(this.props.projectId)).then(res => {
      //   const { data = [] } = res.data;
      //   this.setState(() => ({ sectionIdData: getMapData(data) }));
      //   if (this.state.sectionIdData.length > 0) {
      //     const { id , code} = this.state.sectionIdData[0];
      //     this.props.form.setFieldsValue({ sectionId: id });
      //     this.setState({
      //       sectionCode: code,
      //     });
      //   }
      // });
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
                    <Form.Item
                      label="申请退还金额（万元）"
                      {...formItemLayout}
                      labelCol={{ xs: { span: 24 }, sm: { span: 12 } }}
                      wrapperCol={{ xs: { span: 24 }, sm: { span: 12 } }}
                    >
                      {getFieldDecorator('sqthje', {
                        rules: [
                          {
                            required: true,
                            message: '请输入正整数',
                            pattern: /^[1-9]\d*$/,
                          },
                        ],
                      })(<Input style={{ width: '90%' }} type="number" />)}
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
          const params = {
            ...values,
            projectId: this.props.projectId,
          };
          axios.post(addMortgageRefund, params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
  }
);
