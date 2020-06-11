import { Component } from 'react';
import { Form, Modal, TreeSelect, Input, Row, Col } from 'antd';
import { getsectionId, addQuaSuperv } from '@/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import axios from '@/api/axios';
import notificationFun from '@/utils/notificationTip';
import SelectSection from '@/modules/Suzhou/components/SelectSectionjianli';
const { TextArea } = Input
export default Form.create()(
  class extends Component {
    state = {
      treeData: [],
      visibleModal: false,
      sectionId: '',
    };
    // 获取焦点请求数据
    handleOnFocus = () => {
      axios.get(getsectionId(this.props.projectId)).then(res => {
        const { data = [] } = res.data;
        if (data && Array.isArray(data)) {
          this.setState(() => ({ treeData: treeFunMap(data) }));
          if (this.state.treeData.length > 0) {
            const { id, code } = this.state.treeData[0];
            this.props.form.setFieldsValue({
              sectionId: id,
            });
            this.setState({
              sectionCode: code,
            });
          }
        }
      });
    };
    // 点击确定
    handleModalOk = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          axios
            .post(addQuaSuperv(), {
              projectId: this.props.projectId,
              ...values,
              type: this.props.type || 0,
            })
            .then(res => {
              const { data } = res.data;
              this.setState({ visibleModal: false });
              this.props.handleAdd(data);
            });
        }
      });
    };
    componentDidUpdate() {
      if (!this.state.visibleModal && this.state.sectionId) {
        this.setState({ sectionId: '' });
      }
    }
    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          {this.props.projectId ? (
            <PublicButton
              name={'新增'}
              title={'新增'}
              icon={'icon-add'}
              afterCallBack={() => {
                this.setState({ visibleModal: true });
                // this.handleOnFocus();
              }}
              res={'MENU_EDIT'}
            />
          ) : null}
          <Modal
            title="新增"
            destroyOnClose={true}
            centered={true}
            width={800}
            maskClosable={false}
            mask={false}
            visible={this.state.visibleModal}
            onOk={this.handleModalOk}
            onCancel={() => this.setState({ visibleModal: false })}
          >
            <Form {...formLayout}>
              <Row>
                <Col span={12}>
                  <Form.Item label="标段名称" {...formItemLayout}>
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
                              this.props.form.setFieldsValue({ sectionId});
                              this.setState({sectionCode})
                          }}
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="标段号" {...formItemLayout}>
                    <Input disabled={true} value={this.state.sectionCode} />
                  </Form.Item>
                </Col>
              </Row>
              <Row >
                <Col span={24} key='remark'>
                  <Form.Item label='备注' {...formItemLayout1}>
                    {getFieldDecorator("remark",{
                      // rules: [
                      //   {
                      //     required: false,
                      //     message: '请输入备注',
                      //   },
                      // ]
                    })(
                      <TextArea rows={2} />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
        </React.Fragment>
      );
    }
  }
);

const treeFunMap = arr => {
  for (let i = 0; i < arr.length; i++) {
    arr[i].title = arr[i].name;
    arr[i].value = arr[i].id;
    if (arr[i].children) {
      treeFunMap(arr[i].children);
    }
  }
  return arr;
};
const formItemLayout1 = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 4},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 20},
  },
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
