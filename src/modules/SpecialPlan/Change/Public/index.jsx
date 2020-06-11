import React, { Component } from 'react'
import style from './style.less';
import { Modal, Table, Form, Input, Row, Col, Button, notification } from 'antd';
import Search from '../../../../components/public/Search';
import axios from '../../../../api/axios';
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import {
    getPlanTaskChangeReleaseTree,
    releasePlanTaskChange
} from "../../../../api/api"
import * as dataUtil from "../../../../utils/dataUtil";

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
                width: '26%',
                render: (text, record) => dataUtil.getIconCell(record.nodeType,text,record.taskType)
              },
              {
                title: '原计划数据',
                dataIndex: 'oldData',
                key: 'oldData',
                width: '37%',
              },
              {
                title: '变更后计划数据',
                dataIndex: 'newData',
                key: 'newData',
                width: '37%',
              }
            ],
            data: [],
            info: {},

            activeIndex: [],
            currentData: []
        }
    }

    handleSubmit = () => {
      this.props.refreshData()
      
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                const { selectProjectId } = this.props
                const { currentData } = this.state
                const tasks = currentData.map(v => {
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
                        this.props.refreshData()
                        this.props.handleCancel()
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
    getPlanTaskChangeReleaseTree = () => {
        const { projectIds } = this.props
        axios.post(getPlanTaskChangeReleaseTree, projectIds).then(res => {
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
          selectedRowKeys: this.state.activeIndex,
          onChange: (selectedRowKeys, selectedRows) => {
              this.setState({
                activeIndex: selectedRowKeys,
                currentData: selectedRows
              })
          },
          getCheckboxProps: record => ({
            disabled: record.check != 1
          })
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
