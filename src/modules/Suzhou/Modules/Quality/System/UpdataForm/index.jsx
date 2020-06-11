
import React, { Component } from 'react'
import { Form, Input, Row, Col, Select } from 'antd';
import axios from 'axios'
import { getBaseSelectTree } from '@/api/suzhou-api'
const { Option } = Select
/**
 * 增加和修改可共用一个 大致逻辑相同
 */
class FormComponent extends Component {
  state = {
    typeList: [ //未获取后台数据 测试数据
    //   {
    //     title: "单位工程",
    //     value: "单位工程",
    //     key:'单位工程12'
    //   },
    //   {
    //     title: "子单位工程",
    //     value:"子单位工程",
    //     key:'子单位工程12'
    //   },
    //   {
    //     title: "分部",
    //     value: "分部",
    //     key:'分部13'
    //   },
    //   {
    //     title: "子分部",
    //     value: "子分部",
    //     key:'子分部14'
    //   },
    //   {
    //     title:"分项",
    //     vaule:"分项",
    //     key:'分项15'
    //   }
    ]
  }
  //获取类别
  componentDidMount(){
    let _this = this
    axios.get(getBaseSelectTree('szxm.zlgl.systype')
    )
    .then(function (res) {
      _this.setState({
        typeList: res.data.data
      })
    })
  }
  render() {
    return (
      <Form {...formLayout}>
        <Row>
          <Col span={12}>
            <Form.Item label="名称" {...formItemLayout}>
              <Input disabled={false} defaultValue={this.props.UpdateList.unitName} onChange={this.props.getUnitName}  />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="类别" {...formItemLayout}>
              <Select disabled={false} defaultValue={this.props.UpdateList.name} dropdownStyle={{ maxHeight: 400, overflow: 'auto' }} onChange={this.props.getTypeNoVo}>
                {this.state.typeList && this.state.typeList.map(item => {
                  return <Option value={item.value} key={item.value}>{item.title}</Option>
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
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
};
const formLayout = {
  labelCol: {
    sm: { span: 4 },
  },
  wrapperCol: {
    sm: { span: 20 },
  },
};
export default FormComponent;