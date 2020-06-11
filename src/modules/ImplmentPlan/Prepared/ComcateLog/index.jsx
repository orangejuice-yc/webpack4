import React, { Component } from 'react'
import {notification, Select } from 'antd'
import style from './style.less'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import { connect } from 'react-redux'
import axios from '../../../../api/axios'
import PageTable from "../../../../components/PublicTable"
import {
    getComcateLogList,
    getquesttionReplyList,
    deleteQuestionList,
    deletequesttionReply
} from '../../../../api/api'
import AddQuestion from "./Add";
import AddReply from "./AddReply"
import LabelToolbar from '../../../../components/public/Layout/Labels/Table/LabelToolbar'
import LabelTableLayout from '../../../../components/public/Layout/Labels/Table/LabelTableLayout'
import LabelTable from '../../../../components/public/Layout/Labels/Table/LabelTable'
import LabelTableItem from '../../../../components/public/Layout/Labels/Table/LabelTableItem'

class TeamInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            questionLsit: [],
            modify: false,
            addmodal: false,
            activeIndex1: null,
            record1: null,
            activeIndex2: null,
            record2: null,
            isShowImportModal: false,
            isShowImporTwotModal: false,
            dataMap: [],
            selectedRowKeys: [],
            selectedRows1: [],
            data1: [],
            data2: [],
        }
    }


    //删除验证
    deleteVerifyCallBack1 = () => {
        let { leftRecord } = this.state;
        if (!leftRecord) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选中数据',
                    description: '请选择数据进行操作'
                }
            )
            return false
        } else {
            return true
        }
    }

    // 修改
    modifyQuestion = () => {
        if (!this.state.leftRecord) {
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '未选中数据',
                description: '请选择数据进行操作'
            });
            return;
        }
        this.setState({
            modify: true,
            modaltype: "modify"
        });
    }

    // 修改
    modifyReply = () => {
        if (!this.state.rightRecord) {
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: '未选中数据',
                description: '请选择数据进行操作'
            });
            return;
        }
        this.setState({
            modifyreply: true,
            replymodaltype: "modify"
        });
    }

    // 删除问题
    deleteQuestion = () => {
        let { leftRecord } = this.state;
        if (leftRecord) {
            axios.deleted(deleteQuestionList([leftRecord.id]), null, true).then(res => {
                this.questionTable.deleted(leftRecord);
                this.setState({
                    replyList: [],
                    leftRecord: null
                })
            })
        }
    }

    //删除验证
    deleteVerifyCallBack2 = () => {
        let { rightRecord } = this.state;
        if (!rightRecord) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选中数据',
                    description: '请选择数据进行操作'
                }
            )
            return false
        } else {
            return true
        }
    }

    // 删除问题回复
    deleteReply = () => {
        let { rightRecord } = this.state;
        if (rightRecord) {
            axios.deleted(deletequesttionReply([rightRecord.id]), null, true).then(res => {
                this.replyTable.deleted(rightRecord);
                this.setState({rightRecord :null})
            })
        }
    }


    //获取问题
    getQuestionList = (callBack) => {
        axios.get(getComcateLogList(this.props.rightData[0].id)).then(res => {
            if (res.data.data) {
                callBack(res.data.data)
            }
        })
        callBack([])
    }
    //问题列表选中行事件
    setRightRow = (record) => {
        this.setState({
            rightRecord: record,
        })
    }
    /**
     * 获取回复列表
     */
    getReplyList = (callBack) => {
        if (this.state.leftRecord) {
            axios.get(getquesttionReplyList(this.state.leftRecord.id)).then(res => {
                callBack(res.data.data)
            })
        } else {
            callBack([])
        }
    }

    //问题列表选中行事件
    setLeftRow = (record) => {
        this.setState({
            leftRecord: record,
        }, () => {
            this.replyTable.getData()
        })
    }


    //新增问题
    addQuestionList = (data) => {
        this.questionTable.add(null, data)
    }

    //修改问题
    updateQuestion = (data) => {
        this.questionTable.update(this.state.leftRecord, data)
    };


    //新增回复
    addReply = (data) => {
        this.replyTable.add(null, data)
    }

    //修改回复
    updateReply = (data) => {
        this.replyTable.update(this.state.rightRecord, data)
    };
    //新增回复前检验是否选中问题
    checkSelectQuestion = () => {
        let { leftRecord } = this.state;
        if (!leftRecord) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选问题',
                    description: '请选择问题添加回复'
                }
            )
            return false
        } else {
            this.setState({ addreply: true, replymodaltype: "add" })
        }
    }
   
    render() {
        const { intl } = this.props.currentLocale;
        const columns1 = [
            {
                title: "内容",//内容
                dataIndex: 'content',
                key: 'content',
                width: "30%"
            },
            {
                title: "类型",//类型
                dataIndex: 'questionType',
                key: 'questionType',
                width: "25%",
                render: text => text ? text.name : null
            },
            {
                title: "创建人",//创建人
                dataIndex: 'createdUser',
                key: 'createdUser',
                width: "20%",
                render: text => text ? text.name : null
            },
            {
                title: "创建时间",//创建时间
                dataIndex: 'creatTime',
                key: 'creatTime',
                width: "25%",
            }
        ];
        const columns2 = [
            {
                title: "回复",//用户名称
                dataIndex: 'content',
                key: 'content',
                width: "35%",
            },
            {
                title: "回复人",//用户账号
                dataIndex: 'createdUser',
                key: 'createdUser',
                width: "25%",
                render: text => text ? text.name : null
            },

            {
                title: "回复时间",//用户角色
                dataIndex: 'creatTime',
                key: 'creatTime',
                width: "25%",
            },
        ];

        return (

          <LabelTableLayout>
            <LabelTableItem title = {"问题"}>
              <LabelToolbar>
                {/*新增*/}
                <PublicButton name={'新增'} title={'新增'} afterCallBack={() => { this.setState({ addmodal: true, modaltype: "add" }) }} />
                {/*修改*/}
                <PublicButton name={'修改'} title={'修改'} icon={'icon-xiugaibianji'} afterCallBack={this.modifyQuestion} />
                {/*删除*/}
                <PublicButton title={"删除"} verifyCallBack={this.deleteVerifyCallBack1} afterCallBack={this.deleteQuestion} icon={"icon-delete"} />
              </LabelToolbar>
              {
                this.state.addmodal &&
                (
                  <AddQuestion
                    addData={this.addQuestionList}
                    data={this.props.rightData[0]}
                    record={this.state.leftRecord}
                    handleCancel={() => this.setState({ addmodal: false })}
                    modaltype={this.state.modaltype}
                  />
                )
              }
              {
                this.state.modify &&
                (
                  <AddQuestion
                    handleCancel={() => this.setState({ modify: false })}
                    record={this.state.leftRecord}
                    data={this.props.rightData[0]}
                    updateQuestion={this.updateQuestion}
                    modaltype={this.state.modaltype}

                  />
                )
              }
              <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {300}>
                <PageTable
                  onRef={ref => this.questionTable = ref}
                  pagination={false}
                  getData={this.getQuestionList}
                  dataSource={this.state.questionLsit}
                  getRowData={this.setLeftRow}
                  columns={columns1}
                  closeContentMenu={true}
                  rowSelection={false}
                  loading={this.state.loading}
                />
              </LabelTable>
            </LabelTableItem>
            <LabelTableItem title = {"回复"}>
              <LabelToolbar>
                  {/*新增*/}
                <PublicButton name={'新增'} title={'新增'} afterCallBack={this.checkSelectQuestion} />
                {/*修改*/}
                <PublicButton name={'修改'} title={'修改'} icon={'icon-xiugaibianji'} afterCallBack={this.modifyReply} />
                {/*删除*/}
                <PublicButton title={"删除"} verifyCallBack={this.deleteVerifyCallBack2} afterCallBack={this.deleteReply} icon={"icon-delete"} />
              </LabelToolbar>
              <LabelTable labelWidth = {this.props.labelWidth } contentMinWidth = {300}>
                <PageTable onRef={ref => this.replyTable = ref}
                           pagination={false}
                           getData={this.getReplyList}
                           columns={columns2}
                           bordered={false}
                           closeContentMenu={true}
                           dataSource={this.state.replyList}
                           getRowData={this.setRightRow}
                           loading={this.state.loading1}
                />
              </LabelTable>
              {
                this.state.addreply &&
                (
                  <AddReply
                    addReply={this.addReply}
                    record={this.state.leftRecord}
                    rightRecord={this.state.rightRecord}
                    handleCancel={() => this.setState({ addreply: false })}
                    replymodaltype={this.state.replymodaltype}
                  />
                )
              }
              {
                this.state.modifyreply &&
                (
                  <AddReply
                    record={this.state.leftRecord}
                    rightRecord={this.state.rightRecord}
                    handleCancel={() => this.setState({ modifyreply: false })}
                    updateReply={this.updateReply}
                    replymodaltype={this.state.replymodaltype}
                  />
                )
              }
            </LabelTableItem>
          </LabelTableLayout>
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
}))(TeamInfo)
