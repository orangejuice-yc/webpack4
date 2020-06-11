import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';
import notificationFun from '../../../../../../utils/notificationTip'
import Release from '@/modules/Components/Release';
import Approval from '../Workflow/Approval';
import { queryFlowSecurityCheckList } from '@/modules/Suzhou/api/suzhou-api';

export default class extends React.Component{
  state = {
    isShowRelease: false,
    showApprovalVisible: false,
    editPermission:'',  //增删改编辑权限
    flowPermission:'',   //流程发布权限
    btnShow:false,//发布审批
  };
  btnClicks = () => {
    if (!this.props.projectId) {
      notificationFun('警告', '没有选择项目');
      return;
    }
    this.setState({
      isShowRelease: true,
      showApprovalVisible: true,
    });
  };
  // 取消发布审批
  handleCancelRelease = () => {
    this.setState({
      isShowRelease: false,
    });
  };
  updateFlow = (...args) => {
    this.props.updateFlow(args);
  };
  componentDidMount(){
    if(this.props.bizType=='SECURITY-SECURITYCHECK'){
      this.setState({
        editPermission:'SECURITYCHECK_EDIT-ORG-CHECK',
        flowPermission:'SECURITYCHECK_RELEASE-ORG-CHECK'
      })
    }else if(this.props.bizType=='SECURITY-SECURITYCHECKONLY'){
      this.setState({
        editPermission:'SECURITYCHECKONLY_EDIT-PERSON-CHECK',
        flowPermission:'SECURITYCHECKONLY_RELEASE-PERSON-CHECK'
      })
    }
  }
    render(){
      const props = this.props
      const {editPermission,flowPermission} = this.state;
      return (
        <div className={style.main}>
          <div className={style.tabMenu}>
            <SelectProjectBtn openPro={props.openPro} />
            <SelectSectionBtn openSection={props.openSection} data1={props.projectId} />
            {props.permission.indexOf(editPermission)!==-1 && ( 
            <AddFormComponent projectId={props.projectId} handleAddData={props.handleAddData} 
            checkStatus={this.props.checkStatus} bizType={this.props.bizType}/>)}
            {props.permission.indexOf(editPermission)!==-1 && ( 
            <PublicButton
              name={'删除'}
              title={'删除'}
              icon={'icon-shanchu'}
              content={'你确定要删除吗？'}
              res={'MENU_EDIT'}
              useModel={true}
              edit={true}
              show={props.status}
              afterCallBack={props.handleDeleteData}
            />)}
            {(props.permission.indexOf(flowPermission)!==-1 && this.props.bizType=='SECURITY-SECURITYCHECK') && ( 
            <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            afterCallBack={this.btnClicks}
            show={props.rightData && props.rightData.statusVo.code == 'INIT' ?true:false}
            res={'MENU_EDIT'}
          />)}
          </div>
          <div className={style.rightLayout}>
            <SearchVeiw
              handleSearch={props.handleSearch}
              projectId={props.projectId}
              sectionIds={props.sectionIds}
            />
          </div>
          {/*  */}
        {this.state.isShowRelease && (
          <Release
            proc={{
              bizTypeCode: 'szxm-securityCheck-approve',
              title: `[${this.props.projectName}]安全检查组织检查发布审批`,
            }}
            reflesh={this.updateFlow.bind(this)}
            handleCancel={this.handleCancelRelease}
            // 参数
            firstList={queryFlowSecurityCheckList}
            projectName={this.props.projectName}
            projectId={this.props.projectId}
          />
        )}
        {this.state.showApprovalVisible && (
          <Approval
            visible={true}
            width={'1200px'}
            proc={{
              'vars':{'jclx':(!this.props.rightData||!this.props.rightData.jclxVo)?'':this.props.rightData.jclxVo.code},
              bizTypeCode: 'szxm-securityCheck-approve',
              title: `[${this.props.projectName}]安全检查组织检查发布审批`,
            }}
            handleCancel={() => this.setState({ showApprovalVisible: false })}
            refreshData={this.props.updateFlow}
            bizType={this.props.bizType}
            // 参数
            projectId={this.props.projectId}
            sectionId={this.props.sectionId}
            projectName={this.props.projectName}
            params={this.props.params}
            parentData = {this.props.rightData}
          />
        )}
        </div>
      )
    }
}
