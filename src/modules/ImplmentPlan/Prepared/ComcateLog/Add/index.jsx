import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, Button,Modal,Select} from 'antd';
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import { addQuestionList ,getdictTree,getQuestionInfo,updateQuestionList} from '../../../../../api/api'
import * as dataUtil from "../../../../../utils/dataUtil";
import SubmitButton from "../../../../../components/public/TopTags/SubmitButton"
const FormItem = Form.Item;
const Option = Select.Option
const {TextArea} = Input;
//新增项目团队弹框
class AddQuestion extends Component {
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

    getData = () => {
        axios.get(getQuestionInfo(this.props.record.id)).then(res => {
            this.setState({
                info: res.data.data
            })
        })
    }

    componentDidMount() {
        if(this.props.modaltype=="modify"){
            this.getData()
        }
        
     
    }
    //获取问题类型
    getQuestionTypeList=()=>{
        if (!this.state.questionTypeList) {
            axios.get(getdictTree("plan.question.type")).then(res => {
              if (res.data.data) {
                this.setState({
                    questionTypeList: res.data.data
                })
              }
            })
          }
    }
    handleSubmit = (val) => {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                if (this.props.modaltype == 'add') {

                    let data = {
                        ...values,
                        projectId: this.props.data.projectId,
                        defineId: this.props.data.defineId,
                        taskId: this.props.data.id
                    }
                    axios.post(addQuestionList, data, true).then(res => {

                        this.props.addData(res.data.data)
                        if (val == 'save') {
                            this.props.handleCancel()
                        } else if (val == 'goOn') {
                            this.props.form.resetFields()
                        }
                    })
                } else if (this.props.modaltype == 'modify') {
                    let data = {
                        ...values,
                        id: this.props.record.id
                    }
                    axios.put(updateQuestionList, data, true).then(res => {
                        this.props.updateQuestion(res.data.data);
                        this.props.handleCancel();
                    })
                }

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
                    title={this.props.modaltype=="modify"? "修改问题":"新增问题"} visible={true}
                    onOk={this.handleOk} onCancel={this.props.handleCancel}
                    mask={false}
                    maskClosable={false}
                    width="850px"
                    footer={
                        <div className="modalbtn">
                            {this.props.modaltype === 'modify' ?
                                <SubmitButton key={4} onClick={this.props.handleCancel} content="取消" />
                                :
                                <SubmitButton key={3} onClick={this.handleSubmit.bind(this, 'goOn')} content="保存并继续" />
                            }
                            <SubmitButton key={2} onClick={this.handleSubmit.bind(this, 'save')} type="primary" content="保存" />
                        </div>
                    }
                >
                    <Form onSubmit={this.handleSubmit} className={style.info}>
                        <div className={style.content}>
                            <Row type="flex">
                                <Col span={24}>
                                    <Form.Item label="问题类型" {...formItemLayout1}>
                                        {getFieldDecorator('questionType', {
                                            initialValue: this.state.info.questionType ? this.state.info.questionType.id : null,
                                            rules: [{
                                                required: true,
                                                message: intl.get('wsd.i18n.message.select') + "问题类型",
                                            }],
                                        })(
                                            <Select onDropdownVisibleChange={this.getQuestionTypeList}>
                                                {this.state.questionTypeList ? this.state.questionTypeList.map(item => {
                                                    return (
                                                        <Option key={item.value} value={item.value}> {item.title} </Option>
                                                    )
                                                }) : this.state.info.questionType &&
                                                    <Option key={this.state.info.questionType.id} value={this.state.info.questionType.id}> {this.state.info.questionType.name} </Option>
                                                }
                                            </Select>
                                        )}
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="内容" {...formItemLayout1}>
                                        {getFieldDecorator('content', {
                                            initialValue: this.state.info.content,
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
const AddQuestions = Form.create()(AddQuestion);
export default connect(state => ({
    currentLocale: state.localeProviderData
}))(AddQuestions)
