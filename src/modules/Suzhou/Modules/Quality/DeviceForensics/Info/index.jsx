import React, { Component } from 'react'
import style from './style.less'
import { Button, Row, Col, Input, Form ,Select} from 'antd'
import {updateDeviceForensics,queryDeviceForensicsById} from '../../../../api/suzhou-api'
import axios from '@/api/axios'

const { TextArea } = Input
const { Item } = Form
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

export class QualityInspectionInfo1 extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info:{},
      isPayCode:'',
      isForensicsCode:'',
      subcontrType:['是','否'],
      reasonShow:''
    }
  }
  getData = (id) => {
    // 请求获取info数据
    axios.get(queryDeviceForensicsById(id)).then(res => {
      this.setState({
        info: res.data.data,
        isForensicsCode:res.data.data.isForensicsVo.name,
        isPayCode:res.data.data.isPayVo.name
      });
      if(res.data.data.isForensicsVo.name=='是'){
        this.setState({
          reasonShow:true
        });
      }
    });
  };
  componentDidMount(){
    this.props.rightData ? this.getData(this.props.rightData.id): null;
  }
  changeValue = (value)=>{
    if(value == '是'){
      return '1'
    }else if(value == '否'){
      return '0'
    }
  }
  submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {deviceName,deviceCode,deviceNum,location,reason} = values
        const isPay = this.changeValue(values.isPay)
        const isForensics = this.changeValue(values.isForensics)
        const {id} = this.props.rightData
        axios.put(updateDeviceForensics(), {id, deviceName,deviceCode,deviceNum,location, isPay,isForensics,reason}).then(res => {
          this.props.updateSuccess({...this.props.rightData, deviceName,deviceCode,deviceNum,location, isPay,isForensics,reason})
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
    const {  sectionName, projectName,sgdw,jldw,deviceName,deviceCode,deviceNum,location, isPayVo,isForensicsVo,reason,checkTime} = this.state.info
    // let {code:isPayCode} = isPayVo
    // let {code:isForensicsCode} = isForensicsVo
    const { getFieldDecorator } = this.props.form
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.submit}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key='projectName'>
                  <Item label='项目名称' {...formItemLayout}>
                    {getFieldDecorator("projectName", {
                      initialValue: projectName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key='sectionName'>
                  <Item label='标段名称' {...formItemLayout}>
                    {getFieldDecorator("sectionName", {
                      initialValue: sectionName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={2} >
                <Col span={12} key='sgdw'>
                  <Item label='施工单位' {...formItemLayout}>
                    {getFieldDecorator("sgdw", {
                      initialValue: sgdw,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key='jldw'>
                  <Item label='监理单位' {...formItemLayout}>
                    {getFieldDecorator("jldw", {
                      initialValue: jldw,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={3}>
                <Col span={12} key='deviceName'>
                  <Item label='设备名称' {...formItemLayout}>
                    {getFieldDecorator("deviceName", {
                      rules: [
                        {
                          required: true,
                          message: '请输入设备名称',
                        },
                      ],
                      initialValue: deviceName,
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>
                    )}
                  </Item>
                </Col>
                <Col span={12} key='deviceCode'>
                  <Item label='设备编码' {...formItemLayout}>
                    {getFieldDecorator("deviceCode", {
                      rules: [
                        {
                          required: true,
                          message: '请输入设备编码',
                        },
                      ],
                      initialValue: deviceCode,
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={4}>
                <Col span={12} key='deviceNum'>
                  <Item label='设备数量' {...formItemLayout}>
                    {getFieldDecorator("deviceNum", {
                      rules: [
                        {
                          required: true,
                          message: '请输入数量',
                        },
                      ],
                      initialValue: deviceNum,
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}  />
                    )}
                  </Item>
                </Col>
                <Col span={12} key='location'>
                  <Item label='位置' {...formItemLayout}>
                    {getFieldDecorator("location", {
                      initialValue: location,
                      rules: [
                        {
                          required: true,
                          message: '请输入位置',
                        },
                      ]
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}  />                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={5}>
                <Col span={12} key='isPayVo'>
                  <Item label='是否交付' {...formItemLayout}>
                    {getFieldDecorator("isPay", {
                      initialValue: this.state.isPayCode,
                      rules: [
                        {
                          required: true,
                          message: '请输入是否交付',
                        },
                      ]
                    })(
                      <Select  
                      disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}>
                          {this.state.subcontrType.map((item,index) => (
                            <Option value={item} key={index}>
                              {item}
                            </Option>
                          ))}
                        </Select>
                    )}
                  </Item>
                </Col>
              <Col span={12} key='isForensicsVo'>
              <Form.Item label='是否验收' {...formItemLayout}>
                {getFieldDecorator("isForensics", {
                  initialValue: this.state.isForensicsCode,
                  rules: [
                    {
                      required: true,
                      message: '请输入是否验收',
                    },
                  ]
                })(
                  <Select onChange={this.handleSelectChange}
                  disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}>
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
          <Row key={7}>
            <Col span={12} key='checkTime'>
              <Item label='取证日期' {...formItemLayout}>
                {getFieldDecorator("checkTime",{
                  initialValue: checkTime,
                  rules: [
                    {
                      required: true,
                      message: '请选择日期',
                    },
                  ]
                })(
                  <Input disabled/>
                )}
              </Item>
            </Col>
          </Row>
          <Row key={6}>
            <Col span={24} key='reason'>
              <Item label='原因' {...formItemLayout1}>
                {getFieldDecorator("reason", {
                  initialValue: reason,
                  rules: [
                    {
                      required: !this.state.reasonShow,
                      message: '请输入原因',
                    },
                  ]
                })(
                  <TextArea rows={2} disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.state.reasonShow==false?false:true):true}/>
                )}
              </Item>
            </Col>
          </Row>
              <Form.Item wrapperCol={{ offset: 4 }}>
                <Button
                  className="globalBtn"
                  htmlType="submit"
                  style={{ marginRight: 20 }}
                  type="primary"
                  disabled = {(((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || ( this.props.taskFlag))?false:true)||this.props.permission.indexOf('DEVICEFORENSICS_EDIT-SPEDEVICEACCEPT')==-1}
                >保存
                </Button>
                <Button className="globalBtn" onClick={this.props.closeRightBox}>取消</Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    )
  }
}
const QualityInspectionInfo = Form.create({name: 'QualityInspectionInfo'})(QualityInspectionInfo1)
export default QualityInspectionInfo
