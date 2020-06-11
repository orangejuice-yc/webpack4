import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,DatePicker,Form,Button,notification} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import SelectProBtn from '../../../../components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '../../../../components/SelectBtn/SelectSectionBtn';
import AddForm from '../Add/index';
import style from './style.less';
import axios from '../../../../../../api/axios';
import {addPeopleEntry,deletePeopleEntry} from '../../../../api/suzhou-api';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import UploadDoc from '../Upload/index';
import Search from '../SearchVeiw';
//流程
import Release from "../../../../../Components/Release";
import { getReleaseMeetingList } from "../../../../../../api/api"
import Approval from '../Workflow/Approval';
// import Public from "../Public";   //直接发布
// import CancelPublic from "../CancelPublic"; //取消发布审批
const { RangePicker } = DatePicker;
export class PlanDefineTopTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      delModalVisible: false,
      noticeData: '',
      planDefineSelectData: [],
      type: '',
      isShowRelease:false ,//流程公用
      showApprovalVisible:false,//发布审批
      projectName:"",
    };
  }
  componentDidMount(){
  }
  //关闭model
  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };
  //判断是否有选中数据
  hasRecord=()=>{
    if(this.props.selectedRows.length == 0){
      notification.warning(
        {
          placement: 'bottomRight',
          bottom: 50,
          duration: 2,
          message: '未选中数据',
          description: '请选择数据进行操作'
        }
      )
      return false;
    }else {
      return true
    }
  }
  btnClicks = (v, type) => {
    const {delSuccess, record,section,data1,selectedRows,projectName} = this.props;
    const  projectId  = this.props.data1;
    switch (v) {
      case 'AddTopBtn':
        if(!data1){
          notification.warning(
            {
              placement: 'bottomRight',
              bottom: 50,
              duration: 2,
              message: '未选中数据',
              description: '请选择数据进行操作'
            }
          )
          
        }else{
          this.setState({
            modalVisible: true,
            type: 'ADD',
          });
        }
        break;
      case 'DeleteTopBtn':
        if (selectedRows) {
          const deleteArray = [];
          selectedRows.forEach((value,item)=>{
            if(value.statusVo.code == 'INIT'){
              deleteArray.push(value.id)
            }else{
              notification.warning(
                {
                  placement: 'bottomRight',
                  bottom: 50,
                  duration: 2,
                  message: '非新建状态数据不能删除',
                  description: '编号为'+value.code+"不能删除"
                }
              );
              return false;
            }
          }); 
          if(deleteArray.length > 0){
            axios.deleted(deletePeopleEntry, {data:deleteArray}, true).then(res => {
              this.props.delSuccess(deleteArray);
            }).catch(err => {
  
            });
          }
        } else {
          notification.warning(
            {
              placement: 'bottomRight',
              bottom: 50,
              duration: 2,
              message: '未选中数据',
              description: '请选择数据进行操作'
            }
          )
        }
        break;
      //发布审批
        case 'approve':
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
              isShowRelease: true,
              showApprovalVisible:true,
              projectName: "["+projectName+"]",
              projectId:this.props.data1,
              sectionId:this.props.sectionId,
              type:this.props.type,
              addPeopleEntry:this.props.addPeopleEntry,
              status:this.props.status,
              startTime:this.props.startTime,
              endTime:this.props.endTime
            })
            return
          break;
      default:
        return;
    }
  };
  submit = (values, type) => {
    const data = {
      ...values,
      projectId:this.props.data1
    };
    axios.post(addPeopleEntry, data, true).then(res => {
      if (res.data.status === 200) {
        if (type == 'save') {
          this.handleCancel();
        }

        this.props.success(res.data.data);
      }
    });
  };
  handleSubmit = ()=>{
  }
//取消审批
handleCancelRelease = () => {
  this.setState({
      isShowRelease: false
  })
}

