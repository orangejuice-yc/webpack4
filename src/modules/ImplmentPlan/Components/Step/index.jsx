import React, { Component } from 'react'
import { notification, Icon } from 'antd'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import CheckStep from "./CheckStep"
import { connect } from 'react-redux'
import { queryPlanTaskStepList_, deletePlanTaskStep_, getPlanTaskId_ } from '../../../../api/suzhou-api'
import axios from '../../../../api/axios'
import PublicTable from '../../../../components/PublicTable'
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import * as dataUtil from '../../../../utils/dataUtil';

class PlanTaskStep extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: [],
            rightData: null,
            selectedRowKeys: [],
            data: [],
            type: '',
        }
    }

    componentDidMount() {
        let loginUser = JSON.parse(sessionStorage.getItem('userInfo'));
        this.setState({
            loginUser
        })
    }

    getData = (callBack) => {
        const { custom01, custom02, custom08 } = this.props.data
        let relationTaskId
        if (custom01 != null && custom02 != null) {
            axios.get(getPlanTaskId_(custom08)).then(res => {
                relationTaskId = res.data.data
                axios.get(queryPlanTaskStepList_(relationTaskId,this.props.data.id,this.props.menuCode)).then(res => {
                    callBack(res.data.data ? res.data.data : [])
                    this.setState({
                        data: res.data.data,
                        relationTaskId: relationTaskId
                    })
                })
            })
        } else if (custom01 != null && custom02 == null) {
            relationTaskId = custom08
            axios.get(queryPlanTaskStepList_(relationTaskId,this.props.data.id,this.props.menuCode)).then(res => {
                callBack(res.data.data ? res.data.data : [])
                this.setState({
                    data: res.data.data,
                    relationTaskId: relationTaskId
                })
            })
        } else if (custom01 == null && custom02 == null) {
            relationTaskId = this.props.data.id
            axios.get(queryPlanTaskStepList_(relationTaskId,this.props.data.id,this.props.menuCode)).then(res => {
                callBack(res.data.data ? res.data.data : [])
                this.setState({
                    data: res.data.data,
                    relationTaskId: relationTaskId
                })
            })
        }
        
    }
    /**
    @method 父组件即可调用子组件方法
    @description 父组件即可调用子组件方法
    */
    onRef = (ref) => {
        this.table = ref
    }

    getInfo = (record, index) => {

        const creator = record.creator
        const { loginUser } = this.state
        this.setState({
            rightData: record,
            isEdit: creator == loginUser.id ? true : false
        })

    };
    //删除验证
    deleteVerifyCallBack = () => {
        const { intl } = this.props.currentLocale
        let { selectedRowKeys, rightData } = this.state;
        if (selectedRowKeys.length == 0) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: intl.get('wsd.global.tip.title2'),
                    description: intl.get('wsd.global.tip.content2')
                }
            )
            return false
        } else {
            return true
        }
    }

    onClickHandle = (name) => {

        const { intl } = this.props.currentLocale
        if (name == 'AddTopBtn') {
            this.setState({
                isShow: true,
                type: "add",
                ModalTitle: "新增工序",
            });
            return;
        }
        if (name == "ModifyTopBtn") {
            if (this.state.rightData) {

                this.setState({
                    isShow: true,
                    ModalTitle: '修改工序',
                    type: 'modify'
                })
            } else {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 2,
                        message: intl.get('wsd.global.tip.title2'),
                        description: intl.get('wsd.global.tip.title1')
                    }
                )

            }
        }
        if (name == "DeleteTopBtn") {
            let { selectedRowKeys, rightData } = this.state;
            if (selectedRowKeys.length) {
                axios.deleted(deletePlanTaskStep_, { data: selectedRowKeys }).then(res => {
                    this.table.getData();

                    let index = rightData ? selectedRowKeys.findIndex(item => item == rightData.id) : -1;
                    if (index !== -1) {
                        this.setState({
                            selectedRowKeys: [],
                            rightData: null,
                        })
                    } else {
                        this.setState({
                            selectedRowKeys: [],
                        })
                    }
                })
            } else {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 2,
                        message: intl.get('wsd.global.tip.title2'),
                        description: intl.get('wsd.global.tip.content2')
                    }
                )
            }
        }
    }

    //关闭
    handleCancel = () => {
        this.setState({
            isShow: false
        })
    }

    //新增
    addData = (newData) => {
        this.table.add(null, newData);
    }
    //更改
    updateData = (newData) => {
        this.table.update(this.state.rightData, newData);
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
        const { intl } = this.props.currentLocale

        const columns = [
            {
                title: "工序名称",
                dataIndex: 'name',
                key: 'name',
            },
            // {
            //     title: "编号",
            //     dataIndex: 'code',
            //     key: 'code',
            // },
            {
                title: "设计总量",
                dataIndex: 'totalDesign',
                key: 'totalDesign',
            },
            {
                title: "计量单位",
                dataIndex: 'unit',
                key: 'unit',
                render: text => text ? text.name : ''
            },
            {
                title: "权重",
                dataIndex: 'estwt',
                key: 'estwt'
            },
            // {
            //     title: "计划完成量",
            //     dataIndex: 'planComplete',
            //     key: 'planComplete',
            // },
            {
                title: "实际完成量",
                dataIndex: 'actComplete',
                key: 'actComplete',
            },
            // {
            //     title: "实际开始时间",
            //     dataIndex: 'actStartTime',
            //     key: 'actStartTime',
            //     render: (text) => dataUtil.Dates().formatDateString(text)
            // },
            {
                title: "实际完成时间",
                dataIndex: 'actEndTime',
                key: 'actEndTime',
                render: (text) => dataUtil.Dates().formatDateString(text)
            },
            {
                title: "完成百分比",
                dataIndex: 'completePct',
                key: 'completePct',
            },
        ];

        return (
            <LabelTableLayout title={this.props.title} menuCode={this.props.menuCode}>
                <LabelToolbar>
                    {/*新增*/}
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'} edit={this.props.data.status.id == 'EDIT'} afterCallBack={this.onClickHandle.bind(this, 'AddTopBtn')} />
                    {/*修改*/}
                    <PublicButton name={'修改'} title={'修改'} edit={this.props.data.status.id == 'EDIT' && this.state.isEdit} icon={'icon-xiugaibianji'} afterCallBack={this.onClickHandle.bind(this, 'ModifyTopBtn')} />
                    {/*删除*/}
                    <PublicButton title={"删除"} edit={this.props.data.status.id == 'EDIT' && this.state.isEdit} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />
                </LabelToolbar>
                <LabelTable labelWidth={this.props.labelWidth} contentMinWidth={1000}>
                    <PublicTable onRef={this.onRef}
                        getData={this.getData}
                        dataSource={this.state.data}
                        columns={columns}
                        rowSelection={true}
                        onChangeCheckBox={this.getSelectedRowKeys}
                        useCheckBox={true}
                        scroll={{ x: 1200, y: this.props.height - 100 }}
                        getRowData={this.getInfo} />
                </LabelTable>
                {this.state.isShow &&
                    <CheckStep
                        data={this.state.rightData}
                        type={this.state.type}
                        title={this.state.ModalTitle}
                        handleCancel={this.handleCancel}
                        update={this.updateData}
                        addData={this.addData}
                        relationTaskId={this.state.relationTaskId}
                        sourceTaskId={this.props.data.id}
                    />
                }
            </LabelTableLayout>
        )
    }
}



const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(PlanTaskStep);
