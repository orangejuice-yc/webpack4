import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, TreeSelect } from 'antd';
import LabelFormLayout from "../../../../components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "../../../../components/public/Layout/Labels/Form/LabelFormButton"

import moment from 'moment';
import { connect } from 'react-redux'
import axios from "../../../../api/axios"
import { updatersrcrole, getrsrcroleInfo, getdictTree, calendarList } from "../.././../../api/api"

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
class BasicInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {

            info: {

            }
        }
    }

    componentDidMount() {
        axios.get(getrsrcroleInfo(this.props.data.id)).then(res => {
            this.setState({
                info: res.data.data
            }, () => {
                const { info } = this.state
                this.setState({
                    roleTypeList1: info.roleType ? [info.roleType] : [], 
                    calendardata1: info.calendar ? [info.calendar] : null
                })
            })
        })
        // this.getRoleType()
        // this.getUnit()
        // this.getCalendarList()
    }

    //获取角色类型
    getRoleType = () => {
        if (!this.state.roleTypeList) {
            axios.get(getdictTree("rsrc.role.type")).then(res => {
                if (res.data.data) {
                    this.setState({
                        roleTypeList: res.data.data
                    }, () => {
                        this.setState({
                            roleTypeList1: null
                        })
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
    //获取日历列表
    getCalendarList = () => {
        if (!this.state.calendardata) {
            axios.get(calendarList).then(res => {
                if (res.data.data) {
                    this.setState({
                        calendardata: res.data.data
                    }, () => {
                        this.setState({
                            calendardata1: null
                        })
                    })
                }
            })
        }

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let data = {
                    id: this.props.data.id,
                    parentId: this.props.data.parentId,
                    ...values
                }
                axios.put(updatersrcrole, data, true).then(res => {

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
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.rolename')} {...formItemLayout}>
                                {getFieldDecorator('roleName', {
                                    initialValue: this.state.info.roleName,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrcrole.rolename'),
                                    }],
                                })(
                                    <Input maxLength={66} />
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.rolecode')} {...formItemLayout}>
                                {getFieldDecorator('roleCode', {
                                    initialValue: this.state.info.roleCode,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrcrole.rolecode'),
                                    }],
                                })(
                                    <Input maxLength={33} />
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.roletype')} {...formItemLayout}>
                                {getFieldDecorator('roleType', {
                                    initialValue: this.state.info.roleType ? this.state.info.roleType.id : null,
                                    rules: [],
                                })(
                                    <Select onDropdownVisibleChange={this.getRoleType}>
                                        {this.state.roleTypeList1 ? this.state.roleTypeList1.map(item => {
                                            return <Option value={item.id} key={item.id}>{item.name}</Option>
                                        }) : this.state.roleTypeList && this.state.roleTypeList.map(item => {
                                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.unit')} {...formItemLayout}>
                                {getFieldDecorator('unit', {
                                    initialValue: this.state.info.unit ? this.state.info.unit.id : null,
                                    rules: [],
                                })(
                                    <Select onDropdownVisibleChange={this.getUnit}>
                                        {this.state.info.unit ?  <Option value={this.state.info.unit.id} key={this.state.info.unit.id}>{this.state.info.unit.name}</Option>
                                        : this.state.unitList && this.state.unitList.map(item => {
                                            return <Option value={item.value} key={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                  
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row >
                        <Col span={12}>
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.calendarid')} {...formItemLayout}>
                                {getFieldDecorator('calendarId', {
                                    initialValue: this.state.info.calendar ? this.state.info.calendar.id : null,
                                    rules: [{
                                        required: true,
                                        message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrcrole.calendarid'),
                                    }],
                                })(
                                    <Select onDropdownVisibleChange={this.getCalendarList}>
                                        {this.state.calendardata1 ? this.state.calendardata1.map(item => {
                                            return <Option value={item.id} key={item.id}>{item.name}</Option>
                                        }) : this.state.calendardata && this.state.calendardata.map(item => {
                                            return <Option value={item.id} key={item.id}>{item.calName}</Option>
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row>
                        <Col span={24}>
                            <Form.Item label={intl.get('wsd.i18n.rsrc.rsrcrole.remark')} {...formItemLayout1}>
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
                    <Button onClick={this.handleSubmit} style={{ width: "100px" }} type="primary">{intl.get("wsd.global.btn.preservation")}</Button>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px", marginLeft: "20px" }}>{intl.get("wsd.global.btn.cancel")}</Button>
                </LabelFormButton>
            </LabelFormLayout>

        )
    }
}
const BasicInfos = Form.create()(BasicInfo);
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};
export default connect(mapStateToProps, null)(BasicInfos);
