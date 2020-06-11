import React, { Component, Fragment } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { queryOrgPeopleList, addTrainStaff } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

import { Modal, Row, Col, Form, Input, Select } from 'antd';
const { Option } = Select;

class AddModal extends Component {
  state = {
    visible: false,
    workerName: [],
    workerCode: '',
    name: '',
  };
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { id, sectionId, projectId, sponsorDep, sponsorDepId } = this.props.rightData;
        const object = {
          projectId: projectId,
          sectionId: sectionId,
          trainId: id,
          intExtStaff: 0,
          dep: sponsorDep,
          depId: sponsorDepId,
        };
        const params = this.state.params.map(item => ({ ...item, ...object }));
        axios.post(addTrainStaff(), params, true).then(res => {
          const { data, status } = res.data;
          if (status === 200) {
            this.setState({
              visible: false,
            });
            this.props.handleAddUpdateTabel(data);
          }
        });
      }
    });
  };
  handleChangeWorkerName = (...args) => {
    const [, props] = args;
    const arr = props
      .map(item => item.props)
      .map(item => ({
        workerId: item.value,
        workerName: item.children,
      }));
    this.setState({
      params: arr,
    });
  };
  handleGetNames = () => {
    const _ = this.props.rightData;
    const params = {
      sponsorDepId: _.sponsorDep === '中心培训' ? '' : _.sponsorDepId,
      // sponsorDep: _.sponsorDep,
      trainType: _.trainTypeVo.name,
    };
    axios
      .get(queryOrgPeopleList, {
        params,
      })
      .then(res => {
        const { data } = res.data;
        const children = data[0] ? data[0].children : [];
        this.setState({
          workerName: children.map(item => ({ id: item.userId, name: item.userName })),
          orgName: data[0].orgName,
        });
      });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <PublicButton
          name={'获取'}
          title={'获取'}
          icon={'icon-add'}
          afterCallBack={() => {
            this.handleGetNames();
            this.setState({ visible: true });
          }}
          res={'MENU_EDIT'}
        />
        <Modal
          title="获取"
          width={800}
          destroyOnClose={true}
          centered={true}
          maskClosable={false}
          mask={false}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          <Form {...formLayout}>
            <Row>
              <Col span={12}>
                <Form.Item label="选择姓名" {...formItemLayout}>
                  {getFieldDecorator('workerId', {
                    rules: [
                      {
                        required: true,
                        message: '请选择姓名',
                      },
                    ],
                  })(
                    <Select
                      mode="multiple"
                      placeholder="选择姓名"
                      onChange={this.handleChangeWorkerName}
                    >
                      {this.state.workerName.map(item => (
                        <Option value={item.id} key={item.id}>
                          {item.name}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              {/* <Col span={12}>
                <Form.Item label="学时（小时）" {...formItemLayout}>
                  {getFieldDecorator('learnTime', {
                    rules: [
                      {
                        required: true,
                        message: '请输入学时',
                      },
                    ],
                  })(<Input type="number" />)}
                </Form.Item>
              </Col> */}
            </Row>
            <Row>
              {/* <Col span={12}>
                <Form.Item label="考试得分" {...formItemLayout}>
                  {getFieldDecorator('score', {
                    rules: [
                      {
                        required: true,
                        message: '请输入考试得分',
                      },
                    ],
                  })(<Input type="number" />)}
                </Form.Item>
              </Col> */}
              {/* <Col span={12}>
                <Form.Item label="工种" {...formItemLayout}>
                  {getFieldDecorator('workerType')(<Input disabled={true} />)}
                </Form.Item>
              </Col> */}
            </Row>
            {/* <Row>
              <Col span={12}>
                <Form.Item label="人员职务" {...formItemLayout}>
                  {getFieldDecorator('workerDuty')(<Input disabled={true} />)}
                </Form.Item>
              </Col>
            </Row> */}
          </Form>
        </Modal>
      </Fragment>
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
export default Form.create()(AddModal);
