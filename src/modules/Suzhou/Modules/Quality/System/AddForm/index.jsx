import React, { Component } from 'react';
import { Form, Input, Row, Col, Select, Modal } from 'antd';
import axios from '@/api/axios';
import {
  getBaseSelectTree,
  queryQuaSystem,
  queryQuaSystemAdd,
  queryQuaSystemDelete,
  queryQuaSystemPut,
} from '@/api/suzhou-api';
const { Option } = Select;
/**
 * 增加和修改可共用一个 大致逻辑相同
 */

export default Form.create()(
  class FormComponent extends Component {
    state = {
      typeList: [],
      tableData: [],
      tableDataOld: [],
      loadBoo: '',
      focusId: null,
      unitName: '',
      typeNoVo: '',
      parentId: 0,
      expandedRowKeys: '',
    };
    //获取类别
    componentDidMount() {
      let _this = this;
      axios.get(getBaseSelectTree('szxm.zlgl.systype')).then(function(res) {
        _this.setState({
          typeList: res.data.data,
        });
      });
    }
    componentWillReceiveProps() {
      this.setState({
        parentId: this.props.parentId,
      });
    }
    onHandleOk = () => {
      const _this = this;
      this.props.form.validateFields(err => {
        if (err) {
        } else {
          axios
            .post(
              queryQuaSystemAdd(),
              {
                parentId: this.state.parentId,
                unitName: this.state.unitName,
                typeNo: this.state.typeNoVo,
                projectId: this.props.projectId,
              },
              true
            )
            .then(function(res) {
              if (res.data.success) {
                _this.props.handleModalOk();
                _this.setState({
                  unitName: '',
                  typeNoVo: '',
                  parentId: 0,
                });
              }
            });
        }
      });
    };

    handleChange = (e, type) => {
      this.setState({
        [type]: e.target.value,
      });
    };

    onChange = value => {
      this.setState({ typeNoVo: value });
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Modal
          title="新增"
          width={800}
          destroyOnClose={true}
          centered={true}
          maskClosable={true}
          mask={false}
          visible={this.props.visible}
          onOk={this.onHandleOk}
          onCancel={this.props.handleModalCancel}
        >
          <Form {...formLayout}>
            <Row>
              <Col span={12}>
                <Form.Item label="名称" {...formItemLayout}>
                  {getFieldDecorator('unitName', {
                    rules: [
                      {
                        required: true,
                        message: '请输入名称',
                      },
                    ],
                  })(<Input onChange={e => this.handleChange(e, 'unitName')} />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="类别" {...formItemLayout}>
                  {getFieldDecorator('typeNoVo', {
                    rules: [
                      {
                        required: true,
                        message: '请选择类名',
                      },
                    ],
                  })(
                    <Select
                      placeholder="请选择"
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      onChange={this.onChange}
                    >
                      {this.state.typeList &&
                        this.state.typeList.map(item => (
                          <Option value={item.value} key={item.value}>
                            {item.title}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      );
    }
  }
);

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
