import React, { Component } from 'react';
import { Form, Row, Col, Input, Button, InputNumber, Select, DatePicker, Checkbox, message } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import {updateRcReport,queryRcReportInfo,selectChoseOrg,selectChoseRole} from '../../../../api/suzhou-api';
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
            orgOption:[],//责任单位
            roleOption:[],//责任角色
            txRuleOption:[
                {id:1,code:'1',name:'前一天'},{id:2,code:'3',name:'前三天'},{id:3,code:'7',name:'前一周'}
            ],
            reportType:[
                {id:1,code:"D",name:'每天'},{id:2,code:"W",name:'每周'},{id:3,code:"M",name:'每月'},{id:4,code:"S",name:'不重复'},
            ],
            rateMonth:[],//上报日期月
            rateWeek:[
                {id:1,code:'1',name:'周一'},{id:2,code:'2',name:'周二'},{id:3,code:'3',name:'周三'},
                {id:4,code:'4',name:'周四'},{id:5,code:'5',name:'周五'},{id:6,code:'6',name:'周六'},{id:7,code:'7',name:'周日'},
            ],//上报日期周
            rateFlag:'D',
            editPermission:''
        }
    }
    //获取菜单基本信息
    getData = (id) => {
        // 请求获取info数据
        axios.get(queryRcReportInfo(id)).then(res => {
            this.setState({
                info: res.data.data,
                rateFlag:res.data.data && res.data.data.typeVo ?res.data.data.typeVo.code:'D',
            });
        });
    };
    componentDidMount() {
        this.props.rightData ? this.getData(this.props.rightData.id) : null;
        const {viewType,projectId} = this.props;
        if(viewType == '1' && !projectId){
            notificationFun('提示','请选择项目')
        }else{
            axios.get(selectChoseOrg,{params:{viewType,projectId}}).then(res=>{
                this.setState({
                    orgOption:res.data.data
                })
            })
            axios.get(selectChoseRole,{params:{viewType,projectId}}).then(res=>{
                this.setState({
                    roleOption:res.data.data
                })
            });
        }
        const arr = [];
        for(let i = 1;i < 31;i++){
            let obj = {};
            obj.id = i;
            obj.code = i+'';
            obj.name = i+'号';
            arr.push(obj);
        }
        this.setState({
            rateMonth:arr
        })
        let menuCode = this.props.menuCode
        if(menuCode=='SECURITY-DAYREPORTIN'){
          this.setState({
            editPermission:'DAYREPORTIN_RC-REPORT-IN',
            
          })
        }else if(menuCode=='SECURITY-DAYREPORTOUT'){
          this.setState({
            editPermission:'DAYREPORTOUT_EDIT-DAYREPORT-OUT',
            
          })
        }
    }
    handleSubmit = (e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if(values.type != 'D' && !values.rate3 && !values.rate){
                    notificationFun('提示','请选择上报日期')
                }else{
                    values.rate = values.rate3? moment(values.rate3).format('YYYY-MM-DD'):values.rate;
                    values.zrDwIds = values.zrDwIds.join(',');
                    values.zrRoleIds = values.zrRoleIds.join(',');
                    const data = {
                        ...values,
                        id:this.props.rightData.id,
                    };
                    // 更新菜单
                    axios.put(updateRcReport, data, true).then(res => {
                        this.props.updateSuccess(res.data.data);
                    });
                }
            }
        });
    }
    //选择上报周期
    selectType = (val)=>{
        this.setState({
            rateFlag:val
        })
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
        const {rateFlag,editPermission} = this.state;
        console.log('editPermission',editPermission)
        return(
            <LabelFormLayout title={this.props.title}>
                <Form onSubmit={this.handleSubmit}>
                    <Row>
                        <Col span={12}>
                            <Form.Item label={'编号'} {...formItemLayout}>
                                {getFieldDecorator('code', {
                                initialValue: this.state.info.code,
                                rules: [],
                                })(
                                <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'工作事项'} {...formItemLayout}>
                                {getFieldDecorator('title', {
                                initialValue: this.state.info.title,
                                rules: [
                                    {required: true,message: '请输入工作事项'}
                                ],
                                })(
                                <Input disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}/>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'责任单位'} {...formItemLayout}>
                                {getFieldDecorator('zrDwIds', {
                                    initialValue: this.state.info.zrDwInfo?this.state.info.zrDwInfo.map((item)=>{
                                    return item.id
                                }):[],
                                rules: [{required: true,message:'请输入责任单位'}],
                                })(
                                    <Select mode="multiple" disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                        {this.state.orgOption.length && this.state.orgOption.map((item,i)=>{
                                            return(
                                                <Option key={item.id} value={item.id}>{item.orgName}</Option>
                                            )
                                        })}
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'责任岗位'} {...formItemLayout}>
                                {getFieldDecorator('zrRoleIds', {
                                initialValue: this.state.info.zrRoleInfo?this.state.info.zrRoleInfo.map((item)=>{
                                    return item.id
                                }):[],                                
                                rules: [{required: true,message:'请输入责任角色'}],
                                })(
                                    <Select mode="multiple" disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                        {this.state.roleOption.length && this.state.roleOption.map((item,i)=>{
                                            return(
                                                <Option key={item.id} value={item.id}>{item.roleName}</Option>
                                            )
                                        })}
                                    </Select>,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'重复周期'} {...formItemLayout}>
                                {getFieldDecorator('type', {
                                initialValue: this.state.info.typeVo?this.state.info.typeVo.code.toString():'D',
                                rules: [{required: true,message:'请输入重复周期'}],
                                })(
                                    <Select onChange={this.selectType} disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                        {this.state.reportType.length && this.state.reportType.map((item,i)=>{
                                            return(
                                                <Option key={item.id} value={item.code}>{item.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        {rateFlag == 'W'?(
                            <Col span={12} >
                                <Form.Item label={'上报日期'} {...formItemLayout}>
                                    {getFieldDecorator('rate', {
                                        initialValue:this.state.info.typeVo.code=='W'?this.state.info.rate.toString():'1',
                                    rules: [],
                                    })(
                                        <Select disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                            {this.state.rateWeek.length && this.state.rateWeek.map((item,i)=>{
                                                return(
                                                    <Option key={item.id} value={item.code}>{item.name}</Option>
                                                )
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            ):null}
                            {rateFlag == 'M'?(
                                <Col span={12}>
                                <Form.Item label={'上报日期'} {...formItemLayout}>
                                    {getFieldDecorator('rate', {
                                    initialValue:this.state.info.typeVo.code=='M'?this.state.info.rate.toString():'1',
                                        rules: [],
                                    })(
                                        <Select disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                            {this.state.rateMonth.length && this.state.rateMonth.map((item,i)=>{
                                                return(
                                                    <Option key={item.id} value={item.code}>{item.name}</Option>
                                                )
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            ):null}
                            {rateFlag == 'S'? (
                                <Col span={12}>
                                    <Form.Item label={'上报日期'} {...formItemLayout}>
                                        {getFieldDecorator('rate3', {
                                        initialValue: this.state.info.rate ?dataUtil.Dates().formatDateMonent(this.state.info.rate):'',
                                            rules: [],
                                        })(
                                            <DatePicker style={{ width: '100%' }} disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true} />
                                        )}
                                    </Form.Item>
                                </Col>
                                ):null}
                        <Col span={12}>
                            <Form.Item label={'提醒规则'} {...formItemLayout}>
                                {getFieldDecorator('txRule', {
                                    initialValue: this.state.info.txRuleVo? this.state.info.txRuleVo.code.toString():'1',
                                    rules: [{required: true,message:'请输入提醒规则'}],
                                })(
                                    <Select disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?false:true}>
                                        {this.state.txRuleOption.length && this.state.txRuleOption.map((item,i)=>{
                                            return(
                                                <Option key={item.id} value={item.code}>{item.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'下发人员'} {...formItemLayout}>
                                {getFieldDecorator('initiatorName', {
                                    initialValue: this.state.info.xfrName,
                                rules: [],
                                })(
                                    <Input disabled />,
                                )}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={'下发时间'} {...formItemLayout}>
                                {getFieldDecorator('initTime', {
                                    initialValue: this.state.info.xfSj,
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
                    <Button onClick={this.handleSubmit} disabled={this.props.rightData.statusVo && this.props.rightData.statusVo.code=='0'?(this.props.permission.indexOf(editPermission)==-1?true:false):true} style={{ width: "100px", marginLeft: "20px" }} type='primary'>保存</Button>
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