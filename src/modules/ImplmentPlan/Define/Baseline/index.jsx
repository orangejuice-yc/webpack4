import React, { Component } from 'react'
import { Table, Progress, Checkbox, Modal, Radio, notification } from 'antd'
import style from './style.less'
import DeleteTopBtn from '../../../../components/public/TopTags/DeleteTopBtn' //删除按钮
import AddTopBtn from '../../../../components/public/TopTags/AddTopBtn' //新增按钮
import ModifyTopBtn from '../../../../components/public/TopTags/ModifyTopBtn'
import PlanDefineBaselineAdd from './Add' //新增进度基线
import { maintainData, initStructureCode } from '../../../../api/function'  //引入增删改查

import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import {defineBaselineList, defineBaselineActive, defineBaselineDel, defineDel} from '../../../../api/api'
import * as dataUtil from "../../../../utils/dataUtil"

const confirm = Modal.confirm
const RadioGroup = Radio.Group;


export class PlanDefineBaseline extends Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [],
            addBaselineVisiable: false,
            data: [],
            activeIndex: null,
            record: null,
            title: '',
            selectedRowKeys: [],
            type: ''

        }
    }

    getData = () => {
        axios.get(defineBaselineList(this.props.data.id)).then(res => {
            
            this.setState({
                data: res.data.data
            })
        })
    }

    componentDidMount() {
        this.getData();
    }

    addBaselineCancelModal = () => {
        this.setState({
            addBaselineVisiable: false
        })
    }


    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id === this.state.activeIndex ? 'tableActivty' : "";
    }

    getInfo = (record, index) => {
        let { activeIndex } = this.state;

            this.setState({
                activeIndex: record.id,
                record: record,
            })
        
    }

    //执行基线点击事件
    radio = (record) => {

        let {startContent} = this.props.extInfo  || {};
        let url = dataUtil.spliceUrlParams(defineBaselineActive(this.props.data.id, record.id),{startContent});

        axios.put(url, {}, true).then(res => {
            
            if (res.data.status == 200) {
                var radIndex = this.state.data.findIndex(v => v.id == record.id)
                record.isExecute = 1;
                var Data = [];

                this.state.data.map((item, i) => {
                    if (i !== radIndex) {
                        item.isExecute = 0;
                        Data.push(item);
                    } else {
                        Data.push(record)
                    }
                })
                this.setState({
                    data: Data
                })
            }
        })
    }

    //新增基线
    addData = (val) => {
        let { data } = this.state;
        data.push(val);
        this.setState({
            data
        })
    }

    //修改基线
    upDate = (val) => {
        let { data } = this.state;
        let index = data.findIndex(item => item.id == val.id);
        data.splice(index, 1, val)
        
        this.setState({ data })
    }


    render() {
        const { intl } = this.props.currentLocale;

        const showFormModal = (name, e) => {
            if (name == 'AddTopBtn') {
                this.setState({
                    addBaselineVisiable: true,
                    title: '新增',
                    type: 'add'
                })
            }
            if (name == 'ModifyTopBtn') {
                if (this.state.record) {
                    this.setState({
                        addBaselineVisiable: true,
                        title: '修改',
                        type: 'amend'
                    })
                } else {
                    notification.warning(
                        {
                            placement: 'bottomRight',
                            bottom: 50,
                            duration: 2,
                            message: '未选中数据',
                            description: '请选择数据'
                        }
                    )
                }
            }
            if (name == 'DeleteTopBtn') {
                let { selectedRowKeys, record } = this.state;
                if (selectedRowKeys.length) {
                    let {startContent} = this.props.extInfo  || {};
                    let url = dataUtil.spliceUrlParams(defineBaselineDel,{startContent});
                    axios.deleted(url, { data: selectedRowKeys }, true).then(res => {
                        let copyData = [...this.state.data]
                        selectedRowKeys.map((item) => {
                            let ind = copyData.findIndex(val => val.id == item)
                            if (ind != -1) {
                                copyData = [...copyData.slice(0, ind), ...copyData.slice(ind + 1)]
                            }
                        })
                        let index = record ? selectedRowKeys.findIndex(item => item == record.id) : -1;
                        if(index == -1){
                            this.setState({
                                data: copyData,
                                selectedRowKeys: []
                            })
                        } else{
                            this.setState({
                                data: copyData,
                                selectedRowKeys: [],
                                record: null
                            })
                        }
                        
                    })
                } else {
                    notification.warning(
                        {
                            placement: 'bottomRight',
                            bottom: 50,
                            duration: 2,
                            message: '未选中数据',
                            description: '请选择数据'
                        }
                    )
                }

            }
        }
        let { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys
                })
            }
        };

        const columns = [
            {
                title: intl.get('wsd.i18n.plan.baseline.baselinename'),
                dataIndex: 'baselineName',
                key: 'baselineName',
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.baselinetype'),
                dataIndex: 'baselineType',
                key: 'baselineType',
                render: text => text ? text.name : ''
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.creattime'),
                dataIndex: 'creatTime',
                key: 'creatTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.creator'),
                dataIndex: 'creator',
                key: 'creator',
                render: text => text ? text.name : ''
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.lastupdtime'),
                dataIndex: 'lastUpdTime',
                key: 'lastUpdTime',
                render: (text) =>  dataUtil.Dates().formatDateString(text)
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.isexecute'),
                dataIndex: 'isExecute',
                key: 'isExecute',
                render: (text, record) => (
                    <span className={text == 1 ? style.radioT : style.radioF} onClick={this.radio.bind(this, record)}></span>
                )
            },
            {
                title: intl.get('wsd.i18n.plan.baseline.remark'),
                dataIndex: 'remark',
                key: 'remark',
            },
        ]

        return (
            <div className={style.main}>
                <h3 className={style.listTitle}>进度基线</h3>
                <div className={style.rightTopTogs}>
                    <AddTopBtn  onClickHandle={showFormModal} />
                    <ModifyTopBtn onClickHandle={showFormModal} />
                    <DeleteTopBtn onClickHandle={showFormModal} />
                </div>
                <div className={style.mainScorll}>
                    <Table rowKey={record => record.id} columns={columns}
                        dataSource={this.state.data} pagination={false}
                        size='small'
                        rowClassName={this.setClassName}
                        rowSelection={rowSelection}
                        onRow={(record, index) => {
                            return {
                                onClick: (event) => {
                                    this.getInfo(record, index)
                                }
                            }
                        }
                        } />
                </div>
                {this.state.addBaselineVisiable && <PlanDefineBaselineAdd extInfo = {this.props.extInfo }
                    modalVisible={this.state.addBaselineVisiable} title={this.state.title} type={this.state.type}
                    handleCancel={this.addBaselineCancelModal} data={this.props.data} projectId={this.props.projectId}
                    addData={this.addData} record={this.state.record} upDate={this.upDate} />}
            </div>
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineBaseline);
