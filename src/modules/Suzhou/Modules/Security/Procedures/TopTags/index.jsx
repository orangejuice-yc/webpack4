import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';
import Release from '@/modules/Components/Release';
import Approval from '../Workflow/Approval';
import { queryFlowSubcontrApprovalList } from '@/modules/Suzhou/api/suzhou-api';

export default class extends React.Component {
  state = {
    isShowRelease: false,
    showApprovalVisible: false,
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
  render() {
    const props = this.props;
    return (
      <div className={style.main}>
        <div className={style.tabMenu}>
          <SelectProjectBtn openPro={props.openPro} />
          <SelectSectionBtn openSection={props.openSection} data1={props.projectId} />
          {props.permission.indexOf('PROCEDURES_EDIT-SUBCONTRACT')!==-1 && ( 
          <AddFormComponent projectId={props.projectId} handleAddData={props.handleAddData} />)}
          {props.permission.indexOf('PROCEDURES_EDIT-SUBCONTRACT')!==-1 && ( 
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            afterCallBack={props.handleDeleteData}
            res={'MENU_EDIT'}
            useModel={true}
            edit={true}
            show={props.status}
            content={'你确定要删除吗？'}
          />)}
          {props.permission.indexOf('PROCEDURES_RELEASE-SUBCONTRACT')!==-1 && ( 
          <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            show={this.props.rightData && this.props.rightData.statusVo.code == 'INIT' ?true:false}
            afterCallBack={this.btnClicks}
            res={'MENU_EDIT'}
          />)}
        </div>
        <div className={style.rightLayout}>
          <SearchVeiw handleSearch={props.handleSearch} />
        </div>
        {/*  */}
        {this.state.isShowRelease && (
          <Release
            proc={{
              bizTypeCode: 'szxm-subcontrApproval-approve',
              title: `[${this.props.projectName}]分包审批发布审批`,
            }}
            reflesh={this.updateFlow.bind(this)}
            handleCancel={this.handleCancelRelease}
            // 参数
            firstList={queryFlowSubcontrApprovalList}
            projectName={this.props.projectName}
            projectId={this.props.projectId}
          />
        )}
        {this.state.showApprovalVisible && (
          <Approval
            visible={true}
            width={'1200px'}
            proc={{
              'vars':{'subcontrType':(!this.props.rightData||!this.props.rightData.subcontrTypeVo)?'':this.props.rightData.subcontrTypeVo.code},
              bizTypeCode: 'szxm-subcontrApproval-approve',
              title: `[${this.props.projectName}]分包审批发布审批`,
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
