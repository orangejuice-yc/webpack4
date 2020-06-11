import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Icon, Select, InputNumber } from 'antd';
import { connect } from 'react-redux'
import axios from "../../../../api/axios"
import { getuserRsrcInfo, getdictTree, calendarList, updateUserRsrcInfo } from "../../../../api/api"
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"
const Option = Select.Option;
const { TextArea } = Input;
const FormItem = Form.Item;

class MenuInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      info: {}
    }
  }

  componentDidMount() {
    const { data } = this.props
    //获取设备资源
    axios.get(getuserRsrcInfo(data.id)).then(res => {
      if (res.data.data) {
        this.setState({
          info: res.data.data
        })
      }
    })
  }

  //获取计量单位
  getUnit = () => {
    if (!this.state.unitList) {
      axios.get(getdictTree("rsrc.rsrc.unit")).then(res => {
        if (res.data.data) {
          this.setState({
            unitList: res.data.data,
          })
        }
      })
    }
  }

  //获取日历列表
  getCalendarList = () => {
    if (!this.state.calendarList) {
      axios.get(calendarList).then(res => {
        if (res.data.data) {
          this.setState({
            calendarList: res.data.data,
          })
        }
      })
    }
  }

  //获取状态
  getStatus = () => {
    if (!this.state.statusList) {
      axios.get(getdictTree("rsrc.rsrc.status")).then(res => {
        if (res.data.data) {
          this.setState({
            statusList: res.data.data,
          })
        }
      })
    }
  }

  //获取主要性
  getImportant = () => {
    if (!this.state.importantList) {
      axios.get(getdictTree("rsrc.rsrc.importance")).then(res => {
        if (res.data.data) {
          this.setState({
            importantList: res.data.data,
          })
        }
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const { data } = this.props
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let obj = {
          id: data.id,
          ...values,
          rsrcUserType: "user"
        }
        axios.put(updateUserRsrcInfo, obj, true).then(res => {
          this.props.updateSuccess(res.data.data)
        })
      }
    });
  }

  render() {
    const { intl } = this.props.currentLocale
    const {
      getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
    } = this.props.form;
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
      <LabelFormLayout title={this.props.title} >
        <Form onSubmit={this.handleSubmit}>

          <Row type="flex">
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrcname')} {...formItemLayout}>
                {getFieldDecorator('rsrcUserName', {
                  initialValue: this.state.info.rsrcUserName,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
                  }],
                })(
                  <Input maxLength={66} />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrccode')} {...formItemLayout}>
                {getFieldDecorator('rsrcUserCode', {
                  initialValue: this.state.info.rsrcUserCode,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
                  }],
                })(
                  <Input maxLength={33} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.calendarid')} {...formItemLayout}>
                {getFieldDecorator('calendarId', {
                  initialValue: this.state.info.calendar ? this.state.info.calendar.id : null,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.calendarid'),
                  }],
                })(
                  <Select onDropdownVisibleChange={this.getCalendarList}>
                    {this.state.calendarList ? this.state.calendarList.map(item => {
                      return <Option value={item.id} key={item.id}>{item.calName}</Option>
                    }) : this.state.info.calendar &&
                      <Option value={this.state.info.calendar.id} key={this.state.info.calendar.id}>{this.state.info.calendar.name}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.maxunit')} {...formItemLayout}>
                {getFieldDecorator('maxunit', {
                  initialValue: this.state.info.maxunit,
                  rules: [{
                    required: true,
                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
                  }],
                })(
                  <InputNumber style={{ width: "100%" }} min={1} max={24} precision={2}
                    formatter={value => value ? `${value}h/d` : ''}
                    parser={value => value.replace('h/d', '')} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrctype')} {...formItemLayout}>
                {getFieldDecorator('rsrcUserType', {
                  initialValue: "人力",
                  rules: [],
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.unit')} {...formItemLayout}>
                {getFieldDecorator('unit', {
                  initialValue: this.state.info.unit ? this.state.info.unit.id : null,
                  rules: [],
                })(
                  <Select onDropdownVisibleChange={this.getUnit}>
                    {this.state.unitList ? this.state.unitList.map(item => {
                      return <Option value={item.value} key={item.value}>{item.title}</Option>
                    }) : this.state.info.unit &&
                      <Option value={this.state.info.unit.id} key={this.state.info.unit.id}>{this.state.info.unit.name}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename')} {...formItemLayout}>
                {getFieldDecorator('importance', {
                  initialValue: this.state.info.importance ? this.state.info.importance.id : null,
                  rules: [],
                })(
                  <Select onDropdownVisibleChange={this.getImportant}>
                    {this.state.importantList ? this.state.importantList.map(item => {
                      return <Option value={item.value} key={item.value}>{item.title}</Option>
                    }) : this.state.info.importance &&
                      <Option value={this.state.info.importance.id} key={this.state.info.importance.id}>{this.state.info.importance.name}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.status')} {...formItemLayout}>
                {getFieldDecorator('status', {
                  initialValue: this.state.info.status ? this.state.info.status.id : null,
                  rules: [],
                })(
                  <Select onDropdownVisibleChange={this.getStatus}>
                    {this.state.statusList ? this.state.statusList.map(item => {
                      return <Option value={item.value} key={item.value}>{item.title}</Option>
                    }) : this.state.info.status &&
                      <Option value={this.state.info.status.id} key={this.state.info.status.id}>{this.state.info.status.name}</Option>
                    }
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.featuredesc')} {...formItemLayout1}>
                {getFieldDecorator('featureDesc', {
                  initialValue: this.state.info.featureDesc,
                  rules: [],
                })(
                  <TextArea maxLength={666} rows={2} />
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.remark')} {...formItemLayout1}>
                {getFieldDecorator('remark', {
                  initialValue: this.state.info.remark,
                  rules: [],
                })(
                  <TextArea maxLength={666} rows={2} />
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <LabelFormButton>
          <Button onClick={this.handleSubmit} style={{ width: "100px" }} type="primary">保存</Button>
          <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginLeft: "20px" }}>取消</Button>
        </LabelFormButton>
      </LabelFormLayout>

    )
  }
}

const MenuInfos = Form.create()(MenuInfo);
const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  }
};
export default connect(mapStateToProps, null)(MenuInfos);
