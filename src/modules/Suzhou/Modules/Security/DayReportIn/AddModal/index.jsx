import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {selectChoseOrg,selectChoseRole} from '../../../../api/suzhou-api';
import notificationFun from '@/utils/notificationTip';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";


export class AddModal extends Component{
    constructor(props){
        super(props);
        this.state={
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
            rateFlag:'D',//
        }
    }
    componentDidMount(){
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
            obj.code = i;
            obj.name = i+'号';
            arr.push(obj);
        }
        this.setState({
            rateMonth:arr
        })
    }
    handleSubmit = (val,e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                if(values.type != 'D' && !values.rate3 && !values.rate){
                    notificationFun('提示','请选择上报日期')
                }else{
                    values.rate = values.rate3? moment(values.rate3).format('YYYY-MM-DD'):values.rate;
                    values.zrDwIds = values.zrDwIds.join(',');
                    values.zrRoleIds = values.zrRoleIds.join(',');
                    if (val == 'save') {
                        this.props.submit(values, 'save' );
                    } else {
                        this.props.submit(values, 'goOn' );
                        this.props.form.resetFields();
                    }
                }
            }
        })
    }
    //选择上报周期
    selectType = (val)=>{
        this.setState({
            rateFlag:val
        })
    }
    render(){
        const { intl } = this.props.currentLocale
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
        const {rateFlag} = this.state;
        return(
            <div>
                <Modal className={style.main}
                width="850px"
                afterClose={this.props.form.resetFields}
                mask={false}
                maskClosable={false}
                footer={<div className="modalbtn">
                    {/* 保存并继续 */}
                    <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>{intl.get('wsd.global.btn.saveandcontinue')}</Button>
                    {/* 保存 */}
                    <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">{intl.get('wsd.global.btn.preservation')}</Button>
                </div>}
                centered={true} title={'新增'} visible={this.props.modalVisible}
                onCancel={this.props.handleCancel}>
                    <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
                        <Row>
                            <Col span={12}>
                                <Form.Item label={'工作事项'} {...formItemLayout}>
                                    {getFieldDecorator('title', {
                                    rules: [{
                                        required: true,
                                        message: '请输入工作事项'
                                    }],
                                    })(
                                    <Input />,
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'责任单位'} {...formItemLayout}>
                                    {getFieldDecorator('zrDwIds', {
                                    rules: [{
                                        required: true,
                                        message: '请输入责任单位'
                                    }],
                                    })(
                                        <Select mode="multiple" showSearch optionFilterProp="children">
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
                                    rules: [{
                                        required: true,
                                        message: '请输入责任岗位'
                                    }],
                                    })(
                                        <Select mode="multiple">
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
                                <Form.Item label={'提醒规则'} {...formItemLayout}>
                                    {getFieldDecorator('txRule', {
                                    rules: [{
                                        required: true,
                                        message: '请输入提醒规则'
                                    }],
                                    })(
                                        <Select>
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
                                <Form.Item label={'重复周期'} {...formItemLayout}>
                                    {getFieldDecorator('type', {
                                    rules: [{
                                        required: true,
                                        message: '请输入重复周期'
                                    }],
                                    })(
                                       <Select onChange={this.selectType}>
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
                                    rules: [],
                                    })(
                                        <Select>
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
                                        rules: [],
                                    })(
                                        <Select>
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
                                        rules: [],
                                    })(
                                        <DatePicker style={{ width: '100%' }} />
                                    )}
                                </Form.Item>
                            </Col>
                            ):null}
                        </Row>
                    </Form>
                </Modal>
            </div>
        )
    }
}
const AddModals = Form.create()(AddModal);
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(AddModals);