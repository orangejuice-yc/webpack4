import React, { Component } from 'react'
import style from './style.less'
import { connect } from 'react-redux'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import TreeTable from "../../../../components/PublicTable"
import axios from "../../../../api/axios"
import { getClassifylist, getAssignTaskTree, getAssignTaskList, getAssignedList, deleteAssignedTask } from "../../../../api/api"
import MyIcon from "../../../../components/public/TopTags/MyIcon"
import * as dataUtil from "../../../../utils/dataUtil"
import ExtLayout from "../../../../components/public/Layout/ExtLayout";
import MainContent from "../../../../components/public/Layout/MainContent";
import Toolbar from "../../../../components/public/Layout/Toolbar";
import LeftContent from "../../../../components/public/Layout/LeftContent"
import TopTags from "../../../../components/public/Layout/TopTags"
import CategoryCodeModal from "./CategoryCodeModal"
export class CategoryCodeTab extends Component {
    constructor(props) {
        super(props)
        this.state = {
            selectedRowKeys: [],
            selectedRowKeys1: [],

        }
    }




    /**
     @method 父组件即可调用子组件方法
     @description 父组件即可调用子组件方法
     */
    onRef = (ref) => {
        this.table = ref
    }
    //table表格单行点击回调
    getInfo = (record) => {
       
        this.setState({
            record
        }, () => {
          
                this.tablef.getData()
            
        })
    }
    //获取分类码
    getDataList = (callBack) => {
        axios.get(getClassifylist("task")).then(res => {
            callBack(res.data.data || [])
            this.setState({
                data: res.data.data || [],
                record:null
            })
        })
    }




    //
    onReff = (ref) => {
        this.tablef = ref
    }
    //获取已分配的任务
    getAssignedListData = (callBack) => {
        if (this.state.record && this.state.record.classifyType == 2) {
            let root = dataUtil.Table(this.state.data || []).getRootItemById(this.state.record.id);
            let classifyTypeId = root ? root.id : 0;
            axios.get(getAssignedList(this.state.record.id, classifyTypeId, "task")).then(res => {
                this.setState({
                    list: res.data.data || []
                })
                callBack(res.data.data || [])
            })
        } else {
            callBack([])
        }

    }
    //获取已分配任务行数据
    getRecord = (record) => {

    }
    /**
 * 获取复选框 选中项、选中行数据
 * @method updateSuccess
 * @param {string} selectedRowKeys 复选框选中项
 * @param {string} selectedRows  行数据
 */
    getSelectedRowKeys1 = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRows1: selectedRows,
            selectedRowKeys1: selectedRowKeys
        })
    }
    deleteAssignedTask = () => {
        const { selectedRowKeys1 } = this.state
        if (selectedRowKeys1.length == 0) {
            dataUtil.message("请勾选数据进行操作！")
        } else {
            axios.deleted(deleteAssignedTask, { data: selectedRowKeys1 }, true, null, true).then(res => {
                this.tablef.getData()
            })
        }
    }
    hasRecord = () => {
        const { selectedRowKeys1 } = this.state
        if (selectedRowKeys1 == 0) {
            dataUtil.message("请勾选数据进行操作！")
            return false
        } else {
            return true
        }
    }
    update = () => {
        this.tablef.getData()
        this.setState({ isOpenCategoryCode: false })
    }
    openAssign = () => {
        const { record } = this.state
        if (!record) {
            dataUtil.message("请选择码值")
        } else if (record.classifyType != 2) {
            dataUtil.message("请选择码值")
        } else {
            this.setState({
                isOpenCategoryCode: true
            })
        }
    }
    render() {
        const { intl } = this.props.currentLocale
        const columns1 = [
            {
                title: intl.get("wsd.i18n.plan.activitydefineinfo.category"),
                dataIndex: 'classifyCode',
                key: 'classifyCode',
                width: '50%',
                render: (text, record) => {
                    if (record.classifyType == 1) {
                        return <span><MyIcon type="icon-fenleima" style={{ fontSize: 18, verticalAlign: "middle" }} />{text}</span>
                    }
                    if (record.classifyType == 2) {
                        return <span><MyIcon type="icon-fenleima-mazhi"
                            style={{ fontSize: 18, verticalAlign: "middle" }} />{text}</span>
                    }
                }
            },
            {
                title: intl.get("wsd.i18n.plan.activitydefine.remark"),
                dataIndex: 'classifyName',
                key: 'classifyName',
            },

        ]

        const columns3 = [
            {
                title: intl.get('wsd.i18n.plan.feedback.name'),
                dataIndex: 'taskName',
                key: 'taskName',
                width: 120,
                render: (text, record) => {
                    if (record.taskType == 0) {
                        return dataUtil.getIconCell("wbs", text)
                    } else {
                      
                        return dataUtil.getIconCell("task", text, record.taskType)

                    }
                }


            },
            {
                title: "代码",
                dataIndex: 'taskCode',
                key: 'taskCode',
                width: 100,

            },
            {
                title: "责任主体",
                dataIndex: 'org',
                key: 'org',
                width: 100,
                render: (text, record) => text ? text.name : null
            },
            {
                title: "责任人",
                dataIndex: 'user',
                key: 'user',
                width: 100,
                render: (text, record) => text ? text.name : null
            },
            {
                title: "计划开始时间",
                dataIndex: 'planStartTime',
                key: 'planStartTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "计划结束时间",
                dataIndex: 'planEndTime',
                key: 'planEndTime',
                width: 100,
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
        ]
        return (
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <LeftContent width={500}>
                    <TreeTable
                        onRef={this.onRef}
                        getData={this.getDataList}
                        columns={columns1}
                        getRowData={this.getInfo}
                        expanderLevel={1}

                    />

                </LeftContent>
                <MainContent contentWidth={this.state.contentWidth} contentMinWidth={600}>
                    <TreeTable
                        onRef={this.onReff}
                        getData={this.getAssignedListData}
                        columns={columns3}
                        getRowData={this.getRecord}
                        expanderLevel={1}
                        rowSelection={true}
                        onChangeCheckBox={this.getSelectedRowKeys1}
                        useCheckBox={true}

                    />
                </MainContent>

                <Toolbar>
                    <TopTags>
                        {/*分配*/}
                        <PublicButton title={"分配"} edit={true}
                            afterCallBack={() => { this.setState(this.openAssign) }} icon={"icon-fenpei"} />
                        <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                            useModel={true} edit={true}
                            verifyCallBack={this.hasRecord}
                            afterCallBack={this.deleteAssignedTask}
                            content={'你确定要删除吗？'}
                        />
                    </TopTags>

                </Toolbar>

                {/*分类码*/}
                {this.state.isOpenCategoryCode && <CategoryCodeModal
                    handleCancel={() => this.setState({ isOpenCategoryCode: false })}
                    record={this.state.record}
                    data={this.state.data}
                    list={this.state.list}
                    update={this.update}
                    defineId={this.props.menuInfo.defineId} />}
            </ExtLayout>



        )
    }
}


const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(CategoryCodeTab);
