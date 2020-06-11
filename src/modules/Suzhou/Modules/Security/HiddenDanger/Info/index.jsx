import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateTrouble,inspectionListNoPage,queryTroubleInfo} from '../../../../api/suzhou-api';
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
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        axios.get(queryTroubleInfo(id)).then(res => {
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
              axios.put(updateTrouble, data, true).then(res => {
                this.props.updateSuccess(res.data.data);
              });
      
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
                            <Form.Item label={'标段名称'} {...formItemLayout}>
                                {getFieldDecorator('sectionName', {
                                initialValue: this.state.info.sectionName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入标段名称',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'标段号'} {...formItemLayout}>
                                {getFieldDecorator('sectionCode', {
                                initialValue: this.state.info.sectionCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入标段号',
                                }],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'隐患编号'} {...formItemLayout}>
                                {getFieldDecorator('troubleCode', {
                                initialValue: this.state.info.troubleCode,
                                rules: [{ 
                                    required: true,
                                    message:'请输入隐患编号',
                                }],
                                })(
                                <Input/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'隐患名称'} {...formItemLayout}>
                                {getFieldDecorator('troubleTitle', {
                                    initialValue: this.state.info.troubleTitle,
                                rules: [{ 
                                    required: true,
                                    message:'请输入隐患名称',
                                }],
                                })(
                                <Input />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'隐患部位'} {...formItemLayout}>
                                {getFieldDecorator('troubleBw', {
                                    initialValue: this.state.info.troubleBw,
                                    rules: [{ 
                                        required: true,
                                        message:'请选择隐患部位',
                                    }],
                                })(
                                    <Input />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'填报单位'} {...formItemLayout}>
                                {getFieldDecorator('tbUnit', {
                                    initialValue: this.state.info.tbUnit,
                                rules: [{ 
                                    required: true,
                                    message:'请输入填报单位',
                                }],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'是否解决'} {...formItemLayout}>
                                {getFieldDecorator('isFinsih', {
                                    initialValue: this.state.info.isFinsihVo?this.state.info.isFinsihVo.code.toString():'0',
                                rules: [{ 
                                    required: true,
                                    message:'请输入是否解决',
                                }],
                                })(
                                    <Select>
                                        <Option key={'1'} value={'1'}>是</Option>
                                        <Option key={'0'} value={'0'}>否</Option>
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'创建人'} {...formItemLayout}>
                                {getFieldDecorator('creater', {
                                    initialValue: this.state.info.creater,
                                rules: [{ 
                                    required: true,
                                    message:'请输入创建人',
                                }],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'创建时间'} {...formItemLayout}>
                                {getFieldDecorator('creatTime', {
                                    initialValue: this.state.info.creatTime,
                                rules: [{ 
                                    required: true,
                                    message:'请输入创建时间',
                                }],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} style={{ width: "100px", marginLeft: "20px" }} type='primary'
                    disabled={this.props.permission.indexOf('HIDDENDANGER_EDIT-HIDDENDANGER')==-1?true:false}>保存</Button>
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