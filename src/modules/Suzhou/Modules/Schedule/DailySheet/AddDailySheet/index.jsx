import React, { Component } from 'react';
import { Form, Modal, Row, Col, Input, TreeSelect, DatePicker } from 'antd';
import { getsectionId, addDailySheet, getOrgPeopleList } from '@/modules/Suzhou/api/suzhou-api';
import * as dataUtil from '@/utils/dataUtil';
import axios from '@/api/axios';
import SelectSection from '@/modules/Suzhou/components/SelectSection';

const { Item } = Form;
const { TextArea } = Input;

class AddDailySheet1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      flag: true,
      assignFlag: true,
    };
  }

  componentWillReceiveProps({ visibleModal, projectId }) {
    const { flag } = this.state;
    if (visibleModal && projectId ) {
      // axios.get(getsectionId(projectId)).then(res => {
      //   const { data = [] } = res.data;
      //   this.setState(() => ({ treeData: this.treeFunMap(data) }));
      // });
    }
  }

  treeFunMap = arr => {
    for (let i = 0; i < arr.length; i++) {
      arr[i].title = arr[i].name;
      arr[i].value = arr[i].id;
      if (arr[i].children) {
        this.treeFunMap(arr[i].children);
      }
    }
    this.setState({ data: arr });
    return arr;
  };
  // 选择标段
  onChangeSection = value => {
    if (value) {
      this.setState({
        assignFlag: false,
        selectSetion: value,
      });
      //选择人员
      const { projectId } = this.props;
      axios
        .get(getOrgPeopleList + `?projectId=${projectId}&sectionIds=${value}&type=0&status=1`)
        .then(res => {
          this.getSelectTreeArr(res.data.data, { id: 'value', name: 'title' });
          this.setState({
            selectPeople: res.data.data,
          });
        });
    } else {
      this.setState({
        assignFlag: true,
      });
    }
  };
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
      peopleInfo,
      leaderId: peopleInfo.id,
      leaderName: peopleInfo.name,
    });
  };

  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { leaderId, leaderName } = this.state;
        const { sectionId, sheetName, dispatchTime1, remark, sheetNum } = values;
        const { projectId } = this.props;
        const dispatchTime = dataUtil.Dates().formatTimeString(dispatchTime1);
        axios
          .post(addDailySheet(), {
            projectId,
            sectionId,
            sheetName,
            dispatchTime,
            remark,
            leaderId,
            leaderName,
            sheetNum,
          })
          .then(res => {
            this.props.handleModalOk(res.data.data);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="新增"
        width={800}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={this.props.visibleModal}
        onOk={this.handleOk}
        onCancel={this.props.handleModalCancel}
      >
        <Form {...formLayout}>
          <Row key={1}>
            <Col span={12} key="sectionId">
              <Item {...formItemLayout} label="选择标段">
                {getFieldDecorator('sectionId', {
                  rules: [
                    {
                      required: true,
                      message: '请选择标段',
                    },
                  ],
                })(
                  <SelectSection
                      projectId={this.props.projectId}
                      callBack={({ sectionId ,sectionCode}) => {
                          this.props.form.setFieldsValue({ sectionId,leaderName:''});
                          this.setState({sectionCode});
                          this.onChangeSection(sectionId);
                      }}
                  />
                )}
              </Item>
            </Col>
            <Col span={12}>
                <Form.Item label="标段号" {...formItemLayout}>
                  <Input disabled={true} value={this.state.sectionCode} />
                </Form.Item>
            </Col>
            <Col span={12} key="sheetName">
              <Item {...formItemLayout} label="派工单名称">
                {getFieldDecorator('sheetName', {
                  rules: [
                    {
                      required: true,
                      message: '请输入派工单名称',
                    },
                  ],
                })(<Input />)}
              </Item>
            </Col>
            <Col span={12} key="leaderName">
              <Item {...formItemLayout} label="选择带班领导">
                {getFieldDecorator('leaderName', {})(
                  <TreeSelect
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    allowClear
                    treeDefaultExpandAll
                    treeData={this.state.selectPeople}
                    onSelect={this.onSelect}
                    disabled={this.state.assignFlag}
                  />
                )}
              </Item>
            </Col>
            <Col span={12} key="dispatchTime1">
              <Item label="派工日期" {...formItemLayout}>
                {getFieldDecorator('dispatchTime1', {
                  rules: [
                    {
                      required: true,
                      message: '请选择派工日期',
                    },
                  ],
                })(<DatePicker style={{ width: 255 }} />)}
              </Item>
            </Col>
          </Row>
          <Row key={4}>
            <Col span={24} key="remark">
              <Item label="备注" {...formItemLayout1}>
                {getFieldDecorator('remark', {})(<TextArea rows={2} />)}
              </Item>
            </Col>
          </Row>
        </Form>
      </Modal>
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
const AddDailySheet = Form.create({ name: 'AddDailySheet' })(AddDailySheet1);

export default AddDailySheet;
