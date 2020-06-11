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
import { queryFlowConstructEvaluationList } from '@/modules/Suzhou/api/suzhou-api';

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
  render(){
    const props = this.props
    return(
      <div className={style.main}>
        <div className={style.tabMenu}>
          <SelectProjectBtn openPro={props.openPro} />
          <SelectSectionBtn openSection={props.openSection} data1={props.projectId} />
          {props.permission.indexOf('CONSTRUCTIONEVALUATION_EDIT-SHIGONGKAOPING')!==-1 && ( 
          <AddFormComponent projectId={props.projectId} handleAddData={props.handleAddData} />)}
          {props.permission.indexOf('CONSTRUCTIONEVALUATION_EDIT-SHIGONGKAOPING')!==-1 && ( 
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
          {props.permission.indexOf('CONSTRUCTIONEVALUATION_EXPORT-SHIGONG-KAO')!==-1 && ( 
          <PublicButton
            name={'导出'}
            title={'导出'}
            icon={'icon-iconziyuan2'}
            res={'MENU_EDIT'}
            edit={true}
            afterCallBack={props.handleExport}
          />)}
          {props.permission.indexOf('CONSTRUCTIONEVALUATION_RELEASE-SHIGONG-KAO')!==-1 && ( 
          <PublicButton
                name={'发布审批'}
                title={'发布审批'}
                icon={'icon-fabu'}
                afterCallBack={this.btnClicks}
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
        {/* */} 
        {this.state.isShowRelease && (
              <Release
                proc={{
                  bizTypeCode: 'szxm-constructEvaluation-approve',
                  title: `[${this.props.projectName}]施工考评发布审批`,
                }}
                reflesh={this.updateFlow.bind(this)}
                handleCancel={this.handleCancelRelease}
                // 参数
                firstList={queryFlowConstructEvaluationList}
                projectName={this.props.projectName}
                projectId={this.props.projectId}
              />
            )}
            {this.state.showApprovalVisible && (
              <Approval
                visible={true}
                width={'1200px'}
                proc={{
                  bizTypeCode: 'szxm-constructEvaluation-approve',
                  title: `[${this.props.projectName}]施工考评发布审批`,
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
    )
  }
}