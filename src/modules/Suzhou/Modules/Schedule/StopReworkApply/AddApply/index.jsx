import React, { Component } from 'react'
import { Form, Modal, Row, Col, Input, TreeSelect, Select ,DatePicker} from 'antd'
import { getsectionId, addStopRework } from '../../../../api/suzhou-api'
import axios from '@/api/axios'
import SelectSection from '@/modules/Suzhou/components/SelectSection';
import * as dataUtil from "@/utils/dataUtil";
const { Item } = Form
const { TextArea } = Input
const { Option } = Select

class AddApply1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      treeData: [],
      flag: true
    }
  }

  componentWillReceiveProps({ visibleModal, projectId }) {
    const {flag} = this.state
    if (visibleModal && projectId && flag) {
      this.setState({flag: false})
      // axios.get(getsectionId(projectId)).then(res => {
      //   const { data } = res.data;
      //   this.setState(() => ({ treeData: this.treeFunMap(data) }));
      // });
    }
  }

  treeFunMap = arr => {
    for (let i = 0; i < arr.length; i++) {
      arr[i].title = arr[i].name;
      arr[i].value = arr[i].id;
      if (arr[i].children) {
        this.treeFunMap(arr[i].children);
      }
    }
    this.setState({data: arr})
    return arr;
  }

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {sectionId, applyNum, contract, content, type, remark} = values
        const {projectId} = this.props
        const stopReworkDate=dataUtil.Dates().formatTimeString(values.stopReworkDate).substr(0,10)
        axios.post(addStopRework(), {projectId, sectionId, applyNum, contract, content, type, applyType: '0', remark,stopReworkDate}).then(res => {
          this.props.handleModalOk(res.data.data)
        })
      }
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { treeData } = this.state
    return (
      <Modal
        title="新增"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={this.props.visibleModal}
        onOk={this.handleOk}
        onCancel={this.props.handleModalCancel}
      >
        <Form {...formLayout}>
          <Row key={1}>
            <Col span={12} key='sectionId'>
              <Item label='选择标段' {...formItemLayout}>
                {getFieldDecorator("sectionId", {
                  rules: [
                    {
                      required: true,
                      message: '请选择标段名称',
                    },
                  ]
                })(
                  <SelectSection
                      projectId={this.props.projectId}
                      callBack={({ sectionId ,sectionCode}) => {
                          this.props.form.setFieldsValue({ sectionId});
                          this.setState({sectionCode})
                      }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  <Input disabled={true} value={this.state.sectionCode} />
                </Form.Item>
            </Col>
            <Col span={12} key='applyNum'>
              <Item {...formItemLayout} label='申请编号' >
                {getFieldDecorator('applyNum',{
                  rules:[
                    {
                      required:true,
                      message:"请输入申请编号"
                    },
                    {
                      pattern: /^[\_a-zA-Z0-9\-]+$/,
                      message: '可输入字符"0-9 a-z A-Z - _"',

                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='type'>
              <Item {...formItemLayout} label='类别' >
                {getFieldDecorator('type',{
                  rules:[{
                    required:true,
                    message:"请选择类别"
                  }],
                  initialValue: "0",
                })(
                  <Select style={{ width: 255 }}>
                    <Option value="1">复工</Option>
                    <Option value="0">停工</Option>
                  </Select>
                )}
              </Item>
            </Col>
            <Col span={12} key='contract'>
              <Item {...formItemLayout} label='合同号' >
                {getFieldDecorator('contract',{
                  rules:[
                    {
                      required:true,
                      message:"请输入合同号"
                    },
                    {
                      pattern: /^[\_a-zA-Z0-9\-]+$/,
                      message: '可输入字符"0-9 a-z A-Z - _"',
  
                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
            </Col>
            <Col span={12} key='stopReworkDate'>
                <Item label='停复工日期' {...formItemLayout}>
                  {getFieldDecorator("stopReworkDate",{
                    rules: [
                      {
                        required: true,
                        message: '请选择时间',
                      },
                    ]
                  })(
                    <DatePicker format='YYYY-MM-DD' style={{width:'100%'}}/>
                  )}
                </Item>
              </Col>
          </Row>
          <Row key={5}>
            <Col span={24} key='content'>
              <Item label='申请内容说明' {...formItemLayout1}>
                {getFieldDecorator('content',{
                  rules:[{
                    required:true,
                    message:"请输入申请内容说明"
                  }]
                })(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
          </Row>
          <Row key={6}>
            <Col span={24} key='remark'>
              <Item label='备注' {...formItemLayout1}>
                {getFieldDecorator('remark',{})(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}
const formLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
}
const formItemLayout1 = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 20},
  },
}
const AddApply = Form.create({name: 'AddApply'})(AddApply1)

export default AddApply