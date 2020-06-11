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
import { orgTree, roleList, userInfo } from '@/api/api';
import { connect } from 'react-redux';
import SubmitButton from '@/components/public/TopTags/SubmitButton';
import * as dataUtil from '@/utils/dataUtil';
//
import { updateSecurityExaminationModuleDetail } from '@/modules/Suzhou/api/suzhou-api';

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
      info: {},
    };
  }

  componentDidMount() {
    // let userInfo1 = JSON.parse(sessionStorage.getItem('userInfo'));
    // this.setState({
    //   loginUser: userInfo1,
    // });
    // axios.get(orgTree).then(res => {
    //   this.setState({
    //     orglist: res.data.data,
    //   });
    // });
    // axios.get(userInfo(this.props.selectData.id)).then(res => {
    //   this.setState(
    //     {
    //       info: res.data.data,
    //     },
    //     () => {
    //       const { info } = this.state;
    //       this.setState({
    //         secutylevellist1: info.level
    //           ? [{ value: info.level.code, title: info.level.name }]
    //           : null,
    //         cardtypelist: info.cardType
    //           ? [{ value: info.cardType.code, title: info.cardType.name }]
    //           : null,
    //         rolelist: info.roles
    //           ? info.roles.map(item => ({ id: item.id, roleDesc: item.roleName }))
    //           : null,
    //       });
    //     }
    //   );
    // });
  }

  //获取角色
  getRole = () => {
    if (!this.state.rolelist1) {
      axios.get('api/sys/role/list').then(res => {
        this.setState({
          rolelist1: res.data.data,
          rolelist: null,
        });
      });
    }
  };
  //获取密级
  getSecuty = () => {
    if (!this.state.secutylevellist) {
      axios.get('api/base/dict/comm.secutylevel/select/tree').then(res => {
        this.setState({
          secutylevellist: res.data.data,
          secutylevellist1: null,
        });
      });
    }
  };
  //获取证件
  getcardtype = () => {
    if (!this.state.cardtypelist1) {
      axios.get('api/base/dict/sys.user.cardtype/select/tree').then(res => {
        this.setState({
          cardtypelist1: res.data.data,
          cardtypelist: null,
        });
      });
    }
  };

  //取消关闭
  closeModal = () => {
    this.props.form.resetFields();
    this.props.closeBasicModal();
  };
  // 表单提交
  handleSubmit = e => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      let professional = values['professional'];
      values['professional'] = dataUtil.Arr().toString(professional);
      let id = this.props.selectData.id;
      let data = { ...values, id };
      if (!err) {
        axios.put(updateSecurityExaminationModuleDetail, data, true).then(res => {
          this.props.updateUser(res.data.data);
          this.props.handleCancel();
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
          title="修改考核详情"
          visible={true}
          onCancel={this.props.handleCancel}
          bodyStyle={{ padding: '5px' }}
          centered={true}
          footer={
            <div className="modalbtn">
              <SubmitButton key={1} onClick={this.props.handleCancel} content="取消" />
              <SubmitButton key={2} onClick={this.handleSubmit} type="primary" content="保存" />
            </div>
          }
          // footer={null}
        >
          <div className={style.userFromInfo}>
            <Form onSubmit={this.handleSubmit}>
              <div className={style.content}>
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
                          initialValue: this.props.selectData.title,
                        })(<TextArea />)}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="分数" {...formItemLayout}>
                        {getFieldDecorator('score', {
                          initialValue: this.props.selectData.score,
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
