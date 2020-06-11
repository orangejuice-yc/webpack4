import React, { Component } from 'react'
import style from './style.less'
import { Form, Row, Col, Input, DatePicker, Select, Button } from 'antd'
import * as dataUtil from "@/utils/dataUtil"
import axios from '@/api/axios';
import {queryDeviceRecordInfo} from '../../../../api/suzhou-api'

const { Item } = Form
const {Option} = Select

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
export class QualityInspectionInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data:{} 
    }
  }
  render() {
    const {deviceCode, deviceName, typeVo, deviceType, deviceNum, deviceProducer, measurement, 
      constantCapacity, constantVoltage, deviceBirthday, deviceValidity, deviceCheckYear} = this.props.rightData;
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll}>
            <div className={style.content}>
              <Row key={1} type="flex">
                <Col span={12} key='deviceCode'>
                  <Item label='设备编码' {...formItemLayout}>
                    <Input disabled={true} value={deviceCode} />
                  </Item>
                </Col>
                <Col span={12} key='deviceName'>
                  <Item label='设备名称' {...formItemLayout}>
                    <Input disabled={true} value={deviceName} />
                  </Item>
                </Col>
              </Row>
              <Row key={2}>
                <Col span={12} key='typeVo'>
                  <Item label='是否特种设备' {...formItemLayout}>
                    <Select disabled={true} value={typeVo.code}>
                      <Option value="1">是</Option>
                      <Option value="0">否</Option>
                    </Select>
                  </Item>
                </Col>
                <Col span={12} key='deviceType'>
                  <Item label='规格型号' {...formItemLayout}>
                    <Input disabled={true} value={deviceType} />
                  </Item>
                </Col>
              </Row>
              <Row key={3}>
                <Col span={12} key='deviceNum'>
                  <Item label='数量' {...formItemLayout}>
                    <Input disabled={true} value={deviceNum} />
                  </Item>
                </Col>
                <Col span={12} key='measurement'>
                  <Item label='计量单位' {...formItemLayout}>
                    <Input disabled={true} value={measurement} />
                  </Item>
                </Col>
              </Row>
              <Row key={4}>
                <Col span={12} key='constantCapacity'>
                  <Item label='额定容量' {...formItemLayout}>
                    <Input disabled={true} value={constantCapacity} />
                  </Item>
                </Col>
                <Col span={12} key='constantVoltage'>
                  <Item label='额定电压' {...formItemLayout}>
                    <Input disabled={true} value={constantVoltage} />
                  </Item>
                </Col>
              </Row>
              <Row key={5}>
                <Col span={12} key='deviceProducer'>
                  <Item label='生产商' {...formItemLayout}>
                    <Input disabled={true} value={deviceProducer} />
                  </Item>
                </Col>
                <Col span={12} key='deviceBirthday'>
                  <Item label='设备生产日期' {...formItemLayout}>
                    <DatePicker disabled={true} style={{width: '100%'}} 
                      value={dataUtil.Dates().formatDateMonent(deviceBirthday)} />
                  </Item>
                </Col>
              </Row>
              <Row key={6}>
                <Col span={12} key='deviceValidity'>
                  <Item label='设备有效期' {...formItemLayout}>
                    <DatePicker disabled={true} style={{width: '100%'}}
                      value={dataUtil.Dates().formatDateMonent(deviceValidity)} />
                  </Item>
                </Col>
                <Col span={12} key='deviceCheckYear'>
                  <Item label='设备年检时间' {...formItemLayout}>
                    <DatePicker disabled={true} style={{width: '100%'}}
                      value={dataUtil.Dates().formatDateMonent(deviceCheckYear)} />
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
                  disabled={this.props.permission.indexOf('LEDGER_EDIT-DEVICE-ACCOUNT')==-1?true:false}
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

export default QualityInspectionInfo
