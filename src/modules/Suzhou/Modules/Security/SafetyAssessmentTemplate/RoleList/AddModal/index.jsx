import React, { Component } from 'react';
import style from './style.less';
import {
  Form,
  Tabs,
  Row,
  Col,
  Input,
  Checkbox,
  Button,
  Icon,
  Select,
  DatePicker,
  TreeSelect,
  InputNumber,
  Modal,
} from 'antd';
import axios from '@/api/axios';
import { orgTree, roleList } from '@/api/api';
import { connect } from 'react-redux';
import SubmitButton from '@/components/public/TopTags/SubmitButton';
import * as dataUtil from '@/utils/dataUtil';
import { addSecurityExaminationModuleDetail } from '@/modules/Suzhou/api/suzhou-api';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
const FormItem = Form.Item;
const TreeNode = TreeSelect.TreeNode;

export class PlanPrepared extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      quitDate: null,
      isSetLeavedate: false, //离职日期可编辑
      userInfo: false, // 用户信息
      secutylevellist1: [{ value: '1', title: '非密' }],
    };
  }

  componentDidMount() {
    let userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    this.setState({
      userInfo,
    });
    axios.get(orgTree).then(res => {
      this.setState({
        orglist: res.data.data,
      });
    });
  }

  //获取角色
  getRole = () => {
    if (!this.state.rolelist) {
      axios.get(roleList).then(res => {
        if (res.data.data) {
          this.setState({
            rolelist: res.data.data,
          });
        }
      });
    }
  };
  //获取密级
  getSecuty = () => {
    if (!this.state.secutylevellist) {
      axios.get('api/base/dict/comm.secutylevel/select/tree').then(res => {
        if (res.data.data) {
          this.setState({
            secutylevellist: res.data.data,
            secutylevellist1: null,
          });
        }
      });
    }
  };
  //获取证件
  getcardtype = () => {
    if (!this.state.cardtypelist) {
      axios.get('api/base/dict/sys.user.cardtype/select/tree').then(res => {
        if (res.data.data) {
          this.setState({
            cardtypelist: res.data.data,
          });
        }
      });
    }
  };

  //在岗状态处理
  changeStatus = v => {
    if (v == 1) {
      this.setState({
        quitDate: null,
        isSetLeavedate: true,
      });
    } else {
      this.setState({
        isSetLeavedate: false,
      });
    }
  };

  //取消关闭
  closeModal = () => {
    this.props.form.resetFields();
    this.props.closeBasicModal();
  };
  // 表单提交
  handleSubmit = type => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        // let professional = values['professional'];
        // values['professional'] = dataUtil.Arr().toString(professional);
        let obj = {
          ...values,
          moduleId: this.props.rightData.id,
        };
        axios.post(addSecurityExaminationModuleDetail, obj, true).then(res => {
          this.props.form.resetFields();

          if (type == 'new') {
            this.props.handleCancel();
          }

          this.props.addUser(res.data.data);
        });
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
    const formLayout = {
      labelCol: {
        sm: { span: 4 },
      },
      wrapperCol: {
        sm: { span: 20 },
      },
    };
    return (
      <div>
        <Modal
          width="850px"
          className={style.main}
          mask={false}
          maskClosable={false}
          title={'新增考核详情'}
          visible={true}
          onCancel={this.props.handleCancel}
          bodyStyle={{ padding: '5px' }}
          centered={true}
          footer={
            <div className="modalbtn">
              <SubmitButton
                key={1}
                onClick={this.handleSubmit.bind(this, 'go')}
                content="保存继续"
              />
              <SubmitButton
                key={2}
                onClick={this.handleSubmit.bind(this, 'new')}
                type="primary"
                content="保存"
              />
            </div>
          }
          // footer={null}
        >
          <div className={style.userFromInfo}>
            <Form onSubmit={this.handleSubmit}>
              <div className={style.content}>
                <Row>
                  <Col span={12}>
                    <Form.Item label="考核项" {...formItemLayout}>
                      {getFieldDecorator('title', {
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                      })(<TextArea />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="分数" {...formItemLayout}>
                      {getFieldDecorator('score', {
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                      })(<Input type="number" maxLength={21} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
    );
  }
}

const PlanPreparedS = Form.create()(PlanPrepared);
const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  };
};

export default connect(
  mapStateToProps,
  null
)(PlanPreparedS);
