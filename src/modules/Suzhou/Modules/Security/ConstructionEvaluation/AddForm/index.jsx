import React, { Component, Fragment } from 'react';
import { Row, Col, Form, Input, Select, Modal, TreeSelect, DatePicker } from 'antd';
import { addConstructEvaluation, getInfo } from '@/modules/Suzhou/api/suzhou-api';
import DatePickerYear from '@/modules/Suzhou/components/DatePickerYear';
import SelectSection from '@/modules/Suzhou/components/SelectSection';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { formLayout, formItemLayout, zipinLayout } from '@/modules/Suzhou/components/Util/util';
import { getBaseData } from '@/modules/Suzhou/components/Util/util';
import axios from '@/api/axios';
import { getsectionId, queryQuaSystem } from '@/api/suzhou-api';
import style from './style.less';
import moment from 'moment';
const { Option } = Select;
//
export default Form.create()(
  class extends Component {
    state = {
      visible: false,
      jclx: [],
      cuList: '',
      sectionCode:'',
    };
    getInfo = id => {
      axios.get(getInfo(id)).then(res => {
        const { data } = res.data;
        if (data && Array.isArray(data.cuList) && data.cuList[0]) {
          this.setState({
            cuList: data.cuList[0].name,
          });
        } else {
          this.setState({
            cuList: '',
          });
        }
      });
    };
    
    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <Fragment>
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={() => {
              this.setState({ visible: true });
            }}
            res={'MENU_EDIT'}
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
              <Form {...formLayout} onSubmit={this.handleAddPost}>
                <Row>
                  <Col span={12}>
                    <Form.Item label="选择标段" {...formItemLayout}>
                      {getFieldDecorator('sectionId', {
                        rules: [{ required: true, message: '请选择标段' }],
                      })(
                        <SelectSection
                          projectId={this.props.projectId}
                          callBack={({ sectionId ,sectionCode}) => {
                            this.getInfo(sectionId);
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
                    <Form.Item label="年份" {...formItemLayout}>
                      {getFieldDecorator('year', {
                        rules: [{ required: true, message: '请选择年份' }],
                      })(
                        <DatePickerYear
                          callBackDateValue={value => {
                            this.props.form.setFieldsValue({ year: value });
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="季度" {...formItemLayout}>
                      {getFieldDecorator('season', {
                        rules: [{ required: true, message: '请选择季度' }],
                      })(
                        <Select placeholder="请选择季度">
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
                  </Col>
                  
                </Row>
                <Row>
                <Col span={12}>
                    <Form.Item label="施工单位" {...formItemLayout}>
                      <Input value={this.state.cuList} disabled={true} />
                    </Form.Item>
                  </Col>
                  </Row>
              </Form>
            </div>
          </Modal>
        </Fragment>
      );
    }
    // 确定
    handleAddPost = () => {
      this.props.form.validateFields((err, values) => {
        if (!err) {
          const params = {
            ...values,
            projectId: this.props.projectId,
            year: moment(values.year).format('YYYY'),
          };
          axios.post(addConstructEvaluation(), params, true).then(res => {
            const { data } = res.data;
            this.setState(() => ({ visible: false }), () => this.props.handleAddData(data));
          });
        }
      });
    };
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
