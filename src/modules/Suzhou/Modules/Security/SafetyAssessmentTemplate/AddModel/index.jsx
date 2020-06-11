import React, { Component } from 'react';
import style from './style.less';
import RoleInfo from './../RoleInfo';
import axios from '@/api/axios';
import { roleInfo, roleUpdate, addRole, roleLevel } from '@/api/api';
import { addSecurityExaminationModule } from '@/modules/Suzhou/api/suzhou-api';
import { connect } from 'react-redux';
import { Form, Input, Select, Row, Col, Button, DatePicker, TreeSelect, Modal } from 'antd';
import SubmitButton from '@/components/public/TopTags/SubmitButton';
const FormItem = Form.Item;
const Option = Select.Option;
const { TextArea } = Input;
export class RoleAddModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '新增顶级机构',
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
    const data = this.state.info;

    data.parentOrg = {
      id: this.props.rightData ? this.props.rightData.id : 0,
      name: this.props.rightData ? this.props.rightData.orgName : '组织树',
    };
    this.setState({
      info: data,
    });

    this.getRoleLevel();
  }

  getRoleLevel = () => {
    axios.get(roleLevel).then(res => {
      if (res.data.data) {
        this.setState({
          treeLevel: res.data.data,
        });
      }
    });
  };
  handleSubmit = val => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        values['parentId'] = this.props.rightData ? this.props.rightData.id : 0;
        axios.post(addSecurityExaminationModule, values, true, '新增成功', true).then(res => {
          this.props.addSuccess(res.data.data);
          if (val === 'save') {
            this.props.unShow();
          } else {
            this.props.form.resetFields();
          }
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
        <Modal
          title={this.props.modelTitle}
          visible={this.props.roleVisible}
          onCancel={this.props.handleCancel}
          footer={
            <div className="modalbtn">
              <SubmitButton
                key={1}
                onClick={this.handleSubmit.bind(this, 'goOn')}
                content="保存并继续"
              />
              <SubmitButton
                key={2}
                onClick={this.handleSubmit.bind(this, 'save')}
                type="primary"
                content="保存"
              />
            </div>
          }
          maskClosable={false}
          mask={false}
          width="850px"
          centered={true}
          className={style.addFormInfo}
        >
          <Form onSubmit={this.handleSubmit}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label="名称" {...formItemLayout}>
                    {getFieldDecorator('moduleName', {
                      initialValue: this.state.info.orgName,
                      rules: [
                        {
                          required: true,
                          message: '请输入',
                        },
                      ],
                    })(<Input maxLength={33} />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="代码" {...formItemLayout}>
                    {getFieldDecorator('moduleCode', {
                      initialValue: this.state.info.orgCode,
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
          {/* <RoleInfo addSuccess={this.addSuccess} parentData={this.props.rightData} api={'add'} unShow={this.props.unShow} /> */}
        </Modal>
      </div>
    );
  }
}

const RoleAddModels = Form.create()(RoleAddModel);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(RoleAddModels);
