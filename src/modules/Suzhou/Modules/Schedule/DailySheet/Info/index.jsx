import React, { Component } from 'react';
import style from './style.less';
import { Button, Form, Row, Col, Input, DatePicker ,TreeSelect} from 'antd';
import moment from 'moment';
import axios from '@/api/axios';
import { updateDailySheet } from '../../../../api/suzhou-api';
import {  getOrgPeopleList } from '@/modules/Suzhou/api/suzhou-api';
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
class DailySheetInfo1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  handleOk = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) {
      } else {
        const {leaderId,leaderName} = this.state
        const { sheetName, dispatchTime, sheetNum,  remark } = values;
        const { id } = this.props.rightData;
        axios
          .put(updateDailySheet(), {
            id,
            sheetName,
            dispatchTime: moment(dispatchTime).valueOf(),
            remark,
            sheetNum,
            leaderName,
            leaderId
          })
          .then(res => {
            this.props.handleModelOk({
              ...this.props.rightData,
              sheetName,
              sheetNum,
              dispatchTime,
              remark,
              leaderName,
              leaderId
            });
          });
      }
    });
  };
  componentDidMount(){
     const { projectId, } = this.props;
     const {sectionId} =this.props.data
     if(sectionId){    
      axios
        .get(getOrgPeopleList + `?projectId=${projectId}&sectionIds=${sectionId}&type=0&status=1`)
        .then(res => {
          this.getSelectTreeArr(res.data.data, { id: 'value', name: 'title' });
          this.setState({
            selectPeople: res.data.data,
          });
        });
    } else{
      this.setState({
        assignFlag: true,
      });
    }
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
      peopleInfo,
      leaderId: peopleInfo.id,
      leaderName: peopleInfo.name,
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      sheetName,
      leaderName,
      dispatchTime,
      sheetNum,
      remark,
      sectionName,
      sectionCode,
      creater,
      creatTime,
      sgdw
    } = this.props.rightData;
    return (
      <div className={style.main}>
        <div className={style.mainHeight}>
          <h3 className={style.listTitle}>基本信息</h3>
          <Form {...formLayout} className={style.mainScorll} onSubmit={this.handleOk}>
            <div className={style.content}>
              <Row>
                <Col span={12} key="sectionName">
                  <Item {...formItemLayout} label="标段名称">
                    {getFieldDecorator('sectionName', {
                      initialValue: sectionName,
                    })(<Input disabled />)}
                  </Item>
                </Col>
                <Col span={12} key="sectionCode">
                  <Item {...formItemLayout} label="标段号">
                    {getFieldDecorator('sectionCode', {
                      initialValue: sectionCode,
                    })(<Input disabled />)}
                  </Item>
                </Col>
                <Col span={12} key="sheetNum">
                  <Item {...formItemLayout} label="派工单编号">
                    {getFieldDecorator('sheetNum', {
                      rules: [],
                      initialValue: sheetNum,
                    })(<Input disabled={this.props.status} />)}
                  </Item>
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
                      initialValue: sheetName,
                    })(<Input disabled={this.props.status} />)}
                  </Item>
                </Col>
                <Col span={12} key="sgdw">
                  <Item {...formItemLayout} label="施工单位">
                    {getFieldDecorator('sgdw', {
                      initialValue: sgdw,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key="leaderName">
                  <Item {...formItemLayout} label="带班领导">
                    {getFieldDecorator('leaderName', {
                      initialValue: leaderName,
                    })(<TreeSelect
                      showSearch
                      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                      allowClear
                      treeDefaultExpandAll
                      treeData={this.state.selectPeople}
                      onSelect={this.onSelect}
                      disabled={this.state.assignFlag || this.props.status}
                    />)}
                  </Item>
                </Col>
                <Col span={12} key="dispatchTime">
                  <Item {...formItemLayout} label="派工日期">
                    {getFieldDecorator('dispatchTime', {
                      rules: [
                        {
                          required: true,
                          message: '请选择派工日期',
                        },
                      ],
                      initialValue: moment(dispatchTime),
                    })(<DatePicker style={{ width: '100%' }} disabled={this.props.status}  />)}
                  </Item>
                </Col>
                <Col span={12} key="creater">
                  <Item {...formItemLayout} label="创建人">
                    {getFieldDecorator('creater', {
                      initialValue: creater,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={12} key="creatTime">
                  <Item {...formItemLayout} label="创建时间">
                    {getFieldDecorator('creatTime', {
                      initialValue: creatTime,
                    })(<Input disabled={true} />)}
                  </Item>
                </Col>
                <Col span={24} key="remark">
                  <Item label="备注" {...formItemLayout1}>
                    {getFieldDecorator('remark', {
                      initialValue: remark,
                    })(<TextArea rows={2} disabled={this.props.status} />)}
                  </Item>
                </Col>
              </Row>
              <Item wrapperCol={{ offset: 4 }}>
                <Button
                  className="globalBtn"
                  htmlType="submit"
                  onClick={this.handleOk}
                  style={{ marginRight: 20 }}
                  type="primary"
                  disabled={this.props.status?true:(this.props.permission.indexOf('DAILYSHEET_EDIT-DAILYSHEET')==-1?true:false)}
                >
                  保存
                </Button>
                <Button className="globalBtn" onClick={this.props.closeRightBox}>
                  取消
                </Button>
              </Item>
            </div>
          </Form>
        </div>
      </div>
    );
  }
}

const DailySheetInfo = Form.create({ name: 'DailySheetInfo' })(DailySheetInfo1);
export default DailySheetInfo;
