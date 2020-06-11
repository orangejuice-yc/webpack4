import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, Form,Button,notification } from 'antd';
import Search from '../../../../components/public/Search'
import intl from 'react-intl-universal'
import '../../../../asserts/antd-custom.less'
import axios from "../../../../api/axios"
import {
    confirmPlanTaskTree,
    confirmPlanTask
} from "../../../../api/api"
import MyIcon from '../../../../components/public/TopTags/MyIcon'
import * as dataUtil from "../../../../utils/dataUtil";
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
export class PlanPreparedRelease extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            step: 1,
            columns: [],
            data: [],
            initData: [],
            currentData: [],
            activeIndex: []
        }
    }

    handleSubmit = () => {
        this.putConfirmPlanTask()

    }

    backone = (e) => {
        e.preventDefault();
        this.setState((proState, state) => ({
            step: proState.step - 1
        }))
    }

    getInfo = (record, index) => {
        let { id } = record;
        let {activeIndex} = this.state;
        let i = activeIndex.findIndex(item=> item == id);
        if ( i !== -1 ) {
          activeIndex.splice(i, 1);
            this.setState({
                currentData: null,
                activeIndex
            })
        } else {
            this.setState({
                activeIndex: [id, ...this.state.activeIndex],
                currentData: [record]
            })
        }
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
        this.getConfirmPlanTaskTree()
    }

    // 获取确认计划树
    getConfirmPlanTaskTree = () => {
        const { projectId } = this.props;
        axios.get(confirmPlanTaskTree(projectId)).then(res => {
          
            const { data } = res.data
            this.setState({
                data,
                initData : data
            })
        })
    }

    // 确认计划
    putConfirmPlanTask = () => {
        const { handleCancel,projectId } = this.props
        const { activeIndex } = this.state
        if(!activeIndex || activeIndex.length == 0 ){
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '未勾选数据',
                description: '请勾选数据再操作'
            });
            return;
        }
        axios.put(confirmPlanTask(projectId || -1), [...activeIndex], true).then(res => {
            this.props.getPreparedTreeList()
            handleCancel()
        })
    }

    search = (value) => {
      const {initData } = this.state;
      let newData = dataUtil.search(initData,[{"key":"name|code","value":value}],true);
      this.setState({data:newData});
    }

    render() {

        const columns = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    let icon = dataUtil.getIcon(record.nodeType,record.taskType);
                    return <span><MyIcon type={icon} style={{ fontSize: '18px', marginRight: '8px' }} /> {text}</span>
                }
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.code'),
                dataIndex: 'code',
                key: 'code',
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planstarttime'),
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.planendtime'),
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.iptname'),
                dataIndex: 'org',
                key: 'org',
                render: data => data ? data.name : ''
            },
            {
                title: intl.get('wsd.i18n.plan.feedback.username'),
                dataIndex: 'user',
                key: 'user',
                render: data => data ? data.name : ''
            }
        ]
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    activeIndex: selectedRowKeys,
                    selectData: selectedRows
                })
            },
            getCheckboxProps: record => ({
              disabled: record.check != 1
            })
        };
        return (
            <Modal className={style.main} width="850px" centered={true}
                title="确认" visible={true} onCancel={this.props.handleCancel} footer={
                    <div className="modalbtn">
                        <SubmitButton key="back" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="3" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                      <Search search={this.search.bind(this)} />
                    </div>
                    {<Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        name={this.props.name}
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={() => {
                            return {
                                onClick: (event) => {

                                }
                            }
                        }
                        }
                    />}
                </div>
            </Modal>

        )
    }
}

const PlanPreparedReleases = Form.create()(PlanPreparedRelease)

export default PlanPreparedReleases
