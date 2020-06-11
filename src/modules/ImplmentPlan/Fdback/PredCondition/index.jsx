import React, { Component } from 'react'
import { Input, InputNumber, DatePicker } from 'antd'
import intl from 'react-intl-universal'
import style from './style.less'
import axios from "../../../../api/axios"
import {
    getPlanTaskPredList_,
    getPlanTaskFollowList_,
    updatePlanTaskPred_
} from "../../../../api/suzhou-api"
import * as dataUtil from '../../../../utils/dataUtil';
import PublicTable from '../../../../components/PublicTable'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import PlanComponentLog from '../../Components/Logic/detail'

export class PlaPredCondition extends Component {
    constructor(props) {
        super(props)
        this.state = {
            name: 'PlanComponentsLog',
            initDone: false,
            amendData:{},
            columns: [
                {
                    title: "名称",
                    dataIndex: 'taskName',
                    key: 'taskName',
                    width: 220
                },
                // {
                //     title: "所属计划",
                //     dataIndex: 'defineName',
                //     key: 'defineName',
                //     width : 200
                // },
                /*{
                    title: "代码",
                    dataIndex: 'taskCode',
                    key: 'taskCode',
                    width: 100
                },*/
                {
                    title: "计划开始",
                    dataIndex: 'planStartTime',
                    key: 'planStartTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width: 100
                },
                {
                    title: "计划完成",
                    dataIndex: 'planEndTime',
                    key: 'planEndTime',
                    render: data => data && dataUtil.Dates().formatDateString(data),
                    width: 100
                },
                {
                    title: "实际开始",
                    dataIndex: 'actStartTime',
                    key: 'actStartTime',
                    render: (text, record) => {
                        if (record.planType == '4' && this.state.amendData.id == record.id) {
                            if(typeof text === "string"){
                                text = dataUtil.Dates().formatTimeMonent(text);
                            }
                            return  <DatePicker style={{ width: '66%' }} defaultValue={text} ref={node => (this.input = node)} format={'YYYY-MM-DD'}
                                showTime={{}}
                                onChange={this.actStartChange}
                            />
                        } else {
                            return text ? dataUtil.Dates().formatDateString(text) : null
                        }
                    },
                    width: 100
                },
                {
                    title: "实际完成",
                    dataIndex: 'actEndTime',
                    key: 'actEndTime',
                    render: (text, record) => {
                        if (record.planType == '4' && this.state.amendData.id == record.id) {
                            if(typeof text === "string"){
                                text = dataUtil.Dates().formatTimeMonent(text);
                            }
                            return  <DatePicker style={{ width: '66%' }} defaultValue={text} ref={node => (this.input = node)} format={'YYYY-MM-DD'}
                                showTime={{}}
                                onChange={this.actEndChange}
                            />
                        } else {
                            return text ? dataUtil.Dates().formatDateString(text) : null
                        }
                    },
                    width: 100
                },
                {
                    title: '完成百分比',
                    dataIndex: 'completePct',
                    key: 'completePct',
                    width: 100,
                    render: (text, record) => {
                        if (record.planType == '4' && this.state.amendData.id == record.id) {
                            return  <InputNumber style={{ width: '100%' }} defaultValue={text} ref={node => (this.input = node)}
                                onChange={this.completePctChange} min={0} max={100}
                            />
                        } else {
                            return text
                        }
                    },
                    //edit: { formType: 'InputNumber', editable: true, handleSave: this.handleSave ,min:0,max:100,verItemEditable: this.verItemEditable},
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.iptname'),
                    dataIndex: 'org',
                    key: 'org',
                    render: data => data && data.name,
                    width: 120
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.username'),
                    dataIndex: 'user',
                    key: 'user',
                    render: data => data && data.name,
                    width: 100
                },
                {
                    title: intl.get('wsd.i18n.plan.subTask.relationtype'),
                    dataIndex: 'relationType',
                    key: 'relationType',
                    /*edit: {
                        formType: 'Select', required: true, editable: true, handleSave: this.handleSave, verItemEditable: this.verItemEditable,
                        items: [{ value: 'SF', title: 'SF' }, { value: 'SS', title: 'SS' }, { value: 'FS', title: 'FS' }, { value: 'FF', title: 'FF' }]
                    },*/
                    render: (text, record) => <div className="editable-row-text">{text}</div>,
                    width: 100
                },
                /*{
                    title: '完成状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: text => text && text.name
                }, */
                {
                    title: '进展说明',
                    dataIndex: 'remark',
                    key: 'remark',
                    render: (text, record) => {
                        if (record.planType == '4' && this.state.amendData.id == record.id) {
                            return  <Input style={{ width: '100%' }} defaultValue={text} ref={node => (this.input = node)}
                                onChange={this.remarkChange}
                            />
                        } else {
                            return <span title={text}>{text}</span>
                        }
                    },
                    width: 260
                },
                {
                    title: "进展日志",
                    width: 80,
                    render: (text, record) => {
                        return <a onClick={this.viewDetail.bind(this, record)} style={{ cursor: 'pointer' }}>详情</a>
                    }
                },
                {
                    title: '操作',
                    dataIndex: 'operation',
                    width: 120,
                    render: (text, record) => {
                        if (record.planType == '4') {
                            if (this.state.amendData.id == record.id) {
                                return (
                                    <span>
                                        <a className={style.amendClick} onClick={this.amendAmendClick.bind(this, record)} style={{ marginRight: 5 }}>确认</a>
                                        <a onClick={this.amendCancelClick.bind(this, record)} className={style.amendClick}>取消</a>
                                    </span>
                                )
                            } else {
                                return (
                                    <a onClick={this.amendClick.bind(this, record)} className={style.amendClick}>反馈</a>
                                )
                            }
                        } else {
                            return (
                                <span className={style.amendClick}>反馈</span>
                            )
                        }
                    },
                },
            ],
            data: [],
            editingKey: '',
            distributionModaVisible: false,
            activeStyle: 1,
            activeIndex: [],
            selectData: [],
            selectedRowKeys: [],
            selectedRows: []
        }
    }

