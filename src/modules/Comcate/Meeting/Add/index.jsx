import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, TreeSelect, Select, DatePicker, Modal } from 'antd';
import moment from 'moment'
import { meetingAdd, getdictTree, docOrgSel, orgTree } from '../../../../api/api'
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import * as dataUtil from "../../../../utils/dataUtil"
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

export class Add extends Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '基本信息',
            initDone: false,
            inputMeetTime: '',
            info: {
            },
            orgList: []
        }
    }
    //获取会议类型
    getTypeList = () => {
        if (!this.state.typeList) {
            axios.get(getdictTree("comu.meeting.type")).then(res => {
                if(res.data.data){
                    this.setState({
                        typeList: res.data.data
                    })
                }
               

            })
        }

    }
    //获取责任主体
    getOrgList = () => {
        if (this.state.orgList.length == 0) {
            axios.get(docOrgSel(this.props.projectId)).then(res => {
                if(res.data.data){
                    this.setState({
                        orgList: res.data.data
                    })
                }
               

            })
        }



    }
   
    handleSubmit = (type) => {
       
        this.props.form.validateFieldsAndScroll((err, values) => {

            values.meetTime = this.state.inputMeetTime;
            let data = {
                ...values,
                meetingTime:dataUtil.Dates().formatTimeString(values.meetingTime),
                projectId:this.props.projectId,
                orgId:parseInt(values.orgId),
            }
          
            if (!err) {
                //添加会议
                let url = dataUtil.spliceUrlParams(meetingAdd,{"startContent": "项目【"+ this.props.projectName +"】"});
                axios.post(url, data, true).then(res => {
                   if(type=="go"){
                    this.props.form.resetFields();
                    this.props.addData(res.data.data)
                   }else{
                    this.props.form.resetFields();
                    this.props.handleCancel()
                    this.props.addData(res.data.data)
                   }
                })
            }
        });
    }

    getDatePicker = (date, dateString) => {
        this.setState({
            inputMeetTime: dateString
        })
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
        const formLayout = {
            labelCol: {
                sm: { span: 4 }
            },
            wrapperCol: {
                sm: { span: 20 }
            }
        }

        return (
            <div className={style.main}>
                <Modal
                    title={this.props.modelTitle}
                    visible={true}
                    onCancel={this.props.handleCancel}
                    footer={null}
                    width="850px"
                    centered={true}
                    mask={false}
                    maskClosable={false}
                    className={style.addFormInfo}
                    footer={
                        <div className="modalbtn">

                            <SubmitButton key={3} onClick={this.handleSubmit.bind(this,"go")} content={intl.get("wsd.global.btn.saveandcontinue")} />
                            <SubmitButton key={2} onClick={this.handleSubmit.bind(this,"new")} type="primary" content={intl.get("wsd.global.btn.preservation")} />
                        </div>
                    }
                >
                    <div className={style.addcontentBox}>
                        <Form onSubmit={this.handleSubmit}>
                            <div className={style.content}>
                                <Row >
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meeting.title')} {...formItemLayout}>
                                            {getFieldDecorator('title', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.title'),
                                                }],
                                            })(
                                                <Input maxLength={66}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingtype')} {...formItemLayout}>
                                            {getFieldDecorator('meetingType', {

                                                rules: [],
                                            })(
                                                <Select onDropdownVisibleChange={this.getTypeList}>
                                                    {this.state.typeList && this.state.typeList.map(item => {
                                                        return <Option value={item.value} key={item.value}>{item.title}</Option>
                                                    })}
                                                </Select>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row > <Col span={12}>
                                    <Form.Item label={intl.get('wsd.i18n.comu.meeting.projectname')} {...formItemLayout}>
                                        {getFieldDecorator('projectId', {
                                            initialValue:this.props.projectName? this.props.projectName :null,
                                            rules: [],
                                        })(
                                            <Input disabled/>
                                        )}
                                    </Form.Item>
                                </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.plan.plandefine.orgname')} {...formItemLayout}>
                                            {getFieldDecorator('orgId', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.plan.plandefine.orgname'),
                                                }],
                                            })(

                                                //  <Input    onFocus={this.getOrgList}/>
                                                <TreeSelect

                                                    style={{ width: "100%" }}
                                                    onFocus={this.getOrgList}
                                                    treeData={this.state.orgList}
                                                    // allowClear
                                                    treeDefaultExpandAll

                                                />
                                            )}
                                        </Form.Item>
                                    </Col>

                                </Row>
                                <Row >

                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meeting.meettime')} {...formItemLayout}>
                                            {getFieldDecorator('meetingTime', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.meettime'),
                                                }],
                                            })(
                                                <DatePicker style={{ width: '100%' }} onChange={this.getDatePicker} />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingaddress')} {...formItemLayout}>
                                            {getFieldDecorator('meetingAddress', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.comu.meeting.meetingaddress'),
                                                }],
                                            })(
                                                <Input maxLength={66}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetinguser')} {...formItemLayout}>
                                            {getFieldDecorator('meetingUser', {

                                                rules: [],
                                            })(
                                                <Input maxLength={33}/>
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row > <Col span={24}>
                                    <Form.Item label={intl.get('wsd.i18n.comu.meeting.meetingremark')} {...formLayout}>
                                        {getFieldDecorator('meetingRemark', {

                                            rules: [],
                                        })(
                                            <TextArea maxLength={66}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                </Row>
                            </div>

                        </Form>
                    </div>
                    {/* <AddInfo /> */}
                </Modal>
            </div>
        )
    }
}

const Adds = Form.create()(Add)

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(Adds);
