import React, { Component, Fragment, createRef } from 'react';
import moment from 'moment';
import { Row, Col, Button, Form, Input, Select, Modal, TreeSelect, DatePicker,Radio} from 'antd';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { getsectionId } from '@/api/suzhou-api';
import style from './style.less';
import { addQuaInsp } from '@/api/suzhou-api';
import axios from '@/api/axios';
import SelectSection from '@/modules/Suzhou/components/SelectSection';

const { TextArea } = Input;
const { Option } = Select;

export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      currentTime: null,
      checkType: '', // 验收分类的code
      submitBtn: createRef(),
      typeNoVo: {},
      treeData: [],
      sectionId:''
    };
    handleAdd = () => {
      if (this.props.projectId) {
        this.setState(() => ({ visible: true }));
        // 选择标段
        // axios.get(getsectionId(this.props.projectId)).then(res => {
        //   const { data = [] } = res.data;
        //   this.setState(() => ({ treeData: treeFunMap(data) }));
        //   if (this.state.treeData.length > 0) {
        //     const { id , code} = this.state.treeData[0];
        //     this.props.form.setFieldsValue({ sectionId: id });
        //     this.setState({
        //       sectionId: code,
        //     });
        //   }
        // });
      } else {
        notificationTip('请选中项目');
      }
    };
    render() {
      const { getFieldDecorator } = this.props.form;
      const { children } = this.props;
      const { handleRequst, closeRightBox } = this;
      // console.log(this.state.typeNoVo.code == '1');
      // console.log(this.state.typeNoVo);
      return (
        <Fragment>
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.handleAdd}
            res={'MENU_EDIT'}
            show={this.props.addBtn}
          />
          <Modal
            title="新增"
            width={800}
            destroyOnClose={true}
            centered={true}
            maskClosable={false}
            mask={false}
            visible={this.state.visible}
            onOk={this.handleAddPost}
            onCancel={() => this.setState(() => ({ visible: false }))}
          >
            <div className={style.container}>
              <Form {...formLayout}>
                <Row>
                  <Col span={12}>
                    <Form.Item label="选择标段" {...formItemLayout}>
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
                <Row>
                <Col span={12}>
                    <Form.Item label="工程名称" {...formItemLayout}>
                      {getFieldDecorator('engineName')(
                        <Input
                          placeholder={
                            this.state.typeNoVo.code === '5' ? '站名/区间名/系统名' : '请输入'
                          }
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="验收分类" {...formItemLayout}>
                      {getFieldDecorator('checkType', {
                        initialValue: this.state.typeNoVo.name,
                      })(<Input disabled={true} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12} style={{display:this.state.typeNoVo.code == '1'?'block':'none'}}>
                    <Form.Item label=" " {...formItemLayout}>
                      {getFieldDecorator('ysType', {
                        initialValue: '0',
                      })(
                          <Radio.Group>
                              <Radio key={'0'} value={'0'}>预验收</Radio>
                              <Radio key={'1'} value={'1'}>验收</Radio>
                          </Radio.Group>,
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="验收时间" {...formItemLayout}>
                      {getFieldDecorator('checkTime', {
                        rules: [
                          {
                            required: true,
                            message: '请选择时间',
                          },
                        ],
                      })(<DatePicker style={{ width: '100%' }} />)}
                    </Form.Item>
                  </Col>
                  </Row>
                <Row>
                  <Col>
                    <Form.Item label="自评" {...zipinLayout}>
                      {getFieldDecorator('selfOpinion')(<TextArea />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </Modal>
        </Fragment>
      );
    }
    // handleSubmit = e => {
    //   e.preventDefault();

    // };
    // onChangeTreeSelect = (value, label, extra) => {
    //   const code = extra.triggerNode.props.typeNoVo.code;
    //   const checkType = this.props.projectNames.filter(item => item.value === String(code));
    //   this.setState(() => ({ checkType: checkType[0].value }));
    //   this.props.form.setFieldsValue({
    //     checkType: checkType[0].title,
    //   });
    // };
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            checkTime: values.checkTime.valueOf(),
            checkType: this.state.typeNoVo.code,
            projectId: this.props.projectId,
            quaSysId: this.state.typeNoVo.id,
          };
          axios.post(addQuaInsp(), params, true).then(res => {
            const { status, data } = res.data;
            this.setState(
              () => ({ visible: false }),
              () => {
                if (status === 200) {
                  this.props.addTabelData(data);
                }
              }
            );
          });
        }
      });
    };
    handleRequst = () => {
    };
    closeRightBox = () => {
    };
    disabledDate = current => {
      // Can not select days before today and today
      return current && current <= moment().startOf('day');
    };
    componentWillReceiveProps(nextProps) {
      if (JSON.stringify(nextProps.typeVo) !== JSON.stringify(this.props.typeVo)) {
        this.setState({
          typeNoVo: nextProps.typeVo,
        });
      }
    }
    componentDidMount() {
      this.props.form.setFieldsValue({
        selfOpinion: '',
      });
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

const zipinLayout = {
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
