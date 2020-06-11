import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {roleList} from '@/api/api';
import {subjectTemplateGroup,getMenuCode} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";
import {getSelectTreeArr} from "@/modules/Suzhou/components/Util/firstLoad";
import SelectSection from '@/modules/Suzhou/components/SelectSection';

export class AddModal extends Component{
    constructor(props){
        super(props);
        this.state={
            ratersOption:[],//评分人员
            groupOption:[],//模块
            moduleOption:[],//菜单
        }
    }
    componentDidMount(){
        axios.get(roleList).then(res=>{
            if(res.data.data){
                this.setState({ratersOption:res.data.data})
            }
        })
        axios.get(subjectTemplateGroup).then(res=>{
            if(res.data.data){
                this.setState({groupOption:res.data.data})
            }
        })
    }
    handleSubmit = (val,e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                const data = {
                    ...values,
                    groupTitle:this.state.groupTitle,
                    moduleTitle:this.state.moduleTitle,
                    raters:values.raters.join(),
                }
                if (val == 'save') {
                    this.props.submit(data, 'save' );
                } else {
                    this.props.submit(data, 'goOn' );
                    this.props.form.resetFields();
                }
            }
        })
    }
    // 获取菜单
    getGroup=(selectedKeys, info,e)=>{
        this.props.form.setFieldsValue({
            'moduleCode': '',
        })
        this.setState({groupTitle:info.props.children})
        axios.get(getMenuCode(info.props.value)).then(res=>{
            if(res.data.data){
                this.setState({moduleOption:res.data.data});
            }
        })
    }
    getModule=(selectedKeys, info,e)=>{
        this.setState({moduleTitle:info.props.children})
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
        return(
            <div>
                <Modal className={style.main}
                width="850px"
                afterClose={this.props.form.resetFields}
                mask={false}
                maskClosable={false}
                footer={<div className="modalbtn">
                    {/*保存继续 */}
                    <Button key={1} onClick={this.handleSubmit.bind(this, 'goOn')}>{intl.get('wsd.global.btn.saveandcontinue')}</Button>
                    {/* 保存 */}
                    <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">{intl.get('wsd.global.btn.preservation')}</Button>
                </div>}
                centered={true} title={this.props.title} visible={this.props.visible}
                onCancel={this.props.handleCancel}>
                    <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
                        <Row>
                            <Col span={12}>
                                <Form.Item label={'分组名称'} {...formItemLayout}>
                                    {getFieldDecorator('groupCode', {
                                        initialValue:'',
                                    rules: [{
                                        required: true,
                                        message: '请输入分组名称'
                                    }],
                                    })(
                                        <Select onSelect={this.getGroup}>
                                        {
                                            this.state.groupOption.length && this.state.groupOption.map((item,i)=>{
                                                return(
                                                    <Option key={item.menuCode} value={item.menuCode}>{item.menuName}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'业务模块'} {...formItemLayout}>
                                    {getFieldDecorator('moduleCode', {
                                    initialValue:'',
                                    rules: [{
                                        required: true,
                                        message: '请输入业务模块'
                                    }],
                                    })(
                                        <Select onSelect={this.getModule}>
                                        {
                                            this.state.moduleOption.length && this.state.moduleOption.map((item,i)=>{
                                                return(
                                                    <Option key={item.menuCode} value={item.menuCode}>{item.menuName}</Option>
                                                )
                                            })
                                        }
                                    </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={'评分人员'} {...formItemLayout1}>
                                    {getFieldDecorator('raters', {
                                    // initialValue:'',
                                    rules: [{
                                        required: true,
                                        message: '请输入评分人员'
                                    }],
                                    })(
                                        <Select mode="multiple">
                                            {
                                            this.state.ratersOption.length && this.state.ratersOption.map((item,i) => {
                                                return (
                                                <Option key={item.id} value={item.id}>{item.roleName}</Option>
                                                )
                                            })
                                            }
                                        </Select>,
                                    )}
                                </Form.Item>
                            </Col>
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