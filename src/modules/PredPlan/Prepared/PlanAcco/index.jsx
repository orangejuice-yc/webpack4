/*
 * @Author: wihoo.wanghao
 * @Date: 2019-01-16 16:38:09
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-04-28 11:49:39
 */
import React, { Component } from 'react'
import intl from 'react-intl-universal'
import _ from 'lodash'
import { Table, Progress, notification } from 'antd'
import style from './style.less'
import DeleteTopBtn from '../../../../components/public/TopTags/DeleteTopBtn' //删除按钮
import DistributionBtn from '../../../../components/public/TopTags/DistributionBtn' //分配按钮
import DistributionModal from './Distribution'  //分配弹窗
import CheckModal from './CheckModal' //交付清单
import Log from './Log' //日志
import * as dataUtil from "../../../../utils/dataUtil"
import axios from "../../../../api/axios"
import PublicTable from '../../../../components/PublicTable'
import {
    deletePlanTaskAssgin,
    getTaskRelationTree
} from "../../../../api/api"
import PublicButton from "../../../../components/public/TopTags/PublicButton";
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'


export class PlanPreparedPlanAcco extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'PlanPreparedPlanAcco',
            width: '',
            initDone: false,
            columns: [],
            distributionModaVisible: false,
            checkModalVisible: false,
            logModalVisible: false,
            data: [],
            activeIndex: [],
            selectData: [],
            currentRecord: null,
            selectedRowKeys: []
        }
    }
    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }
    getInfo = (record, index) => {
        let currentIndex = this.state.activeIndex.findIndex(item => item == record.id)
        if (currentIndex > -1) {
            this.setState((preState, props) => {
                preState.activeIndex.splice(currentIndex, 1)
                preState.selectData.splice(currentIndex, 1)
                return {
                    activeIndex: preState.activeIndex,
                    selectData: null
                }
            })
        } else {
            this.setState({
                activeIndex: [record.id],
                selectData: [record]
            })
        }
    }

    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? `${style['clickRowStyl']}` : "";
    }

    viewPayList = () => {
        this.setState({
            checkModalVisible: true
        })
    }

    //Release弹窗关闭
    handleDistributionCancel = () => {
        this.setState({
            distributionModaVisible: false
        })
    }

    closeCheckModal = () => {
        this.setState({
            checkModalVisible: false
        })
    }



    // 获取计划关联列表
    getPlanTaskRelationTree = (callBack) => {
        const { rightData } = this.props
        if (rightData && (rightData[0]['nodeType'] == 'wbs' || rightData[0]['nodeType'] == 'task')) {
            axios.get(getTaskRelationTree(rightData[0]['id'])).then(res => {
                callBack(res.data.data ? res.data.data : [])
                const { data } = res.data
                this.setState({
                    data
                })
            })
        } else {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '数据类型不符合',
                    description: '所选择的数据类型为task，wbs'
                }
            )
        }
    }

    // 删除计划关联
    deletePlanTaskAssgin = () => {
        const { activeIndex, selectedRowKeys } = this.state
        let { startContent } = this.props.extInfo || {};
        let url = dataUtil.spliceUrlParams(deletePlanTaskAssgin, { startContent });
        axios.deleted(url, { data: selectedRowKeys }, true, null, true).then(res => {
            this.table.getData();
            this.setState({
                selectedRowKeys: [],
                record: null,
                selectData: []
            })
        })
    }

    // 进展日志
    viewPrograssLog = (record) => {
        this.setState({
            logModalVisible: true,
            currentRecord: record
        })
    }

    // 关闭进展日志
    closeLogModal = () => {
        this.setState({
            logModalVisible: false
        })
    }
    /**
          * 获取复选框 选中项、选中行数据
          * @method updateSuccess
          * @param {string} selectedRowKeys 复选框选中项
          * @param {string} selectedRows  行数据
          */
    getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRows,
            selectedRowKeys
        })
    }
    deleteVerifyCallBack = () => {
        const { selectedRowKeys } = this.state;
        if (!selectedRowKeys || selectedRowKeys.length == 0) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选择数据',
                    description: '请选择数据操作'
                }
            )
            return false;
        }
        return true;
    }

    refresh = () => {
        this.table.getData()
    }
    render() {
        const columns = [
            {
                title: "名称", //名称
                dataIndex: 'taskName',
                key: 'taskName',
                width:200,
                render: (text, record) => dataUtil.getIconCell(record.nodeType, text, record.taskType)
            },
            {
                title: "代码", //代码
                dataIndex: 'taskCode',
                key: 'taskCode',
                width:100,
            },
            {
                title: "项目", //项目
                dataIndex: 'projectName',
                key: 'projectName',
                width:200,
            },
            {
                title: "计划开始", // 计划开始 
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                width:200,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "计划完成", //计划完成
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                width:200,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "实际开始", //实际开始
                dataIndex: 'actStartTime',
                key: 'actStartTime',
                width:200,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "实际完成", //实际完成
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                width:200,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "责任主体", //责任主体
                dataIndex: 'org',
                key: 'org',
                width:100,
                render: data => data && data.name
            },
            {
                title: "责任人", //责任人
                dataIndex: 'user',
                key: 'user',
                width:100,
                render: data => data && data.name
            },
            {
                title: "进度%", //进度
                dataIndex: 'completePct',
                key: 'completePct',
                width:100,
                render: text => {
                    if (text) {
                        return <Progress percent={text} className={style.myProgress} strokeWidth={10} />
                    } else {
                        return "--"
                    }
                }
            },
            {
                title: "进展日志", //进展日志
                dataIndex: 'action',
                key: 'action',
                render: (text, record) => {
                    return <a href="javascript:void(0);" onClick={this.viewPrograssLog.bind(this, record)}>查看</a>
                }
            }
        ]

        return (

          <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode}>
            <LabelToolbar>
              {/*分配*/}
              <PublicButton title={"分配"} edit={this.props.editAuth || false} useModel={false}
                            afterCallBack={() => { this.setState({ distributionModaVisible: true }) }} icon={"icon-fenpei"} />
              {/*删除*/}
              <PublicButton title={"删除"} edit={this.props.editAuth || false} useModel={true}
                            verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.deletePlanTaskAssgin} icon={"icon-delete"} />
            </LabelToolbar>
            <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {400}>
              {this.state.data &&

              <PublicTable onRef={this.onRef} getData={this.getPlanTaskRelationTree}
                           pagination={false} columns={columns}
                           scroll={{ x: 1800, y: this.props.height - 50 }}
                           getRowData={this.getInfo}
                           useCheckBox={true}
                           rowSelection={true}
                           onChangeCheckBox={this.getSelectedRowKeys}

              />
              }
            </LabelTable>
            {this.state.distributionModaVisible && <DistributionModal
              rightData={this.props.rightData}
              selectData={this.state.selectData}
              handleCancel={this.handleDistributionCancel}
              getPlanTaskRelationTree={this.refresh}
              extInfo={this.props.extInfo}
            />}
            <CheckModal
              visible={this.state.checkModalVisible}
              handleCancel={this.closeCheckModal}
            />
            {this.state.logModalVisible && <Log data={this.state.currentRecord} handleCancel={this.closeLogModal} />}
          </LabelTableLayout>
        )
    }
}

export default PlanPreparedPlanAcco
