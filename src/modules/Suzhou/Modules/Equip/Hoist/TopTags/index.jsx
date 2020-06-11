import React, { Component } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import Search from '@/modules/Suzhou/components/Search';
import style from './style.less';
import notificationFun from '@/utils/notificationTip';
import AddHoist from '../AddHoist';
//流程
import Release from '@/modules/Components/Release';
import { getReleaseMeetingList } from '@/api/api';
import Approval from '../Workflow/Approval';
export class TopTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
    };
  }

  btnClicks = (type, selectedRowKeys) => {
    if (type === 'AddTopBtn') {
      this.setState({ visibleModal: true });
    } else if (type === 'DeleteTopBtn') {
      this.props.deleteData();
    } else if (type === 'Approve') {
      if (!this.props.data1) {
        notificationFun('警告', '没有选择项目');
        return;
      }
      this.setState({
        isShowRelease: true,
        showApprovalVisible: true,
        projectName: '[' + this.props.projectName + ']',
        projectId: this.props.data1,
        sectionId: this.props.sectionId,
      });
    }
  };

  handleModalOk = (data0, type) => {
    if (type === 'save') {
      this.setState({
        visibleModal: false,
      });
    }
    this.props.addData(data0);
  };

  handleModalCancel = () => {
    this.setState({
      visibleModal: false,
    });
  };
  // 取消发布审批
  handleCancelRelease = () => {
    this.setState({
      isShowRelease: false,
    });
  };
  //判断是否有选中数据
  hasRecord = () => {
    if (this.props.selectedRowKeys.length == 0) {
      notificationFun('操作提醒', '未选中数据');
      return false;
    } else {
      return true;
    }
  };
  updateFlow = (projectId, data) => {
    this.props.updateFlow();
  };
  render() {
    const { openPro, openSection, data1, search ,permission} = this.props;
    return (
      <div className={style.main}>
        <div className={style.search}>
          <Search search={search} placeholder={'标题'} />
        </div>
        <div className={style.tabMenu}>
          <SelectProjectBtn openPro={openPro} />
          <SelectSectionBtn openSection={openSection} data1={data1} />
          {permission.indexOf('HOIST_EDIT-HOIST-MANAGE')!==-1 && (
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
            res={'MENU_EDIT'}
          />)}
          {permission.indexOf('HOIST_APPROVAL-DEVICEMANAG')!==-1 && (
          <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            afterCallBack={this.btnClicks.bind(this, 'Approve')}
            res={'MENU_EDIT'}
          />)}
          {permission.indexOf('HOIST_EDIT-HOIST-MANAGE')!==-1 && (
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            useModel={true}
            edit={true}
            verifyCallBack={this.hasRecord}
            afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
            content={'你确定要删除吗？'}
            res={'MENU_EDIT'}
          />)}
          <AddHoist
            handleModalCancel={this.handleModalCancel}
            handleModalOk={this.handleModalOk}
            visibleModal={this.state.visibleModal}
            projectId={data1}
          />
          {this.state.isShowRelease && (
            <Release
              projectName={this.props.projectName}
              firstList={getReleaseMeetingList}
              handleCancel={this.handleCancelRelease}
              projectId={this.props.data1}
              proc={{
                bizTypeCode: 'szxm-deviceHoisting-approve',
                title: this.state.projectName + '设备吊装发布审批',
              }}
              reflesh={this.updateFlow.bind(this)}
            />
          )}
          {this.state.showApprovalVisible && (
            <Approval
              visible={true}
              width={'1200px'}
              proc={{
                bizTypeCode: 'szxm-deviceHoisting-approve',
                title: this.state.projectName + '设备吊装发布审批',
              }}
              projectId={this.props.data1}
              sectionId={this.props.sectionId}
              title={this.props.title}
              handleCancel={() => {
                this.setState({ showApprovalVisible: false });
              }}
              refreshData={this.props.updateFlow}
              bizType={this.props.bizType}
            />
          )}
        </div>
      </div>
    );
  }
}

export default TopTags;
