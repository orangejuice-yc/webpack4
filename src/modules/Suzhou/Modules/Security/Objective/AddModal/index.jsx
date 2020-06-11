import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {updObjectTemplate} from '../../../../api/suzhou-api';
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
            riskLevel:[],//风险等级
        }
    }
    componentDidMount(){
        !this.props.record?null:this.setState({info:this.props.record});
    }
    handleSubmit = (val,e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                console.log(values);
                const data = {
                    ...values,
                    id:this.props.record.id
                }
                axios.put(updObjectTemplate, data, true).then(res => {
                    this.props.getListData(this.props.rightData.id);
                    this.props.handleCancel();
                });
            }
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
        return(
            <div>
                <Modal className={style.main}
                width="850px"
                afterClose={this.props.form.resetFields}
                mask={false}
                maskClosable={false}
                footer={<div className="modalbtn">
                    {/* 取消 */}
                    <Button key={1} onClick={this.props.handleCancel}>取消</Button>
                    {/* 保存 */}
                    <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary">{intl.get('wsd.global.btn.preservation')}</Button>
                </div>}
                centered={true} title={this.props.title} visible={this.props.visible}
                onCancel={this.props.handleCancel}>
                    <Form onSubmit={this.handleSubmit} className={style.mainScorll}>
                        <Row>
                            <Col span={24}>
                                <Form.Item label={'违规行为'} {...formItemLayout1}>
                                    {getFieldDecorator('checkTitle', {
                                        initialValue:(!this.state.info || !this.state.info.checkTitle)?null:this.state.info.checkTitle,
                                    rules: [{
                                        required: true,
                                        message: '请输入违规行为'
                                    }],
                                    })(
                                    <TextArea rows={2} />,
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={'扣分标准'} {...formItemLayout}>
                                    {getFieldDecorator('deductionStandard', {
                                    initialValue:(!this.state.info || !this.state.info.deductionStandard)?null:this.state.info.deductionStandard,
                                    rules: [{
                                        required: true,
                                        message: '请输入扣分标准'
                                    }],
                                    })(
                                    <InputNumber style={{width:'100%'}} min={0} max={100} />
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