updateFlow = () => {
  // this.setState({
  //     selectData: data,
  //     projectId
  // })
  this.props.updateFlow();
}
  render() {
    const {modalVisible} = this.state;
    const {permission} = this.props
    return (
      <div className={style.main}>
        {this.props.deledit}
        <div className={style.search}>
            <Search search={this.props.search} />
          </div>
        <div className={style.tabMenu}>
          <SelectProBtn  openPro={this.props.openPro} />
          <SelectSectionBtn openSection={this.props.openSection} data1={this.props.data1} />
          {permission.indexOf('ENTRYAEXIT_EDIT_PERSON-ENTRY')!==-1 && (
          <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                        afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                        res={'MENU_EDIT'}
          />)}
           {/*流程*/}
          {permission.indexOf('ENTRYAEXIT_RELEASE-AUDIT-PERSON')!==-1 && (
           <PublicButton name={'发布审批'} title={'发布审批'} icon={'icon-fabu'}
                        show={this.props.rightData && this.props.rightData.statusVo.code == 'INIT' ?true:false}
                        afterCallBack={this.btnClicks.bind(this,'approve')}
                        res={'MENU_EDIT'}
          />)}
           {/* <PublicMenuButton title={"发布"} afterCallBack={this.showFormModal} icon={"icon-fabu"}
                        menus={[
                        // { key: "direct", label: "直接发布", icon: "icon-fabu", edit: true },
                        { key: "approve", label: "发布审批", icon: "icon-shenpi1", edit: true },
                        { key: "abolish", label: "取消发布", icon: "icon-mianfeiquxiao", edit: true }]}
            /> */}
          {permission.indexOf('ENTRYAEXIT_EDIT_PERSON-ENTRY')!==-1 && (
          <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                        useModel={true} edit={true}
                        verifyCallBack={this.hasRecord}
                        afterCallBack={this.btnClicks.bind(this,'DeleteTopBtn')}
                        content={'你确定要删除嘛'}
                        res={'MENU_EDIT'}
          />)}
        </div>
        {modalVisible && <AddForm
          record={this.props.record}
          modalVisible={modalVisible}
          success={this.props.success}
          submit={this.submit.bind(this)}
          sectionId={this.props.sectionId}
          projectId={this.props.data1}
          handleCancel={this.handleCancel.bind(this)}/>}
          {/* 直接发布 */}
        {/* {this.state.isShowDirect && 
          <Public 
            projectName = {this.props.projectName } 
            handleCancel={this.handlePublicCancel} 
            projectId={this.props.data1} 
            sectionId = {this.props.sectionId}
            type = {this.props.type}
            peoEntryType = {this.props.peoEntryType}
            status = {this.props.status}
            startTime = {this.props.startTime}
            endTime = {this.props.endTime}
            reflesh={this.getMeetingTreeList.bind(this, this.props.projectId)} />} */}
          {/* 取消发布 */}
        {/* {this.state.isShowCancel && 
          <CancelPublic 
            projectName = {this.props.projectName } 
            handleCancel={this.handleCancelPublic} 
            projectId={this.props.projectId} 
            reflesh={this.getMeetingTreeList.bind(this, this.props.projectId)} />} */}
        {this.state.isShowRelease && 
          <Release 
          projectName = {this.props.projectName} 
          firstList={getReleaseMeetingList} 
          handleCancel={this.handleCancelRelease} 
          projectId={this.props.data1} 
          proc={{  "bizTypeCode": "szxm-peopleEntry-approve", "title": this.state.projectName+"人员进退场发布审批" }}
          reflesh={this.updateFlow.bind(this)} />}
        {this.state.showApprovalVisible &&
          <Approval
              visible={true}
              width={"1200px"}
              proc={{  
                'vars':{
                  'sectionTypeCode':(!this.props.rightData||!this.props.rightData.sectionTypeCode)?'':this.props.rightData.sectionTypeCode,
                  'peoEntryType':(!this.props.rightData||!this.props.rightData.peoEntryTypeVo)?'':this.props.rightData.peoEntryTypeVo.code
                  },
                "bizTypeCode": "szxm-peopleEntry-approve", "title": this.state.projectName+"人员进退场发布审批" }}
              projectId={this.props.data1}
              sectionId = {this.props.sectionId}
              type = {this.props.type}
              peoEntryType = {this.props.peoEntryType}
              status = {this.props.status}
              startTime = {this.props.startTime}
              endTime = {this.props.endTime}
              handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
              refreshData={this.props.updateFlow}
              parentData = {this.props.rightData}
              bizType={this.props.bizType}
          />}
      </div>

    );
  }
}

export default PlanDefineTopTags;

