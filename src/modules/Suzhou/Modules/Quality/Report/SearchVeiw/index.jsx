import React, { Component } from 'react';
import { Input, Form, Button, Select, DatePicker,Radio , Icon, Row, Col, Popover } from 'antd';
import style from './style.less';
import moment from 'moment';

class Search extends Component {
  state = {
    visible: false,
    ysTypeFlag:false,
  };
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
        if(!this.state.ysTypeFlag){
          values.ysType = null;
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
  changeCheckType=(val)=>{
    if(val == 1){
      this.setState({ysTypeFlag:true})
    }else{
      this.setState({ysTypeFlag:false})
    }
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const content = (
      <Form onSubmit={this.handleSubmit} style={{ width: 380 }} className={style.formstyle}>
        <div className={style.content}>
          <Row>
            <Form.Item label="验收分类：" {...formItemLayout}>
              {getFieldDecorator('checkType')(
                <Select placeholder="请选择" size="small" onChange={this.changeCheckType}>
                  {this.props.projectNames.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.title}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Row>
          <Row style={{display:this.state.ysTypeFlag?'block':'none'}}>
            <Form.Item label=" " {...formItemLayout}>
              {getFieldDecorator('ysType')(
                  <Radio.Group>
                      <Radio key={'0'} value={'0'}>预验收</Radio>
                      <Radio key={'1'} value={'1'}>验收</Radio>
                  </Radio.Group>,
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="状态：" {...formItemLayout}>
              {getFieldDecorator('status')(
                <Select placeholder="请选择" size="small">
                  {this.props.status.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.title}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Row>
          <Row>
            <Form.Item label="验收时间：" {...formItemLayout} >
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
