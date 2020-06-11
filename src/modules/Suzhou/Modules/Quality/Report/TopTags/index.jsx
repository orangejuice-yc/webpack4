import React, { Component, memo } from 'react';
import { Select, DatePicker } from 'antd';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import AddFormComponent from '../AddForm';
import SearchVeiw from '../SearchVeiw';
import notificationTip from '@/utils/notificationTip';
import { getsectionId, queryQuaSystem, queryFlowQuaInsp } from '@/api/suzhou-api';
import Release from '../../../../../Components/Release';
import Approval from '../Workflow/Approval';
import style from './style.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

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
    updateFlow = (...args) => {
      this.props.updateFlow(args);
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
      // console.log(this.props.addBtn);
      // console.log(this.props.rightData);
      // console.log(this.props.rightData && this.props.rightData.statusVo.code == 'INIT');
      return (
        <div className={style.main}>
          <div className={style.tabMenu}>
            {/* <SelectProjectBtn openPro={handleGetProjectId} />
            <SelectSectionBtn openSection={handleOpenSection} data1={projectId} /> */}
            {/* <SelectComponent /> */}
            {permission.indexOf('REPORT_EDIT-QUALITY-REPORT')!==-1 && (<AddFormComponent
              addBtn = {this.props.addBtn}
              visible={this.state.visible}
              projectId={projectId}
              treeData={this.state.treeData}
              selectData={this.state.selectData}
              projectNames={projectNames}
              addTabelData={this.props.addTabelData}
              typeVo={this.props.typeVo}
            />)}
            {permission.indexOf('REPORT_EDIT-QUALITY-REPORT')!==-1 && (<PublicButton
              name={'删除'}
              title={'删除'}
              icon={'icon-shanchu'}
              afterCallBack={handleDelete}
              verifyCallBack={hasRecord}
              res={'MENU_EDIT'}
              show={this.props.selectedRowKeys.length > 0}
              useModel={true}
              edit={true}
              content={'你确定要删除吗？'}
            />)}

            {permission.indexOf('REPORT_RELEASE-MASS-REPORT')!==-1 && (<PublicButton
              name={'发布审批'}
              title={'发布审批'}
              show={this.props.rightData && this.props.rightData.statusVo.code == 'INIT' ?true:false}
              icon={'icon-fabu'}
              afterCallBack={this.btnClicks}
              res={'MENU_EDIT'}
            />)}
          </div>
          <div className={style.rightLayout}>
            <SearchVeiw
              status={this.props.status}
              handleSearch={handleSearch}
              projectNames={this.props.projectNames}
            />
          </div>
          {/*  */}
          {this.state.isShowRelease && (
            <Release
              projectName={this.props.projectName}
              firstList={queryFlowQuaInsp}
              projectId={this.props.data1}
              proc={{
                bizTypeCode: 'szxm-quaInsp-approve',
                title: this.state.projectName + '质量报验发布审批',
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
                'vars':{'checkType':(!this.props.rightData||!this.props.rightData.checkTypeVo)?'':this.props.rightData.checkTypeVo.code},
                bizTypeCode: 'szxm-quaInsp-approve',
                title: this.state.projectName + '质量报验发布审批',
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
              parentData = {this.props.rightData}
            />
          )}
        </div>
      );
    }
  }
);
