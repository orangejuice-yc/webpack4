import React, { Component } from 'react'
import { Modal, Form, Row, Col, Input, Button, TreeSelect ,Select,DatePicker} from 'antd'
import axios from '@/api/axios';
import style from './style.less';
import { getsectionId, addDeviceForensics } from '../../../../api/suzhou-api'
import * as dataUtil from "../../../../../../utils/dataUtil";
const { Item } = Form
const { TextArea } = Input

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

class AddForm1 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      flag: true,
      treeData: [],
      sectionId:'',
      isPay:'',
      isForensics:'',
      subcontrType:['是','否'],
      reasonShow:false
    }
  }
  componentWillReceiveProps({ visibleModal, projectId }) {
    const {flag} = this.state
    if (visibleModal && projectId && flag) {
      this.setState({flag: false})
      axios.get(getsectionId(this.props.projectId)).then(res => {
        const { data } = res.data;
        this.setState(() => ({ treeData: this.treeFunMap(data) }));
        if (this.state.treeData.length > 0) {
          const { id , code} = this.state.treeData[0];
          this.props.form.setFieldsValue({ sectionId: id });
          this.setState({
            sectionId: code,
            firstSection:!res.data.data?'':res.data.data[0].value,
          });
        }
      });
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
  changeValue = (value)=>{
    if(value == '是'){
      return '1'
    }else if(value == '否'){
      return '0'
    }
  }
  handleOk = (type, e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {deviceName,deviceCode,deviceNum,location,sectionCode,reason} = values          
        const isPay = this.changeValue(values.isPay)
        const isForensics = this.changeValue(values.isForensics)
        const sectionId = sectionCode
        const projectId = this.props.projectId
        const checkTime = dataUtil.Dates().formatTimeString(values.checkTime).substr(0,10)
        axios.post(addDeviceForensics(), {projectId, sectionId, deviceName,deviceCode,deviceNum,location,isPay,isForensics,reason,checkTime}).then(res => {
          this.props.handleModalOk(res.data.data, type)
          this.props.form.setFieldsValue({
            sectionCode: '',
            deviceName:'',
            deviceCode:'',
            deviceNum:0,
            location:'',
            isPay:'',
            isForensics:'',
            reason:'',
            checkTime:''
          })
        })
      }
    })
  }
  handleSelectChange=(value)=>{
    if(value==='是'){
      this.setState({reasonShow:true})
      this.props.form.setFieldsValue({
        reason: '',
      });
    }else{
      this.setState({reasonShow:false})
    }
  }
  render() {
    const { visibleModal, handleModalCancel } = this.props
    const { treeData } = this.state
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="新增"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModal}
        onCancel={handleModalCancel}
        footer={
          <div className="modalbtn">
            {/* 保存并继续 */}
            <Button key={1} onClick={this.handleOk.bind(this, 'goOn')}>保存并继续</Button>
            {/* 保存 */}
            <Button key={2} onClick={this.handleOk.bind(this, 'save')} type="primary">保存</Button>
          </div>
        }
      >
        <Form {...formLayout} onSubmit={this.handleOk} className={style.mainScorll}>
          <Row key={1}>
            <Col span={12} key='sectionCode'>
              <Form.Item label='选择标段' {...formItemLayout}>
                {getFieldDecorator("sectionCode", {
                  initialValue:this.state.firstSection,
                  rules: [
                    {
                      required: true,
                      message: '请选择标段名称',
                    },
                  ]
                })(
                  <TreeSelect
                    style={{ width: 258 }}
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    allowClear
                    treeDefaultExpandAll
                    placeholder="请选择标段名称"
                    treeData={treeData}
                    onChange={(...args) => {
                      const [, , node] = args;
                      if (node.triggerNode) {
                        this.setState({ sectionId: node.triggerNode.props.code });
                      } else {
                        this.setState({ sectionId: '' });
                      }
                    }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
                    <Form.Item label="标段号" {...formItemLayout}>
                      <Input disabled={true} value={this.state.sectionId} />
                    </Form.Item>
                  </Col>            
          </Row>
          <Row>
          <Col span={12} key='deviceName'>
              <Form.Item label='设备名称' {...formItemLayout}>
                {getFieldDecorator("deviceName", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备名称',
                    },
                  ]
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
            <Col span={12} key='deviceCode'>
              <Form.Item label='设备编码' {...formItemLayout}>
                {getFieldDecorator("deviceCode", {
                  rules: [
                    {
                      required: true,
                      message: '请输入设备编码',
                    },
                  ]
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
            </Row>
            <Row>
          <Col span={12} key='deviceNum'>
              <Form.Item label='设备数量' {...formItemLayout}>
                {getFieldDecorator("deviceNum", {
                  rules: [
                    {
                      required: true,
                      message: '请输入数量',
                    },
                  ]
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
            <Col span={12} key='isPay'>
              <Form.Item label='是否交付' {...formItemLayout}>
                {getFieldDecorator("isPay", {
                  rules: [
                    {
                      required: true,
                      message: '请输入是否交付',
                    },
                  ]
                })(
                  <Select placeholder="是否交付" >
                          {this.state.subcontrType.map((item,index) => (
                            <Option value={item} key={index}>
                              {item}
                            </Option>
                          ))}
                        </Select>
                )}
              </Form.Item>
            </Col>
            </Row>
            <Row>
          <Col span={12} key='location'>
              <Form.Item label='位置' {...formItemLayout}>
                {getFieldDecorator("location", {
                  rules: [
                    {
                      required: true,
                      message: '请输入位置',
                    },
                  ]
                })(
                  <Input />
                )}
              </Form.Item>
            </Col>
            <Col span={12} key='isForensics'>
              <Form.Item label='是否验收' {...formItemLayout}>
                {getFieldDecorator("isForensics", {
                  rules: [
                    {
                      required: true,
                      message: '请输入是否验收',
                    },
                  ]
                })(
                  <Select placeholder="是否验收" onChange={this.handleSelectChange}>
                          {this.state.subcontrType.map((item,index) => (
                            <Option value={item} key={index}>
                              {item}
                            </Option>
                          ))}
                        </Select>
                )}
              </Form.Item>
            </Col>
            </Row>
            <Row >
            <Col span={12} key='checkTime'>
              <Item label='取证日期' {...formItemLayout}>
                {getFieldDecorator("checkTime",{
                  rules: [
                    {
                      required: true,
                      message: '请选择日期',
                    },
                  ]
                })(
                  <DatePicker format='YYYY-MM-DD' style={{width:'100%'}}/>
                )}
              </Item>
            </Col>
          </Row>
            <Row >
            <Col span={24} key='reason'>
              <Item label='原因' {...formItemLayout1}>
                {getFieldDecorator("reason",{
                  rules: [
                    {
                      required: !this.state.reasonShow,
                      message: '请输入原因',
                    },
                  ]
                })(
                  <TextArea rows={2} disabled={this.state.reasonShow}/>
                )}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    )
  }
}

const AddForm = Form.create({name: 'AddForm'})(AddForm1)
export default AddForm