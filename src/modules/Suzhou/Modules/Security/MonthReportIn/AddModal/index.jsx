import React, { Component } from 'react';
import {Modal,Form,Row,Col,Input,Button,Icon,Select,DatePicker,Slider,InputNumber,message,Checkbox,TreeSelect} from 'antd';
import moment from 'moment';
import style from './style.less';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { curdCurrentData } from '../../../../../../store/curdData/action';
import axios from '../../../../../../api/axios';
import {getsectionId} from '../../../../api/suzhou-api';
const { TextArea } = Input;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
import PublicButton from "../../../../../../components/public/TopTags/PublicButton";
import * as dataUtil from "../../../../../../utils/dataUtil";
import {getSelectTreeArr} from "@/modules/Suzhou/components/Util/firstLoad";


export class AddModal extends Component{
    constructor(props){
        super(props);
        this.state={
        }
    }
    componentDidMount(){
    }
    handleSubmit = (val,e)=>{
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err){
                values.year = moment(values.searchTime).format('YYYY');
                values.month = moment(values.searchTime).format('YYYY-MM').substr(5,2);
                if (val == 'save') {
                    this.props.submit(values, 'save' );
                } else {
                    this.props.submit(values, 'goOn' );
                    this.props.form.resetFields();
                }
            }
        })
    }
    render(){
        const { intl } = this.props.currentLocale
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;
        const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 4 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
        };
        return(
            <div>
                <Modal className={style.main}
                width="600px"
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
                            <Col span={24}>
                                <Form.Item label={'年月'} {...formItemLayout}>
                                    {getFieldDecorator('searchTime', {
                                    rules: [{
                                        required: true,
                                        message: '请输入年月'
                                    }],
                                    })(
                                    <DatePicker.MonthPicker style={{width:"100%"}}/>,
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