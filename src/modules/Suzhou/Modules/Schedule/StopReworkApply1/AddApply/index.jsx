import React, { Component } from 'react'
import { Form, Modal, Row, Col, Input, TreeSelect, Select ,DatePicker} from 'antd'
import { getsectionId, addStopRework,getBaseSelectTree,getProjInfoByOrgName} from '../../../../api/suzhou-api'
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
      flag: true,
      projectName:[],
      // getProjInfoByOrgName:[],
    }
  }
  componentDidMount(){
    axios.get(getBaseSelectTree("rework.projectName")).then((res)=>{
      this.setState({
        projectName:res.data.data
      })
    });
    // axios.get(getProjInfoByOrgName).then(res=>{
    //   this.setState({
    //     getProjInfoByOrgName:res.data.data
    //   })
    // })
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
        axios.post(addStopRework(), {applyType: this.props.applyType,...values,stopReworkDate}).then(res => {
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
            <Col span={12} key='projectDictCode'>
              <Item {...formItemLayout} label='项目名称' >
                {getFieldDecorator('projectDictCode',{
                  rules:[
                    {
                      required:true,
                      message:"请输入项目名称"
                    }
                  ]
                })(
                  <Select>
                        {
                          this.state.projectName.length && this.state.projectName.map((item,i) => {
                            return (
                              <Option key={item.value} value={item.value}>{item.title}</Option>
                            )
                          })
                        }
                      </Select>,
                )}
              </Item>
            </Col>
            <Col span={12} key='sectionName'>
              <Item {...formItemLayout} label='标段名称' >
                {getFieldDecorator('sectionName',{
                  rules:[
                    {
                      required:true,
                      message:"请输入标段号"
                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
            </Col>
            {/* <Col span={12} key='company'>
              <Item {...formItemLayout} label='单位名称' >
                {getFieldDecorator('company',{
                  initialValue:!this.state.getProjInfoByOrgName?'':this.state.getProjInfoByOrgName[0],
                  rules:[
                    {
                      required:true,
                      message:"请输入单位名称"
                    }
                  ]
                })(
                  (this.state.getProjInfoByOrgName.length == 0)?(
                    <Input />
                  ):(<Select>
                        {
                          this.state.getProjInfoByOrgName.length && this.state.getProjInfoByOrgName.map((item,i) => {
                            return (
                              <Option key={item} value={item}>{item}</Option>
                            )
                          })
                        }
                  </Select>)
                )}
              </Item>
            </Col> */}
            {/* <Col span={12} key='sectionId'>
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
            </Col> */}
            {/* <Col span={12} key='applyNum'>
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
            </Col> */}
            <Col span={12} key='type'>
              <Item {...formItemLayout} label='类别' >
                {getFieldDecorator('type',{
                  rules:[{
                    required:true,
                    message:"请选择类别"
                  }],
                  initialValue: "1",
                })(
                  <Select style={{ width: '100%'}}>
                    <Option value="1">复工</Option>
                    {/* <Option value="0">停工</Option> */}
                  </Select>
                )}
              </Item>
            </Col>
             <Col span={12} key='stopReworkDate'>
                <Item label='申请复工日期' {...formItemLayout}>
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
              <Col span={24} key='extend1'>
              <Item {...formItemLayout1} label='领导小组' >
                {getFieldDecorator('extend1',{
                  rules:[
                    {
                      required:true,
                      message:"请输入领导小组"
                    }
                  ]
                })(
                  <Input />
                )}
              </Item>
          </Col>
          <Col span={24} key='extend2'>
              <Item label='人员管控措施落实情况' {...formItemLayout1}>
                {getFieldDecorator('extend2',{
                  rules:[{
                    required:true,
                    message:"请输入人员管控措施落实情况"
                  }]
                })(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
            <Col span={24} key='extend3'>
              <Item label='现场防疫管理情况' {...formItemLayout1}>
                {getFieldDecorator('extend3',{
                  rules:[{
                    required:true,
                    message:"请输入现场防疫管理情况"
                  }]
                })(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
            <Col span={24} key='extend4'>
              <Item label='防疫物资准备情况' {...formItemLayout1}>
                {getFieldDecorator('extend4',{
                  rules:[{
                    required:true,
                    message:"请输入防疫物资准备情况"
                  }]
                })(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
            <Col span={24} key='extend5'>
              <Item label='现场安全管理' {...formItemLayout1}>
                {getFieldDecorator('extend5',{
                  rules:[{
                    required:true,
                    message:"请输入现场安全管理"
                  }]
                })(
                  <TextArea rows={2} />
                )}
              </Item>
            </Col>
            <Col span={24} key='extend6'>
              <Item label='教育交底工作' {...formItemLayout1}>
                {getFieldDecorator('extend6',{
                  rules:[{
                    required:true,
                    message:"请输入教育交底工作"
                  }]
                })(
                  <TextArea rows={2} />
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
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
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
    sm: {span: 6},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 18},
  },
}
const AddApply = Form.create({name: 'AddApply'})(AddApply1)

export default AddApply