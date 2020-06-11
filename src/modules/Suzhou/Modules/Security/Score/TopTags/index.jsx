import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import moment from 'moment';
import {Modal, message,Select,notification,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {addDangerPlan,deleteSysObjectScore} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal';
//流程
import Release from "../../../../../Components/Release";
import Approval from '../Workflow/Approval';
const { Option } = Select;
const {MonthPicker} = DatePicker;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
            isShowRelease:false ,//流程公用
            showApprovalVisible:false,//发布审批
        }
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if(this.props.selectedRows.length == 0){
            notificationFun('未选中数据','请选择数据进行操作');
            return false;
        }else {
            return true
        }
    }
    btnClicks = (name, type) => {
        const {record,section,selectedRows,projectName,projectId} = this.props;
        if(name == 'AddTopBtn'){
            this.setState({
                modalVisible: true,
                type: 'ADD',
            });
        }
        if(name == 'approve'){
            if (!projectId) {
                notificationFun('警告','没有选择项目');
                return
              }
              this.setState({
                isShowRelease: true,
                showApprovalVisible:true,
                projectName: "["+projectName+"]"
              })
        }
        if(name == 'DeleteTopBtn'){
            const deleteArray = [];
            selectedRows.forEach((value,item)=>{
                if(value.statusVo.code == 'INIT'){
                    deleteArray.push(value.id)
                }else{
                    notificationFun("提示",'非新建不能删除');
                    return false;
                }
            })  
            if(deleteArray.length >0){
                axios.deleted(deleteSysObjectScore, {data:deleteArray}, true).then(res => {
                    this.props.delSuccess(deleteArray);
                }).catch(err => {
                });
            }
        }
    }
    submit = (values, type) => {
        const data = {
          ...values,
          projectId:this.props.projectId,
        };
        axios.post(addDangerPlan, data, true).then(res => {
          if (res.data.status === 200) {
            if (type == 'save') {
              this.handleCancel();
            }
            this.props.success(res.data.data);
          }
        });
    };
    //关闭model
    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };
     //取消审批
     handleCancelRelease = () => {
        this.setState({
            isShowRelease: false
        })
    }
    searchDate=(date,dateString)=>{
        this.props.search(dateString)
    }
    render(){
        const props = this.props
        return(
            <div className={style.main}>
                <div className={style.search}>
                    <span style={{ marginLeft: 10 }}> 周期：</span>
                    <MonthPicker
                        placeholder="请选择周期"
                        size="small"
                        style={{ width: 150 }}
                        value={!this.props.year?null:moment(''+this.props.year+'-'+this.props.month, 'YYYY-MM')}
                        onChange={this.searchDate}
                        allowClear={false}
                    />
                </div>
                <div className={style.tabMenu}>
                    <SelectProBtn  openPro={this.props.openPro} />
                    <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
                    
                    {/* <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                                    afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                                    res={'MENU_EDIT'}
                    />
                    {props.permission.indexOf('SPECIALPLAN_RELEASE-SPECIALPLAN')!==-1 && ( 
                    <PublicButton name={'发布审批'} title={'发布审批'} icon={'icon-fabu'}
                        afterCallBack={this.btnClicks.bind(this,'approve')}
                        res={'MENU_EDIT'} />)} */}
                    {props.permission.indexOf('SCORE_RELEASE_SCORE')!==-1 && ( 
                        <PublicButton name={'发布审批'} title={'发布审批'} icon={'icon-fabu'}
                            afterCallBack={this.btnClicks.bind(this,'approve')}
                            res={'MENU_EDIT'} />
                    )}    
                    {props.permission.indexOf('SCORE_EDIT_SCORE')!==-1 && ( 
                        <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                                useModel={true} edit={true}
                                verifyCallBack={this.hasRecord}
                                afterCallBack={this.btnClicks.bind(this,'DeleteTopBtn')}
                                content={'你确定要删除吗'}
                                res={'MENU_EDIT'}
                        />
                    )}
                </div>
                {this.state.modalVisible && <AddModal
                record={this.props.record}
                modalVisible={this.state.modalVisible}
                success={this.props.success}
                submit={this.submit.bind(this)}
                sectionId={this.props.sectionId}
                projectId={this.props.projectId}
                handleCancel={this.handleCancel.bind(this)}/>}

                {/* 流程审批 */}
                {this.state.isShowRelease && 
                <Release 
                projectName = {this.props.projectName} 
                handleCancel={this.handleCancelRelease} 
                projectId={this.props.projectId} 
                proc={{  "bizTypeCode": "szxm-score-approve", "title": this.state.projectName+"安全管理考核记录审批" }}
                reflesh={this.props.updateFlow}/>}
                {this.state.showApprovalVisible &&
                <Approval
                    visible={true}
                    width={"1200px"}
                    proc={{  "bizTypeCode": "szxm-score-approve", "title": this.state.projectName+"安全管理考核记录审批" }}
                    projectId={this.props.projectId}
                    sectionId = {this.props.sectionId}
                    year = {this.props.year}
                    month = {this.props.month}
                    handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
                    refreshData={this.props.updateFlow}
                    bizType={this.props.bizType}
                />}
            </div>
        )
    }
}
export default TopTags;