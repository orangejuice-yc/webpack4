import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';
import { notification } from 'antd'
import notificationFun from '../../../../../../utils/notificationTip'
import Release from '@/modules/Components/Release';
import Approval from '../Workflow/Approval';
import { getFlowSecurityExaminationList,getSecurityExamination} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import * as dataUtil from '@/utils/dataUtil';
import { queryParams } from '@/modules/Suzhou/components/Util/util';

export default class extends React.Component {
  state = {
    isShowRelease: false,
    showApprovalVisible: false,
  };
  btnClicks = (name, type) => {
    if(name == 'fabu'){
      this.setState({
        isShowRelease: true,
        showApprovalVisible: true,
      });
    }
    if(name == 'ExportFile'){
      let url = dataUtil.spliceUrlParams(getSecurityExamination,this.props.params);
        axios.down(getSecurityExamination+queryParams(this.props.params)).then((res)=>{
        })
    }
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
  render() {
    const props = this.props
    return (
      <div className={style.main}>
        <div className={style.tabMenu}>
        {props.permission.indexOf('SAFETYASSESSMENT_EDIT-SAFEASSESSMENT')!==-1 && ( 
          <AddFormComponent handleAddData={props.handleAddData} menu = {this.props.menu} />)}
          {props.permission.indexOf('SAFETYASSESSMENT_EDIT-SAFEASSESSMENT')!==-1 && ( 
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            content={'你确定要删除吗？'}
            res={'MENU_EDIT'}
            useModel={true}
            edit={true}
            afterCallBack={props.handleDeleteData}
            show={props.status}
          />)}
          {props.permission.indexOf('SAFETYASSESSMENT_RELEASE-SAFEASSESS')!==-1 && ( 
          <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            afterCallBack={this.btnClicks.bind(this,'fabu')}
            show={this.props.rightData && this.props.rightData.statusVo.code == 'INIT' ?true:false}
            res={'MENU_EDIT'}
          />)}
          {props.permission.indexOf('SAFETYASSESSMENT_EDIT-SAFEASSESSMENT')!==-1 && ( 
            <PublicButton name={'导出'} title={'导出'} icon={'icon-iconziyuan2'}
                afterCallBack={this.btnClicks.bind(this,'ExportFile')}
                res={'MENU_EDIT'} />)}
        </div>
        <div className={style.rightLayout}>
          <SearchVeiw handleSearch={props.handleSearch} />
        </div>
        {/*  */}
        {this.state.isShowRelease && (
          <Release
            proc={{
              bizTypeCode: 'szxm-securityExamination-approve',
              title: `安全考核发布审批`,
            }}
            reflesh={this.updateFlow.bind(this)}
            handleCancel={this.handleCancelRelease}
            // 参数
            firstList={getFlowSecurityExaminationList}
            projectName={this.props.projectName}
            projectId={this.props.projectId}
          />
        )}
        {this.state.showApprovalVisible && (
          <Approval
            visible={true}
            width={'1200px'}
            proc={{
              'vars':{'bkhrZw':(!this.props.rightData||!this.props.rightData.bkhrZw)?'':this.props.rightData.bkhrZw},
              bizTypeCode: 'szxm-securityExamination-approve',
              title: `安全考核发布审批`,
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
    );
  }
}
