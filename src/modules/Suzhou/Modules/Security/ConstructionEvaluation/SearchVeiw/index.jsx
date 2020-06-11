import React, { Component } from 'react';
import { Icon, Row, Col, Popover } from 'antd';
import { Form, Button, Select } from 'antd';
import style from './style.less';
import moment from 'moment';
import { formItemLayout } from '@/modules/Suzhou/components/Util/util';
import DatePickerYear from '@/modules/Suzhou/components/DatePickerYear';

const Option = Select.Option;

class Search extends Component {
  state = {
    visible: false,
  };
  //保存视图
  handleSubmit = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = {
          ...values,
          year: moment(values['year']).format('YYYY'),
        };
        this.props.handleSearch(params);
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const content = (
      <Form onSubmit={this.handleSubmit} style={{ width: 380 }} className={style.formstyle}>
        <div className={style.content}>
          <Row>
            <Form.Item label="年份" {...formItemLayout}>
              {getFieldDecorator('year')(
                <DatePickerYear
                  size="small"
                  callBackDateValue={value => {
                    this.props.form.setFieldsValue({ year: value });
                  }}
                />
              )}
            </Form.Item>
          </Row>

          <Row>
            <Form.Item label="季度" {...formItemLayout}>
              {getFieldDecorator('season')(
                <Select placeholder="请选择季度" size="small">
                  <Option value={0} key={0}>
                    一季度
                  </Option>
                  <Option value={1} key={1}>
                    二季度
                  </Option>
                  <Option value={2} key={2}>
                    三季度
                  </Option>
                  <Option value={3} key={3}>
                    四季度
                  </Option>
                </Select>
              )}
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
