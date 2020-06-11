import React, { Component } from 'react'
import { Table, Progress, Checkbox, Modal, Radio, notification } from 'antd'
import style from './style.less'
import DeleteTopBtn from '../../../../components/public/TopTags/DeleteTopBtn' //删除按钮
import AddTopBtn from '../../../../components/public/TopTags/AddTopBtn' //新增按钮
import ModifyTopBtn from '../../../../components/public/TopTags/ModifyTopBtn'
import PlanDefineBaselineAdd from './Add' //新增进度基线
import { maintainData, initStructureCode } from '../../../../api/function'  //引入增删改查
import Vs from "./Vs"
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import { defineBaselineList, defineBaselineActive, defineBaselineDel, defineDel } from '../../../../api/api'
import * as dataUtil from "../../../../utils/dataUtil"
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import PublicTable from '../../../../components/PublicTable'
const confirm = Modal.confirm
const RadioGroup = Radio.Group;
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'

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
    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }
    getData = (callBack) => {
        axios.get(defineBaselineList(this.props.data.id)).then(res => {
            callBack(res.data.data ? res.data.data : [])
            this.setState({
                data: res.data.data,
                selectedRowKeys: [],
                record: null,
            })
        })
    }
    addBaselineCancelModal = () => {
        this.setState({
            addBaselineVisiable: false
        })
    }

    getInfo = (record, index) => {
        this.setState({
            record: record,
        })

    }

    //执行基线点击事件
    radio = (record) => {
        let { startContent } = this.props.extInfo || {};
        let url = dataUtil.spliceUrlParams(defineBaselineActive(this.props.data.id, record.id), { startContent });
        axios.put(url, {}, true).then(res => {
            this.table.getData();
        })
    }

    //新增基线
    addData = (val) => {
        this.table.add(null, val)
    }

    //修改基线
    upDate = (val) => {
        this.table.update(this.state.record, val)
    }

    // 显示基线对比弹窗
    showBaselineVs = () => {
        if (this.state.data.length == 0) {
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: "该计划下没有基线",
                description: "该计划下没有基线"
            })
            return false;
        }
        this.setState({ isShowVs: true })
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

  //删除验证
  deleteVerifyCallBack = () => {
    let { selectedRowKeys } = this.state;
    if (selectedRowKeys == 0) {
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '未选中数据',
          description: '请选择勾选数据进行操作'
        }
      )
      return false
    } else {
      return true
    }
  }

    delete = () => {
        let { selectedRowKeys, record } = this.state;
        if (selectedRowKeys.length) {
          let { startContent } = this.props.extInfo || {};
          let url = dataUtil.spliceUrlParams(defineBaselineDel, { startContent });
          axios.deleted(url, { data: selectedRowKeys }, true).then(res => {
            this.table.getData();
          })
        }
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
            // if (name == 'DeleteTopBtn') {
            //     let { selectedRowKeys, record } = this.state;
            //     if (selectedRowKeys.length) {
            //         let { startContent } = this.props.extInfo || {};
            //         let url = dataUtil.spliceUrlParams(defineBaselineDel, { startContent });
            //         axios.deleted(url, { data: selectedRowKeys }, true).then(res => {
            //             this.table.getData();
            //         })
            //     } else {
            //         notification.warning(
            //             {
            //                 placement: 'bottomRight',
            //                 bottom: 50,
            //                 duration: 2,
            //                 message: '未选中数据',
            //                 description: '请选择数据'
            //             }
            //         )
            //     }
            //
            // }
        }


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
                render: (text) => dataUtil.Dates().formatDateString(text)
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
                render: (text) => dataUtil.Dates().formatDateString(text)
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

          <LabelTableLayout title = {this.props.title} menuCode = {this.props.menuCode}>
            <LabelToolbar>
              <AddTopBtn onClickHandle={showFormModal} />
              <ModifyTopBtn onClickHandle={showFormModal} />
              {/*删除*/}
              <PublicButton title={"删除"} verifyCallBack={this.deleteVerifyCallBack} useModel={true} afterCallBack={this.delete} icon={"icon-delete"} />
              <PublicButton name={'基线对比'} title={'基线对比'} icon={'icon-renwufenpei'} afterCallBack={this.showBaselineVs.bind(this)} />
            </LabelToolbar>
            <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {1000}>
              <PublicTable istile={true} onRef={this.onRef} getData={this.getData}
                           pagination={false} columns={columns}
                           scroll={{ x: 1600, y: this.props.height - 40 }}
                           getRowData={this.getInfo}
                           useCheckBox={true}
                           rowSelection={true}
                           onChangeCheckBox={this.getSelectedRowKeys}

              />
            </LabelTable>

            {this.state.addBaselineVisiable && <PlanDefineBaselineAdd extInfo={this.props.extInfo}
                                                                      modalVisible={this.state.addBaselineVisiable} title={this.state.title} type={this.state.type}
                                                                      handleCancel={this.addBaselineCancelModal} data={this.props.data} projectId={this.props.projectId}
                                                                      addData={this.addData} record={this.state.record} upDate={this.upDate} />}
            {
              this.state.isShowVs && <Vs handleCancel={() => this.setState({ isShowVs: false })} projectId={this.props.projectId} defineId={this.props.data.id} callBackBanner={this.props.callBackBanner} />
            }

          </LabelTableLayout>
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineBaseline);
