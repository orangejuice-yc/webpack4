import React, { Component } from 'react';
import {
  Modal,
  Form,
  Row,
  Col,
  Input,
  Button,
  Icon,
  Select,
  DatePicker,
  Slider,
  InputNumber,
  message,
  Checkbox,
  TreeSelect,
} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '@/store/curdData/action';
import axios from '@/api/axios';
import { getsectionId, getBaseSelectTree } from '@/modules/Suzhou/api/suzhou-api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from '@/components/public/TopTags/PublicButton';
import * as dataUtil from '@/utils/dataUtil';
import { getSelectTreeArr } from '@/modules/Suzhou/components/Util/firstLoad';
import SelectSection from '@/modules/Suzhou/components/SelectSection';

export class AddModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectSection: [], //选择标段
      firstSection: '', //默认第一个标段
    };
  }
  // componentDidMount() {
  //   axios.get(getsectionId(this.props.projectId)).then(res => {
  //     getSelectTreeArr(res.data.data, { id: 'value', name: 'title' });
  //     this.setState({
  //       selectSection: res.data.data,
  //       firstSection: !res.data.data ? '' : res.data.data[0].value,
  //       sectionCode: !res.data.data ? '' : res.data.data[0].code,
  //     });
  //   });
  // }
  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      values.inspectionTime = values.inspectionTime
        ? dataUtil
            .Dates()
            .formatTimeString(values.inspectionTime)
            .substr(0, 10)
        : '';
      if (!err) {
        if (val == 'save') {
          this.props.submit(values, 'save');
        } else {
          this.props.submit(values, 'goOn');
          this.props.form.resetFields();
        }
      }
    });
  };
  render() {
    const { intl } = this.props.currentLocale;
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
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
    return (
      <div>
        <Modal
          className={style.main}
          width="850px"
          afterClose={this.props.form.resetFields}
          mask={false}
          maskClosable={false}
          footer={
            <div className="modalbtn">
              {/* 保存并继续 */}
              <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>
                {intl.get('wsd.global.btn.saveandcontinue')}
              </Button>
              {/* 保存 */}
              <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">
                {intl.get('wsd.global.btn.preservation')}
              </Button>
            </div>
          }
          centered={true}
          title={'新增'}
          visible={this.props.modalVisible}
          onCancel={this.props.handleCancel}
        >
          <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
            <Row>
              <Col span={12}>
                <Form.Item label={'选择标段'} {...formItemLayout}>
                  {getFieldDecorator('sectionId', {
                    initialValue: this.state.firstSection,
                    rules: [
                      {
                        required: true,
                        message: '请选择标段名称',
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
                <Form.Item label={'标段号'} {...formItemLayout}>
                  {getFieldDecorator('sectionCode', {
                    initialValue: this.state.sectionCode,
                    rules: [
                      {
                        required: true,
                        message: '请输入标段号',
                      },
                    ],
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'检测名称'} {...formItemLayout}>
                  {getFieldDecorator('inspectionName', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检测名称',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'检测日期'} {...formItemLayout}>
                  {getFieldDecorator('inspectionTime', {
                    rules: [
                      {
                        required: true,
                        message: '请选择检测日期',
                      },
                    ],
                  })(<DatePicker style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'检测类型'} {...formItemLayout}>
                  {getFieldDecorator('inspectionType', {
                    rules: [
                      {
                        required: true,
                        message: '请选择检测类型',
                      },
                    ],
                  })(
                    <Select>
                      <Option key="0" value="0">
                        开箱检验
                      </Option>
                      <Option key="1" value="1">
                        进场报验
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'检测单位'} {...formItemLayout}>
                  {getFieldDecorator('inspectionCompany', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检测单位',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'检测员'} {...formItemLayout}>
                  {getFieldDecorator('inspector', {
                    rules: [
                      {
                        required: true,
                        message: '请输入检测员',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'取样员'} {...formItemLayout}>
                  {getFieldDecorator('sampler', {
                    rules: [
                      {
                        required: true,
                        message: '请输入取样员',
                      },
                    ],
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'见证员'} {...formItemLayout}>
                  {getFieldDecorator('witness', {
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'需第三方检测'} {...formItemLayout}>
                  {getFieldDecorator('needThirdInspection', {
                    initialValue: '0',
                    rules: [
                      {
                        required: true,
                        message: '请选择是否需第三方检测',
                      },
                    ],
                  })(
                    <Select>
                      <Option key={'0'} value={'0'}>
                        是
                      </Option>
                      <Option key={'1'} value={'1'}>
                        否
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'是否通过'} {...formItemLayout}>
                  {getFieldDecorator('status', {
                    initialValue: '0',
                    rules: [
                      {
                        required: true,
                        message: '请选择是否通过',
                      },
                    ],
                  })(
                    <Select disabled>
                      <Option key={'0'} value={'0'}>
                        否
                      </Option>
                      <Option key={'1'} value={'1'}>
                        是
                      </Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={'备注说明'} {...formItemLayout1}>
                  {getFieldDecorator('description', {
                    rules: [],
                  })(<TextArea rows={2} />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
const AddModals = Form.create()(AddModal);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(AddModals);
