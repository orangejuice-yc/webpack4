import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateDangerProject,queryMonthReportInfo} from '../../../../api/suzhou-api';
import axios from '../../../../../../api/axios';
import * as dataUtil from "../../../../../../utils/dataUtil"
import style from './style.less';
// 布局
import LabelFormLayout from "@/components/public/Layout/Labels/Form/LabelFormLayout"
import LabelFormButton from "@/components/public/Layout/Labels/Form/LabelFormButton"
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
class SortInfo extends Component {
    constructor(props){
        super(props);
        this.state={
            info:{},
            riskLevel:[],//风险等级
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        axios.get(queryMonthReportInfo(id)).then(res => {
            this.setState({
                info: res.data.data,
            });
        });
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
            //   axios.put(updateDangerProject, data, true).then(res => {
            //     this.props.updateSuccess(res.data.data);
            //   });
      
            }
        });
    }
    render(){
        const {intl} = this.props.currentLocale;
        const {getFieldDecorator, getFieldsError, getFieldError, isFieldTouched} = this.props.form;
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
        return(
            <LabelFormLayout title={this.props.title}>
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={'文档编号'} {...formItemLayout}>
                                {getFieldDecorator('code', {
                                initialValue: this.state.info.code,
                                rules: [],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'文档标题'} {...formItemLayout}>
                                {getFieldDecorator('title', {
                                initialValue: this.state.info.title,
                                rules: [],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'年份'} {...formItemLayout}>
                                {getFieldDecorator('year', {
                                initialValue: this.state.info.year,
                                rules: [{ 
                                    required: true,
                                    message:'请输入年份',
                                }],
                                })(
                                <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'月份'} {...formItemLayout}>
                                {getFieldDecorator('month', {
                                initialValue: this.state.info.month,
                                rules: [],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'部门'} {...formItemLayout}>
                                {getFieldDecorator('company', {
                                    initialValue: this.state.info.company,
                                    rules: [],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'上报人员'} {...formItemLayout}>
                                {getFieldDecorator('initiatorName', {
                                    initialValue: this.state.info.initiatorName,
                                rules: [],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'上报日期'} {...formItemLayout}>
                                {getFieldDecorator('initTime', {
                                    initialValue: this.state.info.initTime,
                                rules: [],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit}  style={{ width: "100px", marginLeft: "20px" }} type='primary'
                    // disabled={this.props.permission.indexOf('MONTHREPORTIN_MO-REPORT-IN')==-1?true:false}
                    disabled>保存</Button>
                </LabelFormButton>
            </LabelFormLayout>
        )
    }
}
const SortInfos = Form.create()(SortInfo);
export default connect(state => ({
  currentLocale: state.localeProviderData
}), {
    curdCurrentData,
  })(SortInfos);