import React, { Component } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import SelectProjectBtn from '../../../../components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '../../../../components/SelectBtn/SelectSectionBtn';
import AddOrder from '../AddOrder';
import Search from '../SearchVeiw';
import style from './style.less';
import { notification } from 'antd';
import Release from '../../../../../Components/Release';
import Approval from '../Workflow/Approval';
class TopTags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleModal: false,
      isShowRelease: false,
      showApprovalVisible: false,
    };
  }
  // 增加、删除按键响应操作
  btnClicks = type => {
    if (type === 'AddTopBtn') {
      this.setState({ visibleModal: true });
    } else if (type === 'DeleteTopBtn') {
      this.props.deleteData();
    }
  };
  // 添加成功
  handleModalOk = data0 => {
    this.setState({
      visibleModal: false,
    });
    this.props.addData(data0);
  };
  // 取消添加
  handleModalCancel = () => {
    this.setState({
      visibleModal: false,
    });
  };
  //判断是否有选中数据
  hasRecord = () => {
    if (this.props.selectedRowKeys.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未选中数据',
        description: '请选择数据进行操作',
      });
      return false;
    } else {
      return true;
    }
  };
  fabushenpi = () => {
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
    const { openPro, openSection, data1 ,permission} = this.props;
    return (
      <div className={style.main}>
        <div className={style.search}>
            <Search search={this.props.search} applyType={this.props.applyType} />
        </div>
        <div className={style.tabMenu}>
          <SelectProjectBtn openPro={openPro} />
          <SelectSectionBtn openSection={openSection} data1={data1} />
          {permission.indexOf('STOPREWORKORDER_EDIT-STOP-RE-ORDER')!==-1 && ( 
          <PublicButton
            name={'新增'}
            title={'新增'}
            icon={'icon-add'}
            afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
            res={'MENU_EDIT'}
          />)}
          {permission.indexOf('STOPREWORKORDER_EDIT-STOP-RE-ORDER')!==-1 && ( 
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
          {/* <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            afterCallBack={this.fabushenpi}
            res={'MENU_EDIT'}
          /> */}
          <AddOrder
            handleModalCancel={this.handleModalCancel}
            handleModalOk={this.handleModalOk}
            visibleModal={this.state.visibleModal}
            projectId={data1}
          />
          {/*  */}
          {this.state.isShowRelease && (
            <Release
              proc={{
                bizTypeCode: 'szxm-dispatch-approve',
                title: `[${this.props.projectName}]派工单发布审批`,
              }}
              reflesh={this.updateFlow.bind(this)}
              handleCancel={this.handleCancelRelease}
              // // 参数
              // firstList={'queryFlowSubcontrApprovalList'}
              projectName={this.props.projectName}
              projectId={this.props.projectId}
            />
          )}
          {this.state.showApprovalVisible && (
            <Approval
              visible={true}
              width={'1200px'}
              proc={{
                bizTypeCode: 'szxm-dispatch-approve',
                title: `[${this.props.projectName}]派工单发布审批`,
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
      </div>
    );
  }
}

export default TopTags;
