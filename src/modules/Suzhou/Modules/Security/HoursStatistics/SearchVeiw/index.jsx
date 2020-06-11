import React, { Component } from 'react';
import { Icon, Row, Col, Popover } from 'antd';
import { Input, Form, Button, Select, DatePicker, TreeSelect } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import moment from 'moment';
import { formItemLayout, getBaseData } from '@/modules/Suzhou/components/Util/util';
import { departmentTree } from '@/modules/Suzhou/api/suzhou-api';

const Option = Select.Option;

class Search extends Component {
  state = {
    visible: false,
    isopen: false,
    trainTypes: [],
    trainUnitNames: [],
    department: [],
  };
  handleOpenChange = status => {
    if (status) {
      this.setState({ isopen: true });
    } else {
      this.setState({ isopen: false });
    }
  };
  // 培训类型
  getBaseSelectTreeType = () => {
    getBaseData('szxm.aqgl.outtraintype').then(data => this.setState({ trainTypes: data }));
  };

  // 获取发起部门数据
  getDepartmentTree = () => {
    axios.get(departmentTree).then(res => {
      this.setState({ department: res.data.data });
    });
  };
  //保存视图
  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (values['year']) {
          values['year'] = moment(values['year']).format('YYYY');
        }
        this.props.handleSearch(values);
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const content = (
      <Form onSubmit={this.handleSubmit} style={{ width: 380 }} className={style.formstyle}>
        <div className={style.content}>
          <Row>
            <Form.Item label="培训类型：" {...formItemLayout}>
              {getFieldDecorator('trainType')(
                <Select size="small" placeholder="请选择" onFocus={this.getBaseSelectTreeType}>
                  {this.state.trainTypes.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="附件状态：" {...formItemLayout}>
              {getFieldDecorator('fileStatus')(
                <Select size="small" placeholder="请选择">
                  <Option value={2} key={2}>
                    全部
                  </Option>
                  <Option value={0} key={0}>
                    未上传
                  </Option>
                  <Option value={1} key={1}>
                    已上传
                  </Option>
                </Select>
              )}
            </Form.Item>
          </Row>
          {/* <Row>
            <Form.Item label="发起单位：" {...formItemLayout}>
              {getFieldDecorator('sponsorDep')(
                <TreeSelect
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  allowClear
                  placeholder="请选择培训单位"
                  treeData={this.state.department}
                  onFocus={this.getDepartmentTree}
                />
              )}
            </Form.Item>
          </Row> */}
          <Row>
            <Form.Item label="培训时间：" {...formItemLayout}>
              {getFieldDecorator('year')(
                <DatePicker
                  format="YYYY"
                  placeholder="请选择年份"
                  size="small"
                  mode="year"
                  style={{ width: '100%' }}
                  open={this.state.isopen}
                  onChange={value => this.props.form.setFieldsValue({ year: value })}
                  onPanelChange={value => {
                    this.props.form.setFieldsValue({ year: value });
                    this.setState({ isopen: false });
                  }}
                  onOpenChange={this.handleOpenChange}
                />
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="培训名称：" {...formItemLayout}>
              {getFieldDecorator('trainName')(<Input size="small" placeholder="请输入" />)}
            </Form.Item>
          </Row>
          {/* 操作 */}
          <Row>
            <Col span={24}>
              <Col span={12} offset={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button style={{ width: 88 }} onClick={() => this.props.form.resetFields()}>
                    重置
                  </Button>
                  <Button type="primary" onClick={this.handleSubmit}>
                    搜索
                  </Button>
                </div>
              </Col>
            </Col>
          </Row>
        </div>
      </Form>
    );
    return (
      <div className={style.main}>
        <Popover
          placement="bottomRight"
          content={content}
          trigger="click"
          visible={this.state.visible}
          onVisibleChange={visible => {
            this.setState(() => ({ visible }));
          }}
        >
          <span className={style.search}>搜索</span>
          <Icon
            type={this.state.visible ? 'align-right' : 'unordered-list'}
            style={{ fontSize: 16, marginLeft: 5, verticalAlign: 'sub' }}
          />
        </Popover>
      </div>
    );
  }
}

export default Form.create()(Search);
