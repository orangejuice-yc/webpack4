/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:43:11 
 * @Last Modified by: wihoo.wanghao
 * @Last Modified time: 2019-01-21 21:57:41
 */

import React, { Component } from 'react'
import { notification } from 'antd';
import Public from "../Public"
import CancelPublic from "../CancelPublic"
import Search from '../../../../components/public/Search'
import style from './style.less'
import Add from '../Add'
import Approval from '../Workflow/Approval'
import { meetingDelete } from '../../../../api/api';
import axios from '../../../../api/axios';
import { connect } from 'react-redux'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import PublicMenuButton from "../../../../components/public/TopTags/PublicMenuButton"
import SelectProjectBtn from "../../../../components/public/SelectBtn/SelectProjectBtn"
export class PlanDefineTopTags extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            showApprovalVisible: false,
            modelTitle: '',
            roleBtnData: [
                {
                    id: 1,
                    name: 'AddTopBtn',
                    aliasName: '新增'
                },
                {
                    id: 2,
                    name: 'PublicTopBtn',
                    aliasName: '发布'
                },
                {
                    id: 3,
                    name: 'DeleteTopBtn',
                    aliasName: '删除'
                },


            ],
            planDefineSelectData: []
        }
    }


    // modal取消
    handleCancel = () => {
        this.setState({
            modalVisible: false
        })

    }
    //关闭直接发布
    handlePublicCancel = () => {
        this.setState({
            isShowDirect: false
        })
    }
    //关闭取消发布
    handleCancelPublic = () => {
        this.setState({
            isShowCancel: false
        })
    }
  
    //删除验证
    deleteVerifyCallBack=()=>{
        const { data, selectData } = this.props
        if (data.length == 0) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有勾选数据！'
                }
            )
            return false
        }else{
            let i = selectData.findIndex(item => item.status.id != "EDIT")

                if (i > -1) {
                    notification.warning(
                        {
                            placement: 'bottomRight',
                            bottom: 50,
                            duration: 1,
                            message: '警告',
                            description: '只能删除编制中的会议！'
                        }
                    )
                    return false
                }
            return true
        }
    }


    // 显示表单弹窗
    showFormModal = (name, e) => {
        const { projectId } = this.props
        let {projectName} = this.props;
        // 新增
        if (name === 'AddTopBtn') {
            if (!this.props.projectId) {
                notification.warning({
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有选择项目！'
                })
                return
            }
            this.setState({
              modalVisible: true,
              modelTitle: '新增项目会议'
            })
          return
        }
        //直接发布
        if (name === 'direct') {
          if (!projectId) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有选择项目！'
              }
            )
            return
          }
          this.setState({
            isShowDirect: true,projectName: "["+projectName+"]"
          })
          return
        }
        //取消发布
        if (name === 'abolish') {
          if (!projectId) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有选择项目！'
              }
            )
            return
          }
          this.setState({
            isShowCancel: true
          })
          return
        }
        //发布审批
        if (name === 'approve') {
          if (!projectId) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有选择项目！'
              }
            )
            return
          }
          this.setState({
            showApprovalVisible:true,projectName: "["+projectName+"]"
          })
          return
        }
        // 删除
        if (name === 'DeleteTopBtn') {
          const { data, selectData } = this.props
          if (data.length == 0) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有勾选数据！'
              }
            )
            return
          }

        
          axios.deleted(meetingDelete, { data }).then((result) => {
            this.props.deleteData()
          })
          return
        }
    }
    getMeetingTreeList = (projectId, data) => {
        this.setState({
            selectData: data,
            projectId
        })
        this.props.getMeetingList(projectId)
    }
    search = (value) => {
        if (!this.props.projectId) {
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 1,
                message: '警告',
                description: '没有选择项目！'
            })
            return
        }
        this.props.search(value)
    }

    render() {
        const { intl } = this.props.currentLocale
        const columns = [
            {
                title: intl.get('wsd.i18n.comu.meeting.title'),
                dataIndex: 'title',
                key: 'title',
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.projectname'),
                dataIndex: 'project',
                key: 'project',
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingaddress'),
                dataIndex: 'meetingAddress',
                key: 'meetingAddress',
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meettime'),
                dataIndex: 'meetingTime',
                key: 'meetingTime',
                render: text => text ? text.substr(0, 10) : null
            },
            {
                title: intl.get('wsd.i18n.comu.meeting.meetingtype'),
                dataIndex: 'meetingType',
                key: 'meetingType',
                render: text => text ? text.name : null
            }
        ]
        return (
            <div className={style.main}>
                <div className={style.search}>
                    <Search placeholder={"会议标题"} search={this.search} />
                </div>
                <div className={style.tabMenu}>
                    {/*选择项目*/}
                    <SelectProjectBtn haveTaskAuth = {true} openProject={this.props.openProject }  />
                    {/*新增*/}
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'} afterCallBack={this.showFormModal.bind(this, 'AddTopBtn')} />
                    {/*发布*/}
                    <PublicMenuButton title={"发布"} afterCallBack={this.showFormModal} icon={"icon-fabu"}
                        menus={[{ key: "direct", label: "直接发布", icon: "icon-fabu", edit: this.props.meetActionEditAuth },
                        { key: "approve", label: "发布审批", icon: "icon-shenpi1", edit: this.props.meetActionEditAuth },
                        { key: "abolish", label: "取消发布", icon: "icon-mianfeiquxiao", edit: this.props.meetActionEditAuth }]}
                    />
                    {/*删除*/}
                    <PublicButton edit = {this.props.meetActionEditAuth} title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack} afterCallBack={this.showFormModal.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />
                </div>
            
                {this.state.isShowCancel && <CancelPublic projectName = {this.props.projectName } handleCancel={this.handleCancelPublic} projectId={this.props.projectId} reflesh={this.getMeetingTreeList.bind(this, this.props.projectId)} />}
                {this.state.isShowDirect && <Public projectName = {this.props.projectName } handleCancel={this.handlePublicCancel} projectId={this.props.projectId} reflesh={this.getMeetingTreeList.bind(this, this.props.projectId)} />}
                {this.state.modalVisible && <Add projectName = {this.props.projectName } handleCancel={this.handleCancel} modelTitle={this.state.modelTitle} projectId={this.props.projectId} addData={this.props.addData} />}
                {this.state.showApprovalVisible &&
                    <Approval
                        visible={true}
                        width={"1200px"}
                        proc={{  "bizTypeCode": "comu-meeting-release", "title": this.state.projectName+"会议管理发布审批" }}
                        projectId={this.props.projectId}
                        handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
                        refreshData={this.props.getMeetingList}
                    />}
            </div>

        )
    }
}



const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(PlanDefineTopTags);
