
import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button, Icon, Select, DatePicker, Modal } from 'antd';
import axios from "../../../../api/axios"
import { addEquipType } from "../../../../api/api"

import { connect } from 'react-redux'


const FormItem = Form.Item;
class MenuInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {

            visible: true,
            info: {


            }
        }
    }

    componentDidMount() {

    }


    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    handleOk = (e) => {
        this.setState({
            visible: false,
        });
        this.props.handleCancel()
    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
        this.props.handleCancel()
    }
    handleSubmit = (e) => {
        e.preventDefault();
      
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.props.resource == "equip") {
                    //新增同级
                    if (this.props.type == "same") {
                        let data
                        //有选择数据
                        if (!this.props.data) {
                            data = {
                                ...values,
                                parentId: 0,
                            }

                        } else {
                            
                            data = {
                                ...values,
                                parentId: this.props.data.parentId,
                            }
                        }

                        axios.post(addEquipType, data, true).then(res => {
                            this.props.addType(res.data.data)
                            this.props.form.resetFields();
                            this.props.handleCancel()
                        })
                        return
                    } else {
                        //新增下级
                        let data = {
                            ...values,
                            parentId: this.props.data.id,
                        }
                        axios.post(addEquipType, data, true).then(res => {
                            this.props.form.resetFields();
                            this.props.addType(res.data.data)
                            this.props.handleCancel()
                        })
                        return
                    }
                }
            }
        });
    }
    handleSubmit1 = (e) => {
        e.preventDefault();
      
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.props.resource == "equip") {
                    //新增同级
                    if (this.props.type == "same") {
                        let data
                        //有选择数据
                        if (!this.props.data) {
                            data = {
                                ...values,
                                parentId: 0,
                            }

                        } else {
                            
                            data = {
                                ...values,
                                parentId: this.props.data.parentId,
                            }
                        }

                        axios.post(addEquipType, data, true).then(res => {
                            this.props.addType(res.data.data)
                            this.props.form.resetFields();
                            
                        })
                        return
                    } else {
                        //新增下级
                        let data = {
                            ...values,
                            parentId: this.props.data.id,
                        }
                        axios.post(addEquipType, data, true).then(res => {
                            this.props.form.resetFields();
                            this.props.addType(res.data.data)
                           
                        })
                        return
                    }
                }
            }
        });
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

        return (

            <div >

                <Modal title={this.props.title + "类别"} visible={this.state.visible}
                    className={style.main}
                    onOk={this.handleOk} onCancel={this.handleCancel}
                    okText="确定"
                    cancelText="取消"
                    width="800px"
                    footer={
                        <div className="modalbtn">
                            <Button key={2} onClick={this.handleSubmit} type="primary" ghost>保存</Button>
                            <Button key={3} onClick={this.handleSubmit1} type="primary">保存并继续</Button>
                        </div>
                    }
                >
                    <div className={style.ResAddModal}>
                        <Form onSubmit={this.handleSubmit}>
                            <div className={style.content}>
                                <Row type="flex">
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrcname')} {...formItemLayout}>
                                            {getFieldDecorator('typeName', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={intl.get('wsd.i18n.rsrc.rsrclist.rsrccode')} {...formItemLayout}>
                                            {getFieldDecorator('typeCode', {

                                                rules: [{
                                                    required: true,
                                                    message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
                                                }],
                                            })(
                                                <Input />
                                            )}
                                        </Form.Item>
                                    </Col>
                                </Row>


                            </div>
                        </Form>
                    </div>
                </Modal>
            </div>
        )
    }
}
const MenuInfos = Form.create()(MenuInfo);
const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(MenuInfos);