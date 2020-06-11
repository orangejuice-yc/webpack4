import React, { Component } from 'react';
import style from './style.less';
import { Form, Input, Select, Row, Col, Button, DatePicker, TreeSelect, InputNumber } from 'antd';
import moment from 'moment';
import { connect } from 'react-redux';
import axios from '@/api/axios';
import { roleInfo, roleUpdate, addRole, roleLevel } from '@/api/api';
import {
  querySecurityExaminationModule,
  updateSecurityExaminationModule,
} from '@/modules/Suzhou/api/suzhou-api';
import * as dataUtil from '@/utils/dataUtil';
//
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;

export class RoleInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      info: {
        orgId: '',
        orgName: '', // 机构名称
        orgCode: '', // 机构代码
        parentOrg: '', // 上级机构
        orgType: '', // 机构类型
        grade: '', // 机构等级
        status: '', // 机构状态
        sortNum: '', // 排列顺序
        local: '', // 所属地域
        orgAddress: '', // 机构地址
        postCode: '', // 邮编
        userName: '', // 联系人
        phone: '', // 联系电话
        email: '', // 电子邮箱
        webUrl: '', // 网站地址
        validDate: '', // 生效日期
        loseDate: null, // 失效日期
        remark: '', // 备注
      },
      treeLevel: [],
    };
  }

  componentDidMount() {
    if (this.props.rightData) {
      this.getRoleInfo();
    } else {
      const data = this.state.info;
      data.parentOrg = {
        id: this.props.parentData ? this.props.parentData.id : 0,
        name: this.props.parentData ? this.props.parentData.orgName : '组织树',
      };
      this.setState({
        info: data,
      });
    }
    this.getRoleLevel();
  }

  getRoleInfo = () => {
    axios.get(querySecurityExaminationModule(this.props.rightData.id)).then(res => {
      if (res.data.data) {
        this.setState({
          info: res.data.data,
        });
      }
    });
  };
  getRoleLevel = () => {
    axios.get(roleLevel).then(res => {
      if (res.data.data) {
        this.setState({
          treeLevel: res.data.data,
        });
      }
    });
  };

  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.props.rightData) {
          values['id'] = this.props.rightData.id;
          //   (values.effectDate = dataUtil.Dates().formatTimeString(values.effectDate)),
          //     (values.invalidDate = dataUtil.Dates().formatTimeString(values.invalidDate)),
          //     axios.put(roleUpdate, values, true).then(res => {
          //       const data = {
          //         ...this.props.rightData,
          //         ...values,
          //       };
          //       this.props.updateSuccess(data);
          //     });
          // } else {
          // values['parentId'] = this.props.parentData ? this.props.parentData.id : 0;
          // (values.effectDate = dataUtil.Dates().formatTimeString(values.effectDate)),
          //   (values.invalidDate = dataUtil.Dates().formatTimeString(values.invalidDate)),
          axios.put(updateSecurityExaminationModule, values, true).then(res => {
            this.props.updateSuccess(res.data.data);
            // if (val === 'save') {
            //   this.props.unShow();
            // } else {
            //   this.props.form.resetFields();
            // }
          });
        }
      }
    });
  };
  onChange = (value, lbale, extra) => {
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
      <div className={style.main}>
        <div className={style.mainHeight}>
          {this.props.api == 'add' ? '' : <h3 className={style.listTitle}>基本信息</h3>}
          <div className={style.mainScorll}>
            <Form onSubmit={this.handleSubmit}>
              <div className={style.content}>
                <Row type="flex">
                  <Col span={12}>
                    <Form.Item label="名称" {...formItemLayout}>
                      {getFieldDecorator('moduleName', {
                        initialValue: this.state.info.moduleName,
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                      })(<Input maxLength={66} />)}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="代码" {...formItemLayout}>
                      {getFieldDecorator('moduleCode', {
                        initialValue: this.state.info.moduleCode,
                        rules: [
                          {
                            required: true,
                            message: '请输入',
                          },
                        ],
                      })(<Input maxLength={33} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
          <div className={style.mybtn}>
            <Form.Item
              wrapperCol={{ offset: 4 }}
              className={this.props.api == 'add' ? style.rightBtn : null}
            >
              <div>
                {this.props.api == 'add' ? null : (
                  <Button
                    className="globalBtn"
                    onClick={this.props.closeRightBox}
                    style={{ marginRight: 20 }}
                  >
                    取消
                  </Button>
                )}
                {this.props.api == 'add' && this.props.permission.indexOf('TEMPLATE_EDIT-SAFETEMPLATE')!==-1 ? (
                  <Button
                    className="globalBtn"
                    onClick={this.handleSubmit.bind(this, 'goOn')}
                    style={{ marginRight: 20 }}
                  >
                    保存并继续
                  </Button>
                ) : null}
                <Button
                  className="globalBtn"
                  onClick={this.handleSubmit.bind(this, 'save')}
                  type="primary"
                  disabled={this.props.permission.indexOf('TEMPLATE_EDIT-SAFETEMPLATE')==-1?true:false}
                >
                  保存
                </Button>
              </div>
            </Form.Item>
          </div>
        </div>
      </div>
    );
  }
}

const RoleInfos = Form.create()(RoleInfo);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(RoleInfos);
