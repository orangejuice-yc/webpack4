import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Form, Input, Icon, DatePicker, Select, Row, Col, Button, notification } from 'antd';
import Search from '../../../../../components/public/Search'
import { connect } from 'react-redux'
import '../../../../../asserts/antd-custom.less'
import axios from "../../../../../api/axios"
import * as WorkFolw from '../../../../Components/Workflow/Start';
import * as dataUtil from "../../../../../utils/dataUtil";
import {getPlanTaskChangeReleaseTree, taskChangeSaveAsApply} from "../../../../../api/api";

class Approval extends Component {

    constructor(props) {
        super(props);
        this.state = {
            initDone: false,
            step: 1,
            columns: [],
            data: [],
            info: {},
            selectedRowKeys: [],
            currentData: [],
            activeIndex: [],
        }
    }

    initDatas =()=>{
      const { projectIds } = this.props;
      axios.post(getPlanTaskChangeReleaseTree, projectIds).then(res => {
        const { data } = res.data
        this.setState({
          data
        })
      })
    }

    getInfo = (record) => {
        this.setState({
            activeIndex: record.id
        })
    }

    setClassName = (record) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
       // 初始化数据
       this.initDatas();
        this.props.onRef(this)
    }
    // 查询
    search = (text) => {
        const {initData} = this.state;
        let newData = dataUtil.search(initData,[{"key":"name|code","value":text}],true);
        this.setState({
          data: newData
        });
    }

    beforeSubmit = (datas,callback) =>{

      this.props.form.validateFieldsAndScroll((err, values) => {
          if (err) {
            return false;
          }
          const { projectId } = this.props
          const {selectedItems} = this.state;
          let arr = new Array();
          if(selectedItems){
            for(let i = 0,len = selectedItems.length; i < len; i++){
              arr.push({id:selectedItems[i].bizId,type:selectedItems[i].bizType});
            }
          }
          if(arr.length) {
            const data = {
              ...values,
              projectId: projectId,
              tasks : arr
            }

            axios.put(taskChangeSaveAsApply,data).then(res => {
              callback([{bizId:res.data.data.id,bizType:"ST-IMPLMENT-CHANGE"}]);
            })
          }

      })
    }
    validate = () =>{
      let b = true;
      this.props.form.validateFieldsAndScroll((err) => {
        if (err) {
          b = false;
          return false;
        }
      });
      return b;
    }
    render() {
        const { getFieldDecorator} = this.props.form;
        const formItemLayout = {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 5 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 19 },
          },
        };

        const { intl } = this.props.currentLocale;
        let columns = [
          {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 400,
            //render: (text, record) => dataUtil.getIconCell(record.nodeType,text,record.taskType)
            render: (text, record) => {
              let icon = dataUtil.getIcon(record.nodeType, record.taskType);
              let year = record.custom01;
              let month = record.custom02;
              month = month ? month + "月" : "";
              let text1 = year ? "(" + year + "年" + month + ") " + text : text;
              return dataUtil.getIconCell(record.nodeType,text1,record.taskType);
            }
          },
          {
            title: '原计划数据',
            dataIndex: 'oldData',
            key: 'oldData',
            width: 300,
          },
          {
            title: '变更后计划数据',
            dataIndex: 'newData',
            key: 'newData',
            width: 300,
          }
        ]
        let { selectedRowKeys } = this.state;
        const rowSelection = {
          selectedRowKeys,
          onChange: (selectedRowKeys,selectedRow) => {
            this.setState({
              selectedRowKeys
            });
            let selectedItems = new Array();
            if(selectedRow){
              for(let i = 0, len = selectedRow.length; i < len; i++){
                let item =   selectedRow[i];
                let bizId = item["changeId"] ? item["changeId"] : item["id"];
                let bizType = item["changeId"] ? 'change' : 'task';
                selectedItems.push({bizId,bizType});
              }
            }
            this.setState({selectedItems:selectedItems});
            this.props.getSubmitData(selectedItems);
          },
          getCheckboxProps: record => ({
            disabled: record.check != 1
          })
        };

        let display = this.props.visible ? "" : "none";
        return (
            <div style = {{display:display}}>
              <div className={style.tableMain}>
                <div className={style.search}>
                  <Search search = {this.search } />
                </div>
                <Table rowKey={record => record.id}
                       defaultExpandAllRows={true}
                       pagination={false}
                       name={this.props.name}
                       columns={columns}
                       scroll = {{x:'100%',y:'360px'}}
                       indentSize = {12}
                       rowSelection={rowSelection}
                       dataSource={this.state.data}
                       size="small"
                       onRow={(record, index) => {
                           return {
                               onClick: () => {
                                  this.getInfo(record, index)
                               },
                               onDoubleClick: (event) => {
                                  event.currentTarget.getElementsByClassName("ant-checkbox-wrapper")[0].click();
                               }
                           }
                         }
                       }
                />
              </div>
              <div className={style.publicMain}>
                <Form onSubmit={this.handleSubmit}>
                  <Row type="flex">
                    <Col span={12}>
                      <Form.Item {...formItemLayout} label="申请变更原因">
                        {getFieldDecorator('changeReason', {
                          initialValue: this.state.info.changeReason,
                          rules: [
                            { required: true, message: "请输入申请变更原因" },
                          ],
                        })(
                          <Input />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item {...formItemLayout} label="变更影响分析">
                        {getFieldDecorator('changeEffect', {
                          initialValue: this.state.info.changeEffect,
                          rules: [
                            { required: true, message: "请输入变更影响分析" },
                          ],
                        })(
                          <Input />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row type="flex">
                    <Col span={12}>
                      <Form.Item {...formItemLayout} label="采取措施说明">
                        {getFieldDecorator('changeWayDesc', {
                          initialValue: this.state.info.changeWayDesc,
                          rules: [
                            { required: true, message: "采取措施说明" },
                          ],
                        })(
                          <Input />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </div>

            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};
export default WorkFolw.StartWorkFlow(connect(mapStateToProps, null)(Form.create()(Approval)));
