import React, { Component } from 'react'
import style from './style.less'
import { Modal, Table, notification } from 'antd';
import intl from 'react-intl-universal'
import Search from '../../../../components/public/Search'
import '../../../../asserts/antd-custom.less'
import MyIcon from '../../../../components/public/TopTags/MyIcon'
import axios from "../../../../api/axios"
import * as dataUtil from "../../../../utils/dataUtil"
import SubmitButton from "../../../../components/public/TopTags/SubmitButton"
import {
  releasePlanTaskTreeByDefineIds,
  cancelReleasePlanTaskTreeByDefineIds,
  confirmPlanTaskTreeByDefineIds,
  cancelConfirmPlanTaskTreeByDefineIds,
  cancelReleasePlanTask,
  releasePlanTask,
  confirmPlanTask,
  cancelConfirmPlanTask
} from "../../../../api/api"

export class PlanPreparedRelease extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            columns: [],
            data: [],
            initData: [],
            currentData: [],
            activeIndex: []
        }
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    componentDidMount() {
        const {releaseType } = this.props;

        switch (releaseType) {
          case "direct":
            this.getReleasePlanTaskTree();
            break;
          case "abolish":
            this.getCancelReleasePlanTaskTree();
            break;
          case "confirm":
            this.getConfirmPlanTaskTree();
            break;
          case "cancelConfirm":
            this.getCancelConfirmPlanTaskTree();
            break;
        }
    }

    handleSubmit = () => {
        const { releaseType } = this.props
        switch (releaseType) {
          case "direct":
            this.putReleasePlanTask();
            break;
          case "abolish":
            this.putCancelReleasePlanTask();
            break;
          case "confirm":
            this.putConfirmPlanTask();
            break;
          case "cancelConfirm":
            this.putCancelConfirmPlanTask();
            break;
        }
    }

    // 获取直接发布计划树
    getReleasePlanTaskTree = () => {
        const { defineIds } = this.props;
        let defineIdstring = dataUtil.Arr().toString(defineIds) || "-1";
        axios.get(releasePlanTaskTreeByDefineIds(defineIdstring)).then(res => {
            const { data } = res.data
            this.setState({
                data,
                initData: data
            })
        })
    }

    // 获取取消发布计划树
    getCancelReleasePlanTaskTree = () => {
        const { defineIds } = this.props;
        let defineIdstring = dataUtil.Arr().toString(defineIds) || "-1";
        axios.get(cancelReleasePlanTaskTreeByDefineIds(defineIdstring)).then(res => {
            const { data } = res.data
            this.setState({
                data,
                initData: data
            })
        })
    }

    // 获取取消发布计划树
    getConfirmPlanTaskTree = () => {
      const { defineIds } = this.props;
      let defineIdstring = dataUtil.Arr().toString(defineIds) || "-1";
      axios.get(confirmPlanTaskTreeByDefineIds(defineIdstring)).then(res => {
        const { data } = res.data
        this.setState({
          data,
          initData: data
        })
      })
    }

    // 获取取消发布计划树
    getCancelConfirmPlanTaskTree = () => {
      const { defineIds } = this.props;
      let defineIdstring = dataUtil.Arr().toString(defineIds) || "-1";
      axios.get(cancelConfirmPlanTaskTreeByDefineIds(defineIdstring)).then(res => {
        const { data } = res.data
        this.setState({
          data,
          initData: data
        })
      })
    }

    // 确认直接发布计划
    putReleasePlanTask = () => {

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
        let url = dataUtil.spliceUrlParams(releasePlanTask(projectId || -1),{"startContent": "项目【"+this.props.selectProjectName+"】"});
        axios.put(url, [...activeIndex], true).then(res => {
            this.props.getPreparedTreeList(null,projectId)
            handleCancel()
        })
    }

    // 确认取消发布计划
    putCancelReleasePlanTask = () => {
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
        let url = dataUtil.spliceUrlParams(cancelReleasePlanTask(projectId || -1),{"startContent": "项目【"+this.props.selectProjectName+"】"});
        axios.put(url, [...activeIndex], true).then(res => {
            this.props.getPreparedTreeList(null,projectId)
            handleCancel()
        })
    }


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
      let url = dataUtil.spliceUrlParams(confirmPlanTask(projectId || -1),{"startContent": "项目【"+this.props.selectProjectName+"】"});
      axios.put(url, [...activeIndex], true).then(res => {
        this.props.getPreparedTreeList(null,projectId)
        handleCancel()
      })
    }

    // 确认取消发布计划
    putCancelConfirmPlanTask = () => {
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
      let url = dataUtil.spliceUrlParams(cancelConfirmPlanTask(projectId || -1),{"startContent": "项目【"+this.props.selectProjectName+"】"});
      axios.put(url, [...activeIndex], true).then(res => {
        this.props.getPreparedTreeList(null,projectId)
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
            selectedRowKeys: this.state.activeIndex,
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
            <Modal className={style.main} width={1100} centered={true}  mask={false}
            maskClosable={false}
                title={this.props.releaseTitle} visible={true} onCancel={this.props.handleCancel} bodyStyle={{ padding: 0 }} footer={
                    <div className="modalbtn">
                        <SubmitButton key="1" onClick={this.props.handleCancel} content="取消" />
                        <SubmitButton key="2" type="primary" onClick={this.handleSubmit} content="确定" />
                    </div>
                }>
                <div className={style.tableMain}>
                    <div className={style.search}>
                        <Search search={this.search.bind(this)} />
                    </div>
                    <Table
                        rowKey={record => record.id}
                        defaultExpandAllRows={true}
                        pagination={false}
                        name={this.props.name}
                        columns={columns}
                        rowSelection={rowSelection}
                        dataSource={this.state.data}
                        rowClassName={this.setClassName}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {

                                }
                            }
                        }
                        }
                    />
                </div>
            </Modal>
        )
    }
}


export default PlanPreparedRelease
