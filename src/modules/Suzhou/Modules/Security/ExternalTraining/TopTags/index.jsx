import React from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import style from './style.less';
import Release from '@/modules/Components/Release';
import Approval from '../Workflow/Approval';
import { queryFlowTrainDisclosureList } from '@/modules/Suzhou/api/suzhou-api';

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
  handleCancelRelease = () => {
    this.setState({
      isShowRelease: false,
    });
  };
  updateFlow = (...args) => {
    this.props.updateFlow(args);
  };
  render(){
    const props = this.props
    return(
  <div className={style.main}>
    <div className={style.tabMenu}>
      <SelectProjectBtn openPro={this.props.openPro} />
      <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
      {props.permission.indexOf('EXTERNALTRAINING_EDIT-EX-TRAINING')!==-1 && ( 
      <AddFormComponent projectId={this.props.projectId} handleAddData={this.props.handleAddData} />)}
      {props.permission.indexOf('EXTERNALTRAINING_EDIT-EX-TRAINING')!==-1 && ( 
      <PublicButton
        name={'删除'}
        title={'删除'}
        icon={'icon-shanchu'}
        content={'你确定要删除吗？'}
        res={'MENU_EDIT'}
        useModel={true}
        edit={true}
        afterCallBack={this.props.handleDeleteData}
        show={this.props.selectedRowKeys.length > 0}
      />)}
      {props.permission.indexOf('EXTERNALTRAINING_RELEASE-EX-TRAINING')!==-1 && ( 
      <PublicButton
          name={'发布审批'}
          title={'发布审批'}
          icon={'icon-fabu'}
          afterCallBack={this.btnClicks.bind(this)}
          res={'MENU_EDIT'}
        />)}
    </div>
    <div className={style.rightLayout}>
      <SearchVeiw
        handleSearch={this.props.handleSearch}
        projectId={this.props.projectId}
        sectionIds={this.props.sectionIds}
      />
    </div>
    {this.state.isShowRelease && (
          <Release
            proc={{
              bizTypeCode: 'szxm-trainDisclosure-approve',
              title: `[${this.props.projectName}]安全外部培训发布审批`,
            }}
            reflesh={this.updateFlow.bind(this)}
            handleCancel={this.handleCancelRelease}
            // 参数
            firstList={queryFlowTrainDisclosureList}
            projectName={this.props.projectName}
            projectId={this.props.projectId}
          />
        )}
        {this.state.showApprovalVisible && (
          <Approval
            visible={true}
            width={'1200px'}
            proc={{
              bizTypeCode: 'szxm-trainDisclosure-approve',
              title: `[${this.props.projectName}]安全外部培训发布审批`,
            }}
            handleCancel={() => this.setState({ showApprovalVisible: false })}
            refreshData={this.props.updateFlow}
            bizType={this.props.bizType}
            // 参数
            projectId={this.props.projectId}
            sectionId={this.props.sectionId}
            projectName={this.props.projectName}
            params={this.props.params}
          />
        )}
  </div>
  )}
};