    viewDetail = (record) => {
        this.setState({
            isShowModal: true,
            selectData:record
        });
    }

    //表格修改
    amendClick = (record) => {
        this.setState({
            amendData: record,
            actStartChangeVal:record.actStartTime,
            actEndChangeVal:record.actEndTime,
            completePctChangeVal:record.completePct,
            remarkChangeVal:record.remark
        })
    }

    //表格修改取消
    amendCancelClick = () => {
        this.setState({
            amendData: {},
            actStartChangeVal:null,
            actEndChangeVal:null,
            completePctChangeVal:null,
            remarkChangeVal:null
        })
    }
    
     //表格修改确认
    amendAmendClick = (record) => {
        let { actStartChangeVal, actEndChangeVal,completePctChangeVal,remarkChangeVal } = this.state;
        actStartChangeVal = actStartChangeVal ? dataUtil.Dates().formatTimeString(actStartChangeVal) : null;
        actEndChangeVal = actEndChangeVal ? dataUtil.Dates().formatTimeString(actEndChangeVal) : null;
        completePctChangeVal = completePctChangeVal ? completePctChangeVal : 0;
        let newItem = record;
        newItem["actStartTime"]=actStartChangeVal;
        newItem["actEndTime"]=actEndChangeVal;
        newItem["remark"]=remarkChangeVal;
        newItem["completePct"]=completePctChangeVal;
        //let thisobj = this;
        axios.put(updatePlanTaskPred_, { ...newItem}, false, null, true).then(res => {
            //util.modify(data, dataMap, record, res.data.data);
            this.amendCancelClick();
            //thisobj.refreshDataList();
        })
    }

    actStartChange = (e,value) => {
        this.setState({
            actStartChangeVal: value
        })
    }

    actEndChange = (e,value) => {
        this.setState({
            actEndChangeVal: value
        })
    }

    completePctChange = (value) => {
        this.setState({
            completePctChangeVal: value
        })
    }

    remarkChange = (e) => {
        this.setState({
            remarkChangeVal: e.target.value
        })
    }

    componentDidMount() {

    }
    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }
    /**
     * 获取数据（紧前任务，后置任务）
     * @param callback
     */
    getDataList = (callback) => {
        const { rightData } = this.props;
        const { activeStyle } = this.state;
        let url;
        if (activeStyle == 1) {
            url = getPlanTaskPredList_(rightData['id']);
        } else {
            url = getPlanTaskFollowList_(rightData['id'])
        }
        axios.get(url).then(res => {
            callback(res.data.data);
        })
    }
    /**
     *
     * @param v
     */
    changeTab = (v) => {
        this.setState({ activeStyle: v }, () => {
            this.refreshDataList();
        })
    }

    /**
     * 刷新数据
     */
    refreshDataList = () => {
        this.table.getData();
    }

    getInfo = (record, index) => {
        this.setState({
            activeIndex: record.id,
            selectData: record
        })
    };

    handleCancel = () =>{
        this.setState({
            isShowModal: false,
        });
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

    render() {
        return (

            <LabelTableLayout title={this.props.title} menuCode={this.props.menuCode} >
                <LabelTable labelWidth={this.props.labelWidth} contentMinWidth={1000} defaultSurplusHeight={45}>
                    <div className={style.tabsToggle}>
                        <a href="javascript:void(0)" onClick={() => { this.changeTab(1) }} className={this.state.activeStyle == 1 ? style.active : ''}>紧前任务</a>
                        <a href="javascript:void(0)" onClick={() => { this.changeTab(2) }} className={this.state.activeStyle == 2 ? style.active : ''}>后续任务</a>
                    </div>
                    <PublicTable istile={true}
                        onRef={this.onRef}
                        getData={this.getDataList}
                        pagination={false}
                        columns={this.state.columns}
                        getRowData={this.getInfo}
                        useCheckBox={true}
                        rowSelection={true}
                        onChangeCheckBox={this.getSelectedRowKeys}
                    />
                </LabelTable>
                {this.state.isShowModal &&
                    <PlanComponentLog
                        data = {this.state.selectData}
                        extInfo = {this.props.extInfo}
                        menuCode={this.props.menuCode}
                        handleCancel= {this.handleCancel}
                    />}
            </LabelTableLayout>
        )
    }
}

export default PlaPredCondition
