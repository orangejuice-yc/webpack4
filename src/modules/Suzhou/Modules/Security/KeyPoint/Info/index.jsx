import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updatekeyPointAccept,keyPointAcceptInfo,getBaseSelectTree} from '../../../../api/suzhou-api';
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
            keyPointOption:[], //关键节点类别
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        axios.get(keyPointAcceptInfo(id)).then(res => {
            this.setState({
                info: res.data.data,
            });
        });
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
        axios.get(getBaseSelectTree("szxm.aqgl.keyPointCategory")).then((res)=>{
            this.setState({
              keyPointOption:res.data.data
            })
        });
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            values.initiateTime = values.initiateTime?dataUtil.Dates().formatTimeString(values.initiateTime).substr(0,10):"";
            values.acceptTime = values.acceptTime?dataUtil.Dates().formatTimeString(values.acceptTime).substr(0,10):"";
            if (!err) {
              const data = {
                ...values,
                id:this.props.rightData.id,
              };
              // 更新菜单
              axios.put(updatekeyPointAccept, data, true).then(res => {
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
                            <Form.Item label={'单位工程名称'} {...formItemLayout}>
                                {getFieldDecorator('projectBuildName', {
                                    initialValue: this.state.info.projectBuildName,
                                rules: [{ 
                                    required: true,
                                    message:'请输入单位工程名称',
                                }],
                                })(
                                <Input disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'关键节点类别'} {...formItemLayout}>
                                {getFieldDecorator('keyPointCategory', {
                                initialValue: this.state.info.keyPointCategoryVo?this.state.info.keyPointCategoryVo.code.toString():'0',
                                rules: [{ 
                                    required: true,
                                    message:'请输入关键节点类别',
                                }],
                                })(
                                    <Select disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}>
                                        {
                                        this.state.keyPointOption.length && this.state.keyPointOption.map((item,i) => {
                                            return (
                                            <Option key={item.value} value={item.value}>{item.title}</Option>
                                            )
                                        })
                                        }
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'施工单位'} {...formItemLayout}>
                                {getFieldDecorator('sgdw', {
                                    initialValue:this.state.info.sgdw,
                                    rules: [],
                                })(
                                    <Input disabled/>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'监理单位'} {...formItemLayout}>
                                {getFieldDecorator('jldw', {
                                    initialValue:this.state.info.jldw,
                                rules: [],
                                })(
                                    <Input disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'发起时间'} {...formItemLayout}>
                                {getFieldDecorator('initiateTime', {
                                    initialValue: this.state.info.initiateTime?dataUtil.Dates().formatDateMonent( this.state.info.initiateTime):'',
                                rules: [],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'验收时间'} {...formItemLayout}>
                                {getFieldDecorator('acceptTime', {
                                    initialValue: this.state.info.acceptTime?dataUtil.Dates().formatDateMonent( this.state.info.acceptTime):'',
                                rules: [{ 
                                    required: true,
                                    message:'请输入创建时间',
                                }],
                                })(
                                    <DatePicker style={{ width: '100%' }} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={'自评意见'} {...formItemLayout1}>
                                {getFieldDecorator('selfComment', {
                                initialValue: this.state.info.selfComment,
                                rules: [],
                                })(
                                <TextArea rows={2} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
                <LabelFormButton>
                    <Button onClick={this.props.closeRightBox} style={{ width: "100px" }}>取消</Button>
                    <Button onClick={this.handleSubmit} disabled={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?(this.props.permission.indexOf('KEYPOINT_EDIT-KEYPOINT')==-1?true:false):true}  style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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