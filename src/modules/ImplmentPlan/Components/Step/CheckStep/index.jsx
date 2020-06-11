import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, Select, InputNumber } from 'antd';
import style from './style.less'
import { connect } from 'react-redux'
import axios from '../../../../../api/axios'
import { getBaseSelectTree } from '../../../../../api/api'
import { getPlanTaskStepInfo_, addPlanTaskStep_, updatePlanTaskStep_ } from '../../../../../api/suzhou-api'
import * as dataUtil from "../../../../../utils/dataUtil"

const Option = Select.Option

export class PlanTaskStepAdd extends Component {
  constructor(props) {
    super(props)
    this.state = {
      unitList: [],
      estWsList: [],
    }
  }


  componentDidMount() {
    this.getBaseSelectTree("comm.unit");
    this.getBaseSelectTree("comm.estwt");
    if (this.props.type == 'add') {
      return
    }
    axios.get(getPlanTaskStepInfo_(this.props.data.id)).then(res => {
      const data = res.data.data || {};
      this.setState({
        info: data
      })
    })
  }

  handleSubmit = (val, e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, fieldsValue) => {
      if (!err) {
        let estwt = fieldsValue['estwt']
        estwt = parseFloat(estwt)
        const values = {
          ...fieldsValue,
          relationTaskId: this.props.relationTaskId,
          sourceTaskId: this.props.sourceTaskId,
          code: this.state.info ? this.state.info.code : new Date(),
          id : this.props.data ? this.props.data.id : ''
        }

        if (this.props.type == 'add') {
          let url = dataUtil.spliceUrlParams(addPlanTaskStep_, { "startContent": this.props.projectName });
          axios.post(url, values, true, null, true).then(res => {
            if (val == 'goOn') {
              // 清空表单项
              this.props.addData(res.data.data)
              this.props.form.resetFields()
            } else if (val == 'save') {
              if (this.props.type == 'add') {
                this.props.addData(res.data.data)
              } else if (this.props.type == 'modify') {
                this.props.update(res.data.data)
              }
              // 关闭弹窗
              this.props.handleCancel()
            }
          })
        } else if (this.props.type == 'modify') {
          let url = dataUtil.spliceUrlParams(updatePlanTaskStep_, { "startContent": this.props.projectName });
          axios.put(url, values, true, null, true).then(res => {
            this.props.update(res.data.data)
            // 关闭弹窗
            this.props.handleCancel()
          })
        }
      }
    })
  }

  // 获取下拉框字典
  getBaseSelectTree = (typeCode) => {
    axios.get(getBaseSelectTree(typeCode)).then(res => {
      const { data } = res.data
      // 初始化字典-计量单位
      if (typeCode == 'comm.unit') {
        this.setState({
          unitList: data
        })
      }
      // 初始化字典-计划-计划类型
      if (typeCode == 'comm.estwt') {
        this.setState({
          estWsList: data
        })
      }
    })
  }




  render() {
    const { intl } = this.props.currentLocale;
    let formData = {}
    /*
     * getFieldDecorator 用于和表单进行双向绑定
     * getFieldError 获取某个输入控件的 Error
     * getFieldsError 获取一组输入控件的 Error ，如不传入参数，则获取全部组件的 Error
     * getFieldsValue 获取一组输入控件的值，如不传入参数，则获取全部组件的值
     * isFieldTouched 判断一个输入控件是否经历过 getFieldDecorator 的值收集时机 options.trigger
     * getFieldValue 获取一个输入控件的值
     * isFieldsTouched 判断是否任一输入控件经历过 getFieldDecorator 的值收集时机 options.trigger
     */
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
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
    const formItemLayout2 = {
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
      <div className={style.main}>
        <Modal className={style.formMain}
          width="850px" centered={true} title={this.props.title} visible={true} onCancel={this.props.handleCancel}
          mask={false}
          maskClosable={false}

          footer={
            <div className="modalbtn">

              {this.props.type == "add" &&
                <div>
                  <Button key="submit1" onClick={this.handleSubmit.bind(this, 'goOn')}>
                    {intl.get("wsd.global.btn.saveandcontinue")}
                  </Button>
                  <Button key="submit2" type="primary" onClick={this.handleSubmit.bind(this, 'save')}>
                    {intl.get("wsd.global.btn.preservation")}
                  </Button>
                </div>
              }
              {this.props.type == "modify" &&
                <div>
                  <Button key="submit1" onClick={this.props.handleCancel}>
                    {intl.get("wsd.global.btn.cancel")}
                  </Button>
                  <Button key="submit2" type="primary" onClick={this.handleSubmit.bind(this, 'save')}>
                    {intl.get("wsd.global.btn.preservation")}
                  </Button>
                </div>
              }
            </div>}>
          <Form onSubmit={this.handleSubmit}>
            <div className={style.content}>
              <Row type="flex">
                <Col span={12}>
                  <Form.Item label={"工序名称"} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('name', {
                        initialValue: this.state.info ? this.state.info.name : '',
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + '工序名称',
                        }],
                      })(
                        <Input maxLength={100} />
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={"设计总量"} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('totalDesign', {
                        initialValue: this.state.info ? this.state.info.totalDesign : '',
                        rules: [{
                          required: true,
                          message: intl.get('wsd.i18n.message.enter') + '设计总量',
                        }],
                      })(
                        <InputNumber style={{width:'100%'}}/>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={"计量单位"} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('unit', {
                        initialValue: this.state.info ? this.state.info.unit.id : '',
                        rules: [],
                      })(
                        <Select>
                          {this.state.unitList.length ? this.state.unitList.map(item => {
                            return (
                              <Option key={item.id} value={item.value}> {item.title} </Option>
                            )
                          }) : null}
                        </Select>
                      )}
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={"权重"} {...formItemLayout}>
                    <div className={style.list}>
                      {getFieldDecorator('estwt', {
                        initialValue: this.state.info ? this.state.info.estwt : '',
                        rules: [],
                      })(
                        <Select>
                          {this.state.estWsList.length ? this.state.estWsList.map(item => {
                            return (
                              <Option key={item.id} value={item.value}> {item.title} </Option>
                            )
                          }) : null}
                        </Select>
                      )}
                    </div>
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

const PlanTaskStepAdds = Form.create()(PlanTaskStepAdd);
export default connect(state => ({
  currentLocale: state.localeProviderData
}))(PlanTaskStepAdds);
