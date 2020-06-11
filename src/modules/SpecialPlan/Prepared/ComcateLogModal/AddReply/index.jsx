import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Modal, Select } from 'antd';
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import { addquesttionReply, updatequesttionReply, getdictTree, getquesttionReplyInfo, updateQuestionList } from '../../../../../api/api';
import * as dataUtil from "../../../../../utils/dataUtil";
const FormItem = Form.Item;
const Option = Select.Option
const { TextArea } = Input;
//新增项目团队弹框
class AddReply extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visible: true,
            addRecord: null,
            modifyRecord: null,
            data: null,
            info: {
            }
        }
    }



    componentDidMount() {
        //判断是新增表单还是修改表单

        this.getCommonReplyList();
    }
    //获取常用回复
    getCommonReplyList = () => {
        if (!this.state.commonReplyList) {
            axios.get(getdictTree("plan.question.commreply")).then(res => {
                if (res.data.data) {
                    this.setState({
                        commonReplyList: res.data.data
                    })
                }
            })
        }
    }


    //常用回复与回复联动事件
    changeContent = (value, option) => {
        this.props.form.setFieldsValue({ ["content"]: value });
    }
    handleSubmit = (val, e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {


                let data = {
                    ...values,
                    questionId: this.props.record.id,
                }
                axios.post(addquesttionReply, data, true).then(res => {

                    this.props.addReply(res.data.data)
                    if (val == 'save') {
                        this.props.handleCancel()
                    } else if (val == 'goOn') {
                        this.props.form.resetFields()
                    }
                })

            }
        });
    }

    render() {
        const { intl } = this.props.currentLocale;
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
            <div >
                <Modal className={style.main}
                    title="新增回复" visible={true}
                    onOk={this.handleOk} onCancel={this.props.handleCancel}
                    mask={false}
                    maskClosable={false}
                    width="850px"
                    footer={
                        <div className="modalbtn">

                            <Button key={3} onClick={this.handleSubmit.bind(this, 'goOn')} >保存并继续</Button>

                            <Button key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary" >保存</Button>
                        </div>
                    }
                >
                    <Form onSubmit={this.handleSubmit} className={style.info}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={24}>
                                    <Form.Item label="常用回复" {...formItemLayout1}>
                                        {getFieldDecorator('commonReply', {
                                            initialValue: this.state.commonReplyList ? this.state.commonReplyList[0].title : "",
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + "常用回复",
                                            }],
                                        })(
                                            <Select onChange={this.changeContent}>
                                                {this.state.commonReplyList && this.state.commonReplyList.map(item => {
                                                    return (
                                                        <Option key={item.value} value={item.title}> {item.title} </Option>
                                                    )
                                                })}
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="内容" {...formItemLayout1}>
                                        {getFieldDecorator('content', {
                                            initialValue: this.state.commonReplyList ? this.state.commonReplyList[0].title : "",
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + "内容",
                                            }],
                                        })(
                                            <TextArea />
                                        )}
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </Modal>

            </div>
        )
    }
}
const AddReplys = Form.create()(AddReply);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(AddReplys)
