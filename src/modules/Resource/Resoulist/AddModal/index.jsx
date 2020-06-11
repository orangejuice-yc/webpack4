import React, {Component} from 'react'
import style from './style.less'
import {Form, Row, Col, Input, Button, Icon, Select, InputNumber, Modal} from 'antd';
import moment from 'moment';
import {connect} from 'react-redux'
import axios from "../../../../api/axios"
import {getdictTree, calendarList, AddUserRsrc, getDefaultCalendar} from "../../../../api/api"
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
const Option = Select.Option;
const {TextArea} = Input;
const FormItem = Form.Item;

class MenuInfo extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: true,
      info: {}
    }
  }

  componentDidMount() {
    this.getDefaultCalendarInfo()
  }

  //获取默认日历
  getDefaultCalendarInfo = () => {
    axios.get(getDefaultCalendar).then(res => {
      const {data} = res.data
      if (data) {
        this.setState({
          defaultCalendar: data,
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
            unitList: res.data.data
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
            calendarList: res.data.data
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
            statusList: res.data.data
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
            importantList: res.data.data
          })
        }
      })
    }
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = (e) => {
    this.setState({
      visible: false,
    });
    this.props.handleCancel()
  }

  handleCancel = () => {
   
    this.setState({
      visible: false,
    });
    this.props.handleCancel()
  }

  handleSubmit = (type) => {
   
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let data = {
          ...values,
          rsrcUserType: "user"
        }
        if (this.props.data.rsrcUserType == 1 || this.props.data.rsrcUserType == 0) {
          data.orgId = this.props.data.id
        } else {
          data.orgId = this.props.data.parentId
        }
        axios.post(AddUserRsrc, data, true).then(res => {
          this.props.addArrayData(res.data.data, "useradd")
          this.props.form.resetFields();
          if (type == "new") {
            this.props.handleCancel()
          }
        })
      }
    });
  }

  render() {
    const {intl} = this.props.currentLocale
    const {
      getFieldDecorator, getFieldsError, getFieldError, isFieldTouched,
    } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
      },
    };
    const formItemLayout1 = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 20},
      },
    };
    return (
      <div>
        <Modal title={this.props.title} visible={this.state.visible}
               className={style.main}
               onOk={this.handleOk} onCancel={this.handleCancel}
               width="800px"
               footer={
                 <div className="modalbtn">
                   <SubmitButton key={3} onClick={this.handleSubmit.bind(this, "go")} content="保存并继续" />
                   <SubmitButton key={2} onClick={this.handleSubmit.bind(this, "new")} type="primary" content="保存" />
                 </div>
               }
        >
          <div className={style.ResAddModal}>
            <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
              <div className={style.content}>
                <Row type="flex">
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.sys.menu.menuname')} {...formItemLayout}>
                      {getFieldDecorator('rsrcUserName', {
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.sys.menu.menuname'),
                        }],
                      })(
                        <Input maxLength={66}/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.sys.menu.menucode')} {...formItemLayout}>
                      {getFieldDecorator('rsrcUserCode', {
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.sys.menu.menucode'),
                        }],
                      })(
                        <Input maxLength={33}/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.calendarid')} {...formItemLayout}>
                      {getFieldDecorator('calendarId', {
                        initialValue: this.state.defaultCalendar ? this.state.defaultCalendar.id : null,
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.calendarid'),
                        }],
                      })(
                        <Select onDropdownVisibleChange={this.getCalendarList}>
                          {this.state.calendarList ? this.state.calendarList.map(item => {
                            return <Option value={item.id} key={item.id}>{item.calName}</Option>
                          }) : this.state.defaultCalendar &&
                            <Option value={this.state.defaultCalendar.id} key={this.state.defaultCalendar.id}>{this.state.defaultCalendar.calName}</Option>
                          }
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.maxunit')} {...formItemLayout}>
                      {getFieldDecorator('maxunit', {
                        initialValue: this.state.defaultCalendar ? this.state.defaultCalendar.dayHrCnt : 1,
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.maxunit'),
                        }],
                      })(
                        <InputNumber style={{width: "100%"}} min={1} max={24} precision={2}
                                     formatter={value => value ? `${value}h/d` : ''}
                                     parser={value => value.replace('h/d', '')}/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrctype')} {...formItemLayout}>
                      {getFieldDecorator("rsrcUserType", {
                        initialValue: "人力",
                        rules: [],
                      })(
                        <Input disabled/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.unit')} {...formItemLayout}>
                      {getFieldDecorator('unit', {
                        rules: [],
                      })(
                        <Select onDropdownVisibleChange={this.getUnit}>
                          {this.state.unitList && this.state.unitList.map(item => {
                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrcrolename')} {...formItemLayout}>
                      {getFieldDecorator('importance', {
                        rules: [],
                      })(
                        <Select onDropdownVisibleChange={this.getImportant}>
                          {this.state.importantList && this.state.importantList.map(item => {
                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.status')} {...formItemLayout}>
                      {getFieldDecorator('status', {
                        rules: [],
                      })(
                        <Select onDropdownVisibleChange={this.getStatus}>
                          {this.state.statusList && this.state.statusList.map(item => {
                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.featuredesc')} {...formItemLayout1}>
                      {getFieldDecorator('featureDesc', {
                        rules: [],
                      })(
                        <TextArea maxLength={666} rows={2}/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.remark')} {...formItemLayout1}>
                      {getFieldDecorator('remark', {
                        rules: [],
                      })(
                        <TextArea maxLength={666} rows={2}/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </Form>
          </div>
        </Modal>
      </div>
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
