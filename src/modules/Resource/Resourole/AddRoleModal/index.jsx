import React, {Component} from 'react'
import style from './style.less'
import {Form, Row, Col, Input, Button, Icon, Select, DatePicker, Modal, TreeSelect} from 'antd';
import {connect} from 'react-redux'
import axios from "../../../../api/axios"
import {getdictTree, calendarList, addrsrcrole, getTimeInfo, getDefaultCalendar} from "../../../../api/api"
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
const Option = Select.Option;
const {TextArea} = Input;

class AddRoleModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      initDone: false,
      visible: true,
    }
  }

  componentDidMount() {
    this.getDefaultCalendarInfo();
  }

  //获取角色类型
  getRoleType = () => {
    if (!this.state.roleTypeList) {
      axios.get(getdictTree("rsrc.role.type")).then(res => {
        if (res.data.data) {
          this.setState({
            roleTypeList: res.data.data
          })
        }
      })
    }
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

  handleSubmit = (type) => {
  
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (this.props.type == "same") {
          let data
          if (this.props.data) {
            data = {
              ...values,
              parentId: this.props.data.parentId
            }
          } else {
            data = {
              ...values,
              parentId: 0
            }
          }
        
          axios.post(addrsrcrole, data, true).then(res => {
            this.props.addData(res.data.data)
  
            if (type == "new") {
              this.props.handleCancel()
            }else if(type == "go"){
              this.props.form.resetFields();
            }
          })
        }
        if (this.props.type == "down") {
          let data = {
            ...values,
            parentId: this.props.data.id
          }
          axios.post(addrsrcrole, data, true).then(res => {
            this.props.addData(res.data.data)
            if (type == "new") {
              this.props.handleCancel()
            }else if(type == "go"){
              this.props.form.resetFields();
            }
          })
        }

      }
    });
  }

  handleOk = (e) => {
    this.props.handleCancel()
  }
  handleCancel = (e) => {
    this.props.handleCancel()
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
      <div className={style.main}>
        <div>
          <Modal 
                maskClosable = {false} 
                 title={this.props.type == "same" ? "新增同级资源角色" : "新增下级资源角色"} visible={true}
                 onOk={this.handleOk} 
                 onCancel={this.handleCancel}
                 width="800px"
                 footer={
                   <div className="modalbtn">
                     <SubmitButton key={3} onClick={this.handleSubmit.bind(this, "go")} content={intl.get("wsd.global.btn.saveandcontinue")} />
                     <SubmitButton key={2} onClick={this.handleSubmit.bind(this, "new")} type="primary" content={intl.get("wsd.global.btn.preservation")} />
                   </div>
                 }
          >
            <Form onSubmit={this.handleSubmit}>
              <div className={style.content}>
                <Row type="flex">
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.rolename')} {...formItemLayout}>
                      {getFieldDecorator('roleName', {
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrcrole.rolename'),
                        }],
                      })(
                        <Input maxLength={66}/>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.rolecode')} {...formItemLayout}>
                      {getFieldDecorator('roleCode', {
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrcrole.rolecode'),
                        }],
                      })(
                        <Input maxLength={33}/>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row> <Col span={12}>
                  <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.roletype')} {...formItemLayout}>
                    {getFieldDecorator('roleType', {
                      rules: [],
                    })(
                      <Select onDropdownVisibleChange={this.getRoleType}>
                        {this.state.roleTypeList && this.state.roleTypeList.map(item => {
                          return <Option value={item.value} key={item.value}>{item.title}</Option>
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.unit')} {...formItemLayout}>
                      {getFieldDecorator('unit', {
                        rules: [],
                      })(
                        <Select onDropdownVisibleChange={this.getUnit}>
                            {this.state.unitList && this.state.unitList.map(item => {
                                return <Option value={item.value} key={item.value}>{item.title}</Option>
                            })}
                        </Select>
/*{                     <TreeSelect
                        dropdownStyle={{maxHeight: 400, overflow: 'auto'}}
                        treeData={this.state.unitList ? this.state.unitList : []}
                        treeDefaultExpandAll
                        onFocus={this.getUnit}
                                                />}*/
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.calendarid')} {...formItemLayout}>
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
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.remark')} {...formItemLayout1}>
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
          </Modal>
        </div>
      </div>
    )
  }
}

const AddRoleModals = Form.create()(AddRoleModal);
export default connect(state => ({currentLocale: state.localeProviderData}))(AddRoleModals);
