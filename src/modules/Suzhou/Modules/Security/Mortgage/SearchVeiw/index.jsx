import React, { Component } from 'react';
import { Icon, Row, Col, Popover } from 'antd';
import { Input, Form, Button, Select, DatePicker, TreeSelect } from 'antd';
import style from './style.less';
import axios from '@/api/axios';
import { getProjInfoList } from '@/api/suzhou-api';
import moment from 'moment';
import { formItemLayout, getBaseData, getMapData } from '@/modules/Suzhou/components/Util/util';

const Option = Select.Option;

class Search extends Component {
  state = {
    visible: false,
    sectionType: [],
  };
  getBaseSelectTreeType = () => {
    getBaseData('proj.section.type').then(data => this.setState({ sectionType: data }));
  };
  //保存视图
  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
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
            <Form.Item label="标段类型：" {...formItemLayout}>
              {getFieldDecorator('sectionType')(
                <Select
                  size="small"
                  placeholder="请选择检查类型"
                  onFocus={this.getBaseSelectTreeType}
                >
                  {this.state.sectionType.map(item => {
                    return (
                      <Option value={item.value} key={item.value}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </Form.Item>
          </Row>
          {/* <Row>
            <Form.Item label="编号/工程：" {...formItemLayout}>
              {getFieldDecorator('searcher')(<Input size="small" placeholder="请输入" />)}
            </Form.Item>
          </Row> */}
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
