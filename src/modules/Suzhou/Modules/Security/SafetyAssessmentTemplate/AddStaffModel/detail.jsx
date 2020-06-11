import React, { Component } from 'react';
import {
  Modal,
  Tabs,
  Select,
  Form,
  Row,
  Col,
  Input,
  Checkbox,
  Button,
  Icon,
  DatePicker,
} from 'antd';
import style from './style.less';
import { connect } from 'react-redux';

const Option = Select.Option;
const { TextArea } = Input;
const FormItem = Form.Item;
const locales = {
  'en-US': require('@/api/language/en-US.json'),
  'zh-CN': require('@/api/language/zh-CN.json'),
};
class Basic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      initDone: false,
      info: {
        actuName: '',
        roleName: '',
        userLevel: '',
        sex: '',
        birth: null,
        entryDate: null,
        leaveDate: null,
        startDate: null,
        passExpirationDate: null,
        startDate: null,
        endDate: null,
        phone: '',
        email: '',
        status: '',
        sortNum: '',
      },
    };
  }
  //国际化
  loadLocales() {
    intl
      .init({
        currentLocale: 'zh-CN',
        locales,
      })
      .then(() => {
        // After loading CLDR locale data, start to render
        this.setState({ initDone: true });
      });
  }
  // 表单提交
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.submitDetail(values);
      }
    });
  };
  componentDidMount() {
    // this.loadLocales();
  }
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
      <Form onSubmit={this.handleSubmit2}>
        <div className={style.content}>
          <Row>
            <Col span={12}>
              <Form.Item label="考核项" {...formItemLayout}>
                {getFieldDecorator('title', {
                  initialValue: this.state.info.title,
                  rules: [{ required: true, message: '请输入' }],
                })(<TextArea />)}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label="分数" {...formItemLayout}>
                {getFieldDecorator('score', {
                  initialValue: this.state.info.score,
                  rules: [{ required: true, message: '请输入' }],
                })(<TextArea />)}
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="modalbtn" style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button key={1} onClick={this.props.handleCancel}>
            取消
          </Button>
          <Button key={2} onClick={this.handleSubmit2} type="primary">
            保存
          </Button>
        </div>
      </Form>
    );
  }
}

const Basic1 = Form.create()(Basic);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(Basic1);
