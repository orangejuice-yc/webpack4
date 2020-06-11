import React, { Component } from 'react'
import style from './style.less'
import { Button, Form, Row, Col, Input } from 'antd'
import axios from '@/api/axios'
import {updateDeviceHoisting} from '../../../../api/suzhou-api'

const { Item } = Form
const { TextArea } = Input
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
export class QualityInspectionInfo1 extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  handleOk = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {title, remark} = values
        const {id} = this.props.rightData
        axios.put(updateDeviceHoisting(), {id, title, remark}).then(res => {
          this.props.handleModifyOk({...this.props.rightData, title, remark})
        })
      }
    })
  }
  
  render() {
    const { getFieldDecorator } = this.props.form
    const { title, remark, sgdw, jldw ,hoistTime} = this.props.rightData
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.handleOk}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key='title'>
                  <Item {...formItemLayout} label='标题' >
                    {getFieldDecorator("title", {
                      rules: [
                        {
                          required: true,
                          message: '请输入标题',
                        },
                      ],
                      initialValue: title
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key='sgdw'>
                  <Item {...formItemLayout} label='施工单位' >
                    {getFieldDecorator("sgdw", {
                      initialValue: sgdw
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                {/* <Col span={12} key='jldw'>
                  <Item {...formItemLayout} label='监理单位' >
                    {getFieldDecorator("jldw", {
                      initialValue: jldw
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col> */}
                <Col span={12} key='hoistTime'>
                  <Item label='吊装日期' {...formItemLayout}>
                    {getFieldDecorator("hoistTime",{
                      initialValue:hoistTime,
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
              <Row key={3}>
                <Col span={24} key='remark'>
                  <Item label='备注说明' {...formItemLayout1}>
                    {getFieldDecorator("remark", {
                      initialValue: remark
                    })(
                      <TextArea rows={2} disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Item wrapperCol={{ offset: 4 }}>
                <Button
                  className="globalBtn"
                  htmlType="submit"
                  onClick={this.handleOk}
                  style={{ marginRight: 20 }}
                  type="primary"
                  disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('HOIST_EDIT-HOIST-MANAGE')==-1?true:false):true}
                >保存
                </Button>
                <Button className="globalBtn" onClick={this.props.closeRightBox}>取消</Button>
              </Item>
            </div>
          </Form>
        </div>
      </div>
    )
  }
}

const QualityInspectionInfo = Form.create({name: 'QualityInspectionInfo'})(QualityInspectionInfo1)
export default QualityInspectionInfo
