import React, { Component, memo } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import axios from '@/api/axios';
import notificationTip from '@/utils/notificationTip';
import style from './style.less';
import { queryFlowQuaInsp } from '@/modules/Suzhou/api/suzhou-api';

import Release from '../../../../../Components/Release';
import Approval from '../Workflow/Approval';

export default memo(
  class extends Component {
    state = {
      visible: false,
      treeData: [],
      selectData: [],
      //
      isShowRelease: false,
      showApprovalVisible: false,
      projectName: '',
      projectId: '',
      sectionId: '',
    };
    btnClicks = () => {
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
    };
    // 取消发布审批
    handleCancelRelease = () => {
      this.setState({
        isShowRelease: false,
      });
    };
    updateFlow = (projectId, data) => {
      this.props.updateFlow();
    };
    render() {
      const {
        handleSearch,
        handleDelete,
        handleGetProjectId,
        handleOpenSection,
        hasRecord,
        projectId,
        projectNames,
        permission
      } = this.props;
      return (
        <div className={style.main}>
          <div className={style.tabMenu}>
            <SelectProjectBtn openPro={handleGetProjectId} />
            <SelectSectionBtn openSection={handleOpenSection} data1={projectId} />
            {permission.indexOf('CONCEALED_EDIT-CONCEALED')!==-1 && (<AddFormComponent
              visible={this.state.visible}
              projectId={projectId}
              treeData={this.state.treeData}
              selectData={this.state.selectData}
              projectNames={projectNames}
              addTabelData={this.props.addTabelData}
            />)}
            {permission.indexOf('CONCEALED_EDIT-CONCEALED')!==-1 && (<PublicButton
              name={'删除'}
              title={'删除'}
              icon={'icon-shanchu'}
              afterCallBack={handleDelete}
              verifyCallBack={hasRecord}
              res={'MENU_EDIT'}
              useModel={true}
              show={this.props.selectedRowKeys.length > 0}
              edit={true}
              content={'你确定要删除吗？'}
            />)}

          {permission.indexOf('CONCEALED_RELEASE-CONCEALED')!==-1 && (<PublicButton
              name={'发布审批'}
              title={'发布审批'}
              icon={'icon-fabu'}
              afterCallBack={this.btnClicks}
              res={'MENU_EDIT'}
          />)}
          </div>
          <div className={style.rightLayout}>
            <SearchVeiw handleSearch={handleSearch} />
          </div>
          {this.state.isShowRelease && (
            <Release
              projectName={this.props.projectName}
              firstList={queryFlowQuaInsp}
              projectId={this.props.data1}
              proc={{
                bizTypeCode: 'szxm-quaConce-approve',
                title: this.state.projectName + '隐蔽工程发布审批',
              }}
              reflesh={this.updateFlow.bind(this)}
              handleCancel={this.handleCancelRelease}
            />
          )}
          {this.state.showApprovalVisible && (
            <Approval
              visible={true}
              width={'1200px'}
              proc={{
                bizTypeCode: 'szxm-quaConce-approve',
                title: this.state.projectName + '隐蔽工程发布审批',
              }}
              projectId={this.props.data1}
              sectionId={this.props.sectionId}
              projectName={this.props.projectName}
              // 搜索参数
              params={this.props.params}
              leftTableTree={this.props.leftTableTree}
              handleCancel={() => {
                this.setState({ showApprovalVisible: false });
              }}
              refreshData={this.props.updateFlow}
              bizType={this.props.bizType}
            />
          )}
        </div>
      );
    }
    handleAdd = () => {
      if (this.props.projectId) {
        // 选择标段
      } else {
        notificationTip('请选中项目');
      }
    };
  }
);
