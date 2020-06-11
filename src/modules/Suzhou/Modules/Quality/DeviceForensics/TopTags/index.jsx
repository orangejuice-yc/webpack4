import React, { Component } from 'react'
import PublicButton from '@/components/public/TopTags/PublicButton'
import SelectProjectBtn from '../../../../components/SelectBtn/SelectProBtn'
import SelectSectionBtn from '../../../../components/SelectBtn/SelectSectionBtn'
import Search from '../../../../components/Search'
import SearchVeiw from '../SearchVeiw';
import style from './style.less'
import AddForm from '../AddForm'
import notificationFun from '@/utils/notificationTip';
//流程
import Release from "../../../../../Components/Release";
import { getReleaseMeetingList } from "../../../../../../api/api"
import Approval from '../Workflow/Approval';
export class TopTags extends Component {
    constructor(props) {
        super(props)
        this.state = {
            visibleModal: false,
            isShowRelease:false ,//流程公用
            showApprovalVisible:false,//发布审批
            projectName:"",
        }
    }
    // 点击触发
    btnClicks = (type) => {
        if (type === 'AddTopBtn') {
            this.setState({visibleModal: true})
        } else if (type === 'DeleteTopBtn') {
            this.props.delSuccess()
        } else if (type === 'Approve') {
            if (!this.props.data1) {
                notificationFun('警告', '没有选择项目')
                return 
            } 
            this.setState({
                isShowRelease: true,
                showApprovalVisible:true,
                projectName: "["+this.props.projectName+"]",
                projectId:this.props.data1,
                sectionId:this.props.sectionId,
            })
        }
    }
    // 确认新增
    handleModalOk = (data0, type) => {
        if (type === 'save') {
            this.setState({
                visibleModal: false
            }, () => {
                this.props.success(data0)
            })
        } else if (type === 'goOn') {
            this.props.success(data0)
        } 
    }
    // 关闭Model，取消新增
    handleModalCancel = () => {
        this.setState({
            visibleModal: false
        })
    }
    // 取消发布审批
    handleCancelRelease = () => {
        this.setState({
            isShowRelease: false
        })
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if (this.props.selectedRows.length == 0){
            notificationFun('操作提醒', '未选中数据')
            return false;
        } else {
            return true
        }
    }
    updateFlow = (projectId, data) => {
        this.props.updateFlow();
    }
    render() {
        const { handleSearch,openPro, openSection, section, data1, search, record, updateSuccess ,permission} = this.props
        const { visibleModal } = this.state
        return (
            <div className={style.main}>
                <div className={style.tabMenu}>
                    <SelectProjectBtn openPro={openPro} />
                    <SelectSectionBtn openSection={openSection} data1={data1} />  
                    {permission.indexOf('DEVICEFORENSICS_EDIT-SPEDEVICEACCEPT')!==-1 && (<PublicButton 
                        name={'新增'} 
                        title={'新增'} 
                        icon={'icon-add'}
                        afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
                        res={'MENU_EDIT'}
                    />)}
                    {permission.indexOf('DEVICEFORENSICS_APPROVAL-DEVACCEPT')!==-1 && (<PublicButton name={'发布审批'} 
                        title={'发布审批'} 
                        icon={'icon-fabu'}
                        afterCallBack={this.btnClicks.bind(this, 'Approve')}
                        res={'MENU_EDIT'}
                    />)}
                    {permission.indexOf('DEVICEFORENSICS_EDIT-SPEDEVICEACCEPT')!==-1 && (<PublicButton 
                        name={'删除'} 
                        title={'删除'} 
                        icon={'icon-shanchu'}
                        verifyCallBack={this.hasRecord}
                        useModel={true} 
                        edit={true}
                        afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
                        content={'你确定要删除吗？'}
                        res={'MENU_EDIT'}
                    />)}
                </div>
                <AddForm 
                    section={section}
                    visibleModal={visibleModal}
                    projectId={data1}
                    handleModalOk={this.handleModalOk} 
                    handleModalCancel={this.handleModalCancel}
                    updateSuccess={updateSuccess}
                />
                <div className={style.rightLayout}>
                    <SearchVeiw handleSearch={handleSearch}  />
                </div>
                {this.state.isShowRelease && 
                    <Release 
                    projectName = {this.props.projectName} 
                    firstList={getReleaseMeetingList} 
                    handleCancel={this.handleCancelRelease} 
                    projectId={this.props.data1} 
                    proc={{  "bizTypeCode": "szxm-deviceForensics-approve", "title": this.state.projectName+"特种设备验收取证发布审批" }}
                    reflesh={this.updateFlow.bind(this)} />}
                {this.state.showApprovalVisible &&
                <Approval
                    visible={true}
                    width={"1200px"}
                    proc={{  "bizTypeCode": "szxm-deviceForensics-approve", "title": this.state.projectName+"特种设备验收取证发布审批" }}
                    projectId={this.props.data1}
                    sectionId = {this.props.sectionId}
                    deviceName = {this.props.deviceName}
                    handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
                    refreshData={this.props.updateFlow}
                    bizType={this.props.bizType}
                />}
            </div>
        )
    }
}
  
export default TopTags
