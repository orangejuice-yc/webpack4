import React, { Component } from 'react';
import { Modal, Form, Row, Col, TreeSelect, Input } from 'antd';
import axios from '@/api/axios';
import { getOrgPeopleList } from '../../../../api/suzhou-api';
const { Item } = Form;
const { TextArea } = Input;
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
const formItemLayout1 = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 20 },
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
class ModifyDetail1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectPeople: [],
    };
  }
  // 确认修改
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { id } = this.props.rightData;
        const data = { ...values, id, worker: this.state.worker };
        this.props.handleModalOkDetail(data);
      }
    });
  };
  componentDidMount() {
    this.setState({
      worker: this.props.rightData.worker,
    });
    const { projectId, sectionId } = this.props;
    axios
      .get(getOrgPeopleList + `?projectId=${projectId}&sectionIds=${sectionId}&type=1,2,3,4&status=1`)
      .then(res => {
        this.getSelectTreeArr(res.data.data, { id: 'value', name: 'title' });
        this.setState({
          selectPeople: res.data.data,
        });
      });
  }
  getSelectTreeArr = (array, keyMap) => {
    if (array) {
      array.forEach((item, index, arr) => {
        var obj = item;
        if (obj.type == 'people') {
        } else {
          obj.disabled = true;
        }
        for (var key in obj) {
          var newKey = keyMap[key];
          if (newKey) {
            obj[newKey] = obj[key];
          }
        }
        this.getSelectTreeArr(item.children, keyMap);
      });
    }
  };
  //选择人员
  onSelect = (selectedKeys, info, e) => {
    const peopleInfo = info.props;
    this.setState({
      worker: peopleInfo.name,
      workerId: peopleInfo.id,
    });
  };
  render() {
    const { visibleModalDetail, handleModalCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (this.props.rightData === null) {
      return <span />;
    }
    const { workSpace, workerId, taskName, workContent, remark } = this.props.rightData;

    return (
      <Modal
        title="修改"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModalDetail}
        onOk={this.handleOk}
        onCancel={handleModalCancel}
      >
        <br />
        <br />
        <Form {...formLayout}>
          <Row key={1}>
            <Col span={12} key="workSpace">
              <Item label="工作区域" {...formItemLayout}>
                {getFieldDecorator('workSpace', {
                  rules: [
                    {
                      required: true,
                      message: '请输入工作区域',
                    },
                  ],
                  initialValue: workSpace,
                })(<Input />)}
              </Item>
            </Col>
            <Col span={12} key="workerId">
              <Item label="工作人员" {...formItemLayout}>
                {getFieldDecorator('workerId', {
                  initialValue: workerId,
                  rules: [
                    {
                      required: true,
                      message: '请输入工作人员',
                    },
                  ],
                })(
                  <TreeSelect
                    disabled
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    allowClear
                    treeDefaultExpandAll
                    treeData={this.state.selectPeople}
                    onSelect={this.onSelect}
                  />
                )}
              </Item>
            </Col>
          </Row>
          <Row key={2}>
            <Col span={12} key="taskId">
              <Item label="对应工序" {...formItemLayout}>
                {getFieldDecorator('taskName', {
                  initialValue: taskName,
                })(<Input />)}
              </Item>
            </Col>
          </Row>
          <Row key={3}>
            <Col span={24} key="workContent">
              <Item label="工作内容" {...formItemLayout1}>
                {getFieldDecorator('workContent', {
                  rules: [
                    {
                      required: true,
                      message: '请输入工作内容',
                    },
                  ],
                  initialValue: workContent,
                })(<TextArea rows={2} />)}
              </Item>
            </Col>
          </Row>
          <Row key={43}>
            <Col span={24} key="remark">
              <Item label="备注说明" {...formItemLayout1}>
                {getFieldDecorator('remark', {
                  rules: [],
                  initialValue: remark,
                })(<TextArea rows={2} />)}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
const ModifyDetail = Form.create({ name: 'ModifyDetail' })(ModifyDetail1);
export default ModifyDetail;
