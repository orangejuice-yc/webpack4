import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Modal, Switch } from 'antd';
import { connect } from 'react-redux'
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"

import axios from "../../../../api/axios"
import { querytaskbydefineid,addtmpltaskbydefineid } from "../../../../api/api"

export class BasicdTemplatedPlanAddTask extends Component {
    constructor(props) {
        super(props)
        this.state = {

            info: {

            }
        }
    }

    componentDidMount() {

    }



    handleSubmit = (type) => {
      
        const { intl } = this.props.currentLocale
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                let obj={
                    tmplName:values.tmplName,
                    isGlobal:values.isGlobal? 1:0,
                    defineId:this.props.addData.id,
                    planType:this.props.menuCode
                }
                axios.post(addtmpltaskbydefineid, obj, true,null,true).then(res=>{
                   
                    // axios.post(addtmpltaskbydefineid, obj, true,null,true).then(res => {
                    //     this.props.form.resetFields();
                    //     this.props.handleCancel()
                    // })
                        this.props.form.resetFields();
                        this.props.handleCancel()
                })
            }
        });
    }

    render() {
        const { intl } = this.props.currentLocale
        const {
            getFieldDecorator,
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
            <div className={style.main}>
                <Modal
                    className={style.formMain}
                    width="850px"
                    mask={false}
                    maskClosable={false}
                    centered={true}
                    title={intl.get("wsd.i18n.base.addtempl.title")}
                    visible={true} onCancel={this.props.handleCancel}
                    footer={
                        <div className="modalbtn">
                            <SubmitButton key={2} onClick={this.handleSubmit.bind(this, "new")} type="primary" content={intl.get("wsd.global.btn.preservation")} />
                        </div>
                    }>
                    <Form onSubmit={this.handleSubmit}>
                        <div className={style.content}>

                            <Row >
                                <Col span={12}>
                                    <Form.Item label={intl.get('wsd.i18n.base.planTem.name')} {...formItemLayout}>
                                        {getFieldDecorator('tmplName', {

                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.enter') + intl.get('wsd.i18n.base.planTem.name'),
                                            }],
                                        })(
                                            <Input maxLength={66}/>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label={intl.get('wsd.i18n.base.planTem.isglobal1')} {...formItemLayout}>
                                        {getFieldDecorator('isGlobal', {
                                              valuePropName: 'checked',
                                              initialValue: false,
                                        })(
                                            <Switch checkedChildren={intl.get("wsd.i18n.base.coderulde.open")} unCheckedChildren={intl.get("wsd.i18n.base.coderulde.close")}  />
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
const BasicdTemplatedPlanAddTasks = Form.create()(BasicdTemplatedPlanAddTask);

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(BasicdTemplatedPlanAddTasks);
