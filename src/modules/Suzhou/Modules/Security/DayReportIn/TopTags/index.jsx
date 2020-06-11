import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import Search from '../SearchVeiw';
import style from './style.less';
import axios from '@/api/axios';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import {addRcReport,deleteRcReport,publishRcReport,cbRcReport,closeRcReport} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal'
const { Option } = Select;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
            isShowRelease:false ,//流程公用
            showApprovalVisible:false,//发布审批
            editPermission:'',
            cbPermission:'',
            xfPermission:'',
            gbPermission:'',
        }
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if(this.props.selectedRowKeys.length == 0){
            notificationFun('未选中数据','请选择数据进行操作');
            return false;
        }else {
            return true
        }
    }
    hasRecordOne=()=>{
        if(!this.props.record){
            notificationFun('未选中数据','请选择数据进行操作');
            return false;
        }else {
            return true
        }
    }
    btnClicks = (name, type) => {
        const {record,section,selectedRows,projectName,projectId,viewType} = this.props;
        if(name == 'AddTopBtn'){
            if(viewType == '1' && !projectId){
                notificationFun('提示','请选择项目')
            }else{
                this.setState({
                    modalVisible: true,
                    type: 'ADD',
                });
            }
        }
        if(name == 'HurryTopBtn'){
            //催报
            if(record.statusVo.code == '1'){ //已下发
                axios.post(cbRcReport+`?id=${record.id}`).then(res=>{
                    this.props.success(res.data.data);
                })
            }else{
                notificationFun("提示",'已下发状态才可催报');
            }
        }
        if(name == 'sendBtn'){
            //下发
            if(record.statusVo.code == '0'){//未下发
                axios.post(publishRcReport+`?id=${record.id}`).then(res=>{
                    this.props.success(res.data.data);
                })
            }else{
                notificationFun("提示",'未下发状态可下发');
            }
        }
        if(name == 'closeBtn'){
            //关闭
            if(record.statusVo.code == '1'){//未下发
                axios.post(closeRcReport+`?id=${record.id}`).then(res=>{
                    this.props.success(res.data.data);
                })
            }else{
                notificationFun("提示",'未下发状态可下发');
            }
        }
        if(name == 'DeleteTopBtn'){
            const deleteArray = [];
            selectedRows.forEach((value,item)=>{
                if(value.statusVo.code == '0'){
                    deleteArray.push(value.id)
                }else{
                    notificationFun("提示",'该数据不能删除');
                    return false;
                }
            })  
            if(deleteArray.length >0){
                axios.deleted(deleteRcReport+`?viewType=${this.props.viewType}`, {data:deleteArray}, true).then(res => {
                    this.props.delSuccess(deleteArray);
                }).catch(err => {
                });
            }
        }
    }
    submit = (values, type) => {
        const data = {
          ...values,
          viewType:this.props.viewType,
          projectId:this.props.projectId
        };
        axios.post(addRcReport, data, true).then(res => {
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
    componentDidMount(){       
        let menuCode = this.props.menuCode
        if(menuCode=='SECURITY-DAYREPORTIN'){
          this.setState({
            editPermission:'DAYREPORTIN_RC-REPORT-IN-DETAILL',
            cbPermission:'DAYREPORTIN_RC-REPORT-IN-CB',
            xfPermission:'DAYREPORTIN_RC-REPORT-IN-XF',
            gbPermission:'DAYREPORTIN_RC-REPORT-IN-GB',
          })
        }else if(menuCode=='SECURITY-DAYREPORTOUT'){
          this.setState({
            editPermission:'DAYREPORTOUT_EDIT-DAYREPORT-OUT',
            cbPermission:'DAYREPORTOUT_URGE-DAYREPORT-OUT',
            xfPermission:'DAYREPORTOUT_DOWN-DAYREPORT-OUT',
            gbPermission:'DAYREPORTOUT_CLOSE-DAYREPORT-OUT',
          })
        }
    }
    render(){
        const props = this.props
        const {editPermission,cbPermission,xfPermission,gbPermission} = this.state
        console.log('toptagsstate',this.state)
        return(
            <div className={style.main}>
                <div className={style.search}>
                    <Search search={this.props.search}/>
                </div>
                <div className={style.tabMenu}>
                    {this.props.viewType == '1'?(<SelectProBtn  openPro={this.props.openPro} />):null}
                    {props.permission.indexOf(editPermission)!==-1 && ( 
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                                    afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                                    res={'MENU_EDIT'}
                    />)}
                    {props.permission.indexOf(cbPermission)!==-1 && ( 
                    <PublicButton name={'催报'} title={'催报'} icon={'icon-add'}
                        useModel={true} edit={true}
                        verifyCallBack = {this.hasRecordOne}
                        afterCallBack={this.btnClicks.bind(this,'HurryTopBtn')}
                        content={'你确定要催报吗'}
                        res={'MENU_EDIT'}
                    />)}
                    {props.permission.indexOf(xfPermission)!==-1 && ( 
                    <PublicButton name={'下发'} title={'下发'} icon={'icon-fabu'}
                        useModel={true} edit={true}
                        verifyCallBack = {this.hasRecordOne}
                        afterCallBack={this.btnClicks.bind(this,'sendBtn')}
                        content={'你确定要下发吗'}
                        res={'MENU_EDIT'} />)}
                    {props.permission.indexOf(gbPermission)!==-1 && ( 
                    <PublicButton name={'关闭'} title={'关闭'} icon={'icon-fabu'}
                        useModel={true} edit={true}
                        verifyCallBack = {this.hasRecordOne}
                        afterCallBack={this.btnClicks.bind(this,'closeBtn')}
                        content={'你确定要关闭吗'}
                        res={'MENU_EDIT'} />)}
                    {props.permission.indexOf(editPermission)!==-1 && ( 
                    <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                                    useModel={true} edit={true}
                                    verifyCallBack={this.hasRecord}
                                    afterCallBack={this.btnClicks.bind(this,'DeleteTopBtn')}
                                    content={'你确定要删除吗'}
                                    res={'MENU_EDIT'}
                    />)}
                </div>
                {this.state.modalVisible && <AddModal
                record={this.props.record}
                modalVisible={this.state.modalVisible}
                success={this.props.success}
                submit={this.submit.bind(this)}
                projectId={this.props.projectId}
                viewType = {this.props.viewType}
                handleCancel={this.handleCancel.bind(this)}/>}
            </div>
        )
    }
}
export default TopTags;