import React, { Component } from 'react';
import { Modal, Form, Row, Col, Input, TreeSelect } from 'antd';
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
class AddDetail1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      worker: '',
      workerId: '',
      taskId: '',
      taskName: '',
    };
  }

  componentDidMount() {
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
    // const peopleInfo = info.props;
    const peopleInfo = e.selectedNodes;
    const worker = [];
    const workerId = [];
    const workManAddForms = []
    if(peopleInfo.length > 0){
      peopleInfo.map((item,i)=>{
        let obj = {};
        worker.push(item.props.name);
        workerId.push(item.props.id)
        obj.worker = item.props.name;
        obj.workerId = item.props.id;
        workManAddForms.push(obj);
      })
    }
    this.setState({
      worker: worker,
      workerId: workerId,
      workManAddForms:workManAddForms
    });
  };

  // 新增
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { workSpace, remark, workContent, taskName } = values;
        const { worker, workerId, taskId ,workManAddForms} = this.state;
        this.props.handleModalOk({
          // worker,
          // workerId,
          taskId,
          taskName,
          workSpace,
          remark,
          workContent,
          workManAddForms
        });
      }
    });
  };

  render() {
    const { visibleModal, handleModalCancel } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="日派工单"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={visibleModal}
        onOk={this.handleOk}
        onCancel={handleModalCancel}
      >
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
                })(<Input />)}
              </Item>
            </Col>
            <Col span={12} key="worker">
              <Item label="工作人员" {...formItemLayout}>
                {getFieldDecorator('worker', {
                  rules: [
                    {
                      required: true,
                      message: '请输入工作人员',
                    },
                  ],
                })(
                  <TreeSelect
                    multiple
                    showSearch
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
            <Col span={12} key="taskName">
              <Item label="对应工序" {...formItemLayout}>
                {getFieldDecorator('taskName')(<Input />)}
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
                })(<TextArea rows={2} />)}
              </Item>
            </Col>
          </Row>
          <Row key={43}>
            <Col span={24} key="remark">
              <Item label="备注说明" {...formItemLayout1}>
                {getFieldDecorator('remark', {
                  rules: [],
                })(<TextArea rows={2} />)}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
}
const AddDetail = Form.create({ name: 'AddDetail' })(AddDetail1);
export default AddDetail;
