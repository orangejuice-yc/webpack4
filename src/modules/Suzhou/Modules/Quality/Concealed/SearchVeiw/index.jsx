import React, { Component } from 'react';
import { Icon, Row, Col, Popover } from 'antd';
import { Input, Form, Button, Select, DatePicker } from 'antd';
import style from './style.less';
import moment from 'moment';
import axios from '@/api/axios';
import { getBaseSelectTree } from '@/modules/Suzhou/api/suzhou-api';

class Search extends Component {
  state = {
    visible: false,
    status: [],
  };
  componentDidMount() {
    // status
    axios.get(getBaseSelectTree('base.flow.status')).then(res => {
      const { data } = res.data;
      this.setState(() => ({ status: data || [] }));
    });
  }
  //保存视图
  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (values.time && Array.isArray(values.time)) {
          values.time = values.time.map(item => moment(item).format('YYYY'));
          values.checkTimeStart = values.time[0];
          values.checkTimeEnd = values.time[1];
        } else {
          values.checkTimeStart = '';
          values.checkTimeEnd = '';
        }
        for (let key in values) {
          if (!values[key]) {
            values[key] = '';
          }
        }
        delete values.time;
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
            <Form.Item label="附件状态：" {...formItemLayout}>
              {getFieldDecorator('fileStatus')(
                <Select placeholder="请选择" size="small">
                  <Select.Option value={1} key="1">
                    已上传
                  </Select.Option>
                  <Select.Option value={0} key="2">
                    未上传
                  </Select.Option>
                </Select>
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="状态：" {...formItemLayout}>
              {getFieldDecorator('status')(
                <Select placeholder="请选择" size="small">
                  {this.state.status.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.title}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="验收时间：" {...formItemLayout}>
              {getFieldDecorator('time')(
                <DatePicker.RangePicker
                  placeholder={['开始年份', '结束年份']}
                  mode={['year', 'year']}
                  format="YYYY"
                  size="small"
                  onChange={value => this.props.form.setFieldsValue({ time: value })}
                  onPanelChange={value => this.props.form.setFieldsValue({ time: value })}
                />
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="工程名称：" {...formItemLayout}>
              {getFieldDecorator('engineName')(<Input size="small" placeholder="请输入" />)}
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
          onVisibleChange={visible => this.setState(() => ({ visible }))}
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
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};
export default Form.create()(Search);
