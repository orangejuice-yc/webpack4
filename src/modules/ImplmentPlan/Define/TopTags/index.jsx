
import React, { Component } from 'react'
import {notification } from 'antd';
import style from './style.less'
import { connect } from 'react-redux'
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import SelectProjectBtn from "../../../../components/public/SelectBtn/SelectProjectBtn"

export class PlanDefineTopTags extends Component {
    constructor(props) {
        super(props)
        this.state = {
            modalVisible: false,
            roleBtnData: [
                {
                    id: 1,
                    name: 'AddTopBtn',
                    aliasName: '新增'
                },
                {
                    id: 2,
                    name: 'DeleteTopBtn',
                    aliasName: '删除'
                }
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
    deleteVerifyCallBack = () => {
        if (!this.props.projectId) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: "警告",
                    description: "请选择项目"
                }
            )
            return false
        }
        if (!this.props.rightData) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 2,
                    message: '未选中数据',
                    description: '请选择数据'
                }
            )
            return false
        }
        if (this.props.editAuth == true) {
            notification.warning(
              {
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: "警告",
                description: "该计划定义下存在WBS或任务，禁止删除！"
              }
            )
            return false
        }
        else {
            return true
        }
    }

    // 显示表单弹窗
    showAddForm = () => {
        if (!this.props.projectId) {
            const { intl } = this.props.currentLocale;
            notification.warning({
                placement: 'bottomRight',
                bottom: 50,
                duration: 2,
                message: intl.get('wsd.global.tip.title2'),
                description: "请选择项目"
            })
            return ;
        }
        this.props.openAddModal()
    }

    render() {
        return (
            <div className={style.main}>
                <div className={style.tabMenu}>
                    {/*打开项目*/}
                    <SelectProjectBtn openProject = {this.props.openProject} typeCode = 'implmentDefine'/>
                    {/*新增*/}
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'} afterCallBack={this.showAddForm.bind(this)} />
                    {/*删除*/}
                    <PublicButton title={"删除"} useModel={true} verifyCallBack={this.deleteVerifyCallBack}
                        afterCallBack={this.props.delData} icon={"icon-delete"}
                        edit={this.props.rightData && this.props.rightData.type == "project" ? false : true} />
                </div>
            </div>
        )
    }
}

export default connect(state => ({
    currentLocale: state.localeProviderData
}))(PlanDefineTopTags)
