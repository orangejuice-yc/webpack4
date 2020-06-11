import React, { Component } from 'react'
import style from './style.less';
import { Modal, Table, Form, Input, Row, Col, Button, notification} from 'antd';
import Search from '../../../../components/public/Search';
import axios from '../../../../api/axios';
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import {
    getPlanTaskChangeReleaseTree,
    releasePlanTaskChange
} from "../../../../api/api"
import * as dataUtil from "../../../../utils/dataUtil";
import PublicTable from '../../../../components/PublicTable'

export class PlanChangePublic extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [
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
                  //return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text1}</span>
                  //let icon = dataUtil.getIcon(record.nodeType,record.taskType);
                  //return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
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
            ],
            data: [],
            info: {},

            activeIndex: [],
            selectedRows: []
        }
    }

    handleSubmit = () => {
      this.props.form.validateFieldsAndScroll((err, values) => {
          if (!err) {
              const { selectProjectId } = this.props
              const { selectedRows } = this.state
              const tasks = selectedRows.map(v => {
                  return {
                      id: v.changeId ? v.changeId : v.id,
                      type : v.changeId ? 'change' : 'task'
                  }
              })
              if(tasks.length) {
                  const data = {
                      ...values,
                      projectId: selectProjectId,
                      tasks
                  }
                  let url = dataUtil.spliceUrlParams(releasePlanTaskChange,{"startContent": "项目【"+ this.props.projectName +"】"});
                  axios.put(url, data, true,null,true).then(res => {
                      this.props.handleCancel();
                      this.props.refreshData();
                  })
              } else {
                  notification.warning(
                      {
                          placement: 'bottomRight',
                          bottom: 50,
                          duration: 2,
                          message: '未选中数据',
                          description: '请选择数据进行操作'
                      }
                  )
              }
              
          }
      })
    }

    componentDidMount() {
        this.getPlanTaskChangeReleaseTree()
    }

    // 获取变更审批树
    getPlanTaskChangeReleaseTree = (callBack) => {
        const { projectIds } = this.props
        axios.post(getPlanTaskChangeReleaseTree, projectIds).then(res => {
            //callBack(res.data.data || [])
            const { data } = res.data
            this.setState({
                data
            })
        })
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex[0] ? `${style['clickRowStyl']}` : "";
    }

    getInfo = (record, index) => {
      let { id } = record
      this.setState({
          activeIndex: [id],
          selectedRows:[record]
      })
    }

    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
      this.table = ref
    }
    /**
    * 获取复选框 选中项、选中行数据
    * @method updateSuccess
    * @param {string} selectedRowKeys 复选框选中项
    * @param {string} selectedRows  行数据
    */
    getSelectedRowKeys = (activeIndex, selectedRows) => {
      this.setState({
        selectedRows,
        activeIndex
      })
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
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
              if (this.props.selectTree) {
                return
              }
              //this.getSelectedRowKeys(selectedRowKeys, selectedRows)
              this.setState({
                selectedRows:selectedRows,
                selectedRowKeys:selectedRowKeys
              })
            },
            onSelect: (record, selected, selectedRows) => {
                /*this.setState({
                    currentData: selectedRows
                })*/
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              if (selected) {
                this.setState({
                  selectedRowKeys: selectedRows.map(item => item.id),
                  selectedRows: selectedRows
                })
                //this.getSelectedRowKeys(selectedRows.map(item => item.id), selectedRows)
              } else {
                this.setState({
                  selectedRowKeys: [],
                  selectedRows: []
                })
                //this.getSelectedRowKeys([], [])
              }
            },
            getCheckboxProps: record => ({
              disabled: record.check==null, // Column configuration not to be checked
            }),
        };

        return (
            <Modal className={style.main} width="1200px" centered={true} title={"变更批准"} visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }}
                footer={
                    <div className="modalbtn">
                        <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <Search />
                    </div>
                    {/*<PublicTable onRef={this.onRef} getData={this.getPlanTaskChangeReleaseTree}
                      selectTree={true}
                      getRowData={this.getInfo}
                      useCheckBox={true}
                      rowSelection={true}
                      onChangeCheckBox={this.getSelectedRowKeys}
                      pagination={false}
                      columns={this.state.columns}
                      expanderLevel={10}
                      //checkboxStatus={record => !this.getAuth(record.status ? record.status.id : '')}
                    />*/}
                    <Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        size="small"
                        name={this.props.name}
                        columns={this.state.columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        scroll = {{x:'100%',y:'340px'}}
                        rowClassName={this.setClassName}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index)
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
            </Modal>
        )
    }
}

const PlanChangePublics = Form.create()(PlanChangePublic)
export default PlanChangePublics
