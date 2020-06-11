import Approval from '@/modules/Doc/SzxmProDoc/Workflow/Approval';
import React, { Component } from 'react';
import { Divider, notification } from 'antd';
import Search from '@/components/public/Search';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';
import PublicMenuButton from '@/components/public/TopTags/PublicMenuButton';
import UploadDoc from '@/modules/Doc/SzxmProDoc/Upload';
import * as dataUtil from '@/utils/dataUtil';

export class DocTempDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      UploadVisible: false,
      PublicdVisible: false,
      showApprovalVisible: false,
      visible: false,
    };
  }
  showReleaseModal = name => {
    let { selectProjectName } = this.props;
    this.setState({ showApprovalVisible: true, projectName: '[' + selectProjectName + ']' });
    // if (name == "approve") {
    //     this.setState({ showApprovalVisible: true,projectName: "["+selectProjectName+"]" });
    // }
    // if (name == "direct") {
    //     this.setState({ PublicdVisible: true,projectName: "["+selectProjectName+"]" });
    // }
  };
  /**
   *  打开上传文件窗口
   *
   **/
  showUpLoadModal = () => {
    if (!this.props.leftData) {
      dataUtil.message('请选择文件夹进行操作');
      return;
    }
    this.setState({ UploadVisible: true });
  };
  render() {
    return (
      <div className={style.main}>
        <div className={style.search}>
          <Search search={this.props.search} placeholder="文档标题/文档编号" />
        </div>
        <div className={style.tabMenu}>
          {/*上传*/}
          <PublicButton
            name={'上传'}
            title={'上传'}
            icon={'icon-shangchuanwenjian'}
            afterCallBack={this.showUpLoadModal}
          />
          {/*发布*/}
          <PublicButton
            name={'发布审批'}
            title={'发布审批'}
            icon={'icon-fabu'}
            afterCallBack={this.showReleaseModal}
          />
          {/* 下载 */}
          <PublicButton
            name={'下载'}
            title={'下载'}
            icon={'icon-xiazaiwenjian'}
            afterCallBack={this.props.download}
          />
          {/*删除*/}
          <PublicButton
            title={'删除'}
            useModel={true}
            verifyCallBack={this.props.deleteVerifyCallBack}
            afterCallBack={this.props.deleteData}
            icon={'icon-delete'}
          />
        </div>

        {/* 上传文档 */}
        {this.state.UploadVisible && (
          <UploadDoc
            handleCancel={() => {
              this.setState({ UploadVisible: false });
            }}
            projectId={this.props.projectId}
            data={this.props.leftData}
            addData={this.props.rightAddData}
            folderUpdate={this.props.folderUpdate}
            bizType={this.props.bizType}
            startContent={this.props.startContent}
          />
        )}
        {this.state.showApprovalVisible && (
          <Approval
            visible={true}
            width={'1200px'}
            proc={{
              vars: {},
              procDefKey: '',
              bizTypeCode: 'plan_prodoc-approve',
              title: this.state.projectName + '项目文档发布审批',
            }}
            projectId={this.props.projectId}
            handleCancel={() => {
              this.setState({ showApprovalVisible: false });
            }}
            refreshData={this.props.refreshRight}
          />
        )}
      </div>
    );
  }
}

export default DocTempDoc;
