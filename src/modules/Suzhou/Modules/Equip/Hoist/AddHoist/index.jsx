import React, { Component } from 'react';
import { Form, Modal, Row, Col, Input, TreeSelect, Button ,DatePicker} from 'antd';
import { getsectionId, addDeviceHoisting } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import style from './style.less';
import SelectSection from '@/modules/Suzhou/components/SelectSection';
import * as dataUtil from "@/utils/dataUtil";
const { Item } = Form;
const { TextArea } = Input;

class AddHoist1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      flag: true,
      sectionId:''
    };
  }

  componentWillReceiveProps({ visibleModal, projectId }) {
    const { flag } = this.state;
    if (visibleModal && projectId && flag) {
      this.setState({ flag: false });
      // axios.get(getsectionId(projectId)).then(res => {
      //   const { data } = res.data;
      //   this.setState(() => ({ treeData: this.treeFunMap(data) }));
      //   if (this.state.treeData.length > 0) {
      //     const { id , code} = this.state.treeData[0];
      //     this.props.form.setFieldsValue({ sectionId: id });
      //     this.setState({
      //       sectionCode: code,
      //       firstSection:!res.data.data?'':res.data.data[0].value,
      //     });
      //   }
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

  handleOk = (type, e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const { sectionId, title, remark } = values;
        const { projectId } = this.props;
        const hoistTime=dataUtil.Dates().formatTimeString(values.hoistTime).substr(0,10)
        axios.post(addDeviceHoisting(), { projectId, sectionId, title, remark ,hoistTime}).then(res => {
          this.props.handleModalOk(res.data.data, type);
          this.props.form.setFieldsValue({
            sectionId: '',
            title: '',
            remark: '',
            hoistTime:''
          });
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
        className={style.main}
        destroyOnClose={true}
        centered={true}
        maskClosable={false}
        mask={false}
        visible={this.props.visibleModal}
        onCancel={this.props.handleModalCancel}
        footer={
          <div className="modalbtn">
            {/* 保存并继续 */}
            <Button key={1} onClick={this.handleOk.bind(this, 'goOn')}>
              保存并继续
            </Button>
            {/* 保存 */}
            <Button key={2} onClick={this.handleOk.bind(this, 'save')} type="primary">
              保存
            </Button>
          </div>
        }
      >
        <Form {...formLayout} onSubmit={this.handleOk} className={style.mainScorll}>
          <div className={style.content}>
            <Row key={1} type="flex">
              <Col span={12} key="sectionId">
                <Item {...formItemLayout} label="选择标段">
                  {getFieldDecorator('sectionId', {
                    initialValue:this.state.firstSection,
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
                </Item>
              </Col>
              <Col span={12}>
                    <Form.Item label="标段号" {...formItemLayout}>
                      <Input disabled={true} value={this.state.sectionCode} />
                    </Form.Item>
                  </Col>
              
            </Row>
            <Row>
            <Col span={12} key="title">
                <Item {...formItemLayout} label="标题">
                  {getFieldDecorator('title', {
                    rules: [
                      {
                        required: true,
                        message: '请输入标题',
                      },
                    ],
                  })(<Input />)}
                </Item>
              </Col>
              <Col span={12} key='hoistTime'>
                <Item label='吊装日期' {...formItemLayout}>
                  {getFieldDecorator("hoistTime",{
                    rules: [
                      {
                        required: true,
                        message: '请选择日期',
                      },
                    ]
                  })(
                    <DatePicker format='YYYY-MM-DD' style={{width:'100%'}}/>
                  )}
                </Item>
              </Col>
              </Row>
            <Row key={2}>
              <Col span={24} key="remark">
                <Item label="备注说明" {...formItemLayout1}>
                  {getFieldDecorator('remark', {})(<TextArea rows={2} />)}
                </Item>
              </Col>
            </Row>
          </div>
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

const AddHoist = Form.create({ name: 'AddHoist' })(AddHoist1);
export default AddHoist;
