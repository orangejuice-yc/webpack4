import React, { Component } from 'react'
import style from './style.less'
import { Button, Row, Col, Input, Form } from 'antd'
import { updateDeviceCheck ,queryDeviceCheckInfo} from '../../../../api/suzhou-api'
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
      info:{}
    }
  }
  getData = (id) => {
    // 请求获取info数据
    axios.get(queryDeviceCheckInfo(id)).then(res => {
      this.setState({
        info: res.data.data,
      });
    });
  };
  componentDidMount(){
    this.props.rightData ? this.getData(this.props.rightData.id): null;
  }
  submit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {title, remark} = values
        const {id} = this.props.rightData
        axios.put(updateDeviceCheck(), {id, title, remark}).then(res => {
          this.props.updateSuccess({...this.props.rightData, title, remark})
        })
      }
    })
  }
  render() {
    const { title, remark, sectionName, sgdw, jldw, sectionCode ,checkTime} = this.state.info
    const { getFieldDecorator } = this.props.form
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.submit}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key='sectionName'>
                  <Item label='选择标段' {...formItemLayout}>
                    {getFieldDecorator("sectionName", {
                      initialValue: sectionName,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
                <Col span={12} key='sectionCode'>
                  <Item label='标段号' {...formItemLayout}>
                    {getFieldDecorator("sectionCode", {
                      initialValue: sectionCode,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                <Col span={12} key='title'>
                  <Item label='标题' {...formItemLayout}>
                    {getFieldDecorator("title", {
                      rules: [
                        {
                          required: true,
                          message: '请输入标题',
                        },
                      ],
                      initialValue: title,
                    })(
                      <Input disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>
                    )}
                  </Item>
                </Col>
                <Col span={12} key='sgdw'>
                  <Item label='施工单位' {...formItemLayout}>
                    {getFieldDecorator("sgdw", {
                      initialValue: sgdw,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col>
              </Row>
              <Row key={3}>
                {/* <Col span={12} key='jldw'>
                  <Item label='监理单位' {...formItemLayout}>
                    {getFieldDecorator("jldw", {
                      initialValue: jldw,
                    })(
                      <Input disabled={true} />
                    )}
                  </Item>
                </Col> */}
                <Col span={12} key='checkTime'>
                  <Item label='报验日期' {...formItemLayout}>
                    {getFieldDecorator("checkTime",{
                      initialValue:checkTime,
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
              <Row key={4}>
                <Col span={24} key='remark'>
                  <Item label='备注说明' {...formItemLayout1}>
                    {getFieldDecorator("remark", {
                      initialValue: remark,
                    })(
                      <TextArea rows={2} disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?false:true}/>
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
                  disabled = {((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.taskFlag))?(this.props.permission.indexOf('INSPECTION_EDIT-DEVICE-INSPECT')==-1?true:false):true}
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
