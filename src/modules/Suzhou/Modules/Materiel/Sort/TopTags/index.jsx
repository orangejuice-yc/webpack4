import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {delClassification,getBaseSelectTree,addClassification,dowClassification,classificationImprotFile} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal'
//导入
import UploadDoc from '../../../../components/ImportFile'
import PublicMenuButton from "@/components/public/TopTags/PublicMenuButton";
import Contract from '../Contract'
//流程
import Release from "../../../../../Components/Release";
import { getReleaseMeetingList } from "../../../../../../api/api"
import Approval from '../Workflow/Approval';
const { Option } = Select;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
            type:"ADD",
            optionStatus:[], //状态，来自数据自带呢
            ImportContVisible:false,//合同导入
        }
    }
    componentDidMount(){
        axios.get(getBaseSelectTree("base.flow.status")).then((res)=>{
            if(Array.isArray(res.data.data)){
              this.setState({
                optionStatus:res.data.data
              })
            }
          });
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
        const {record,sectionId,selectedRows,projectName,projectId} = this.props;
        if(name == 'AddTopBtn'){
            if(!projectId){
                notificationFun("提示",'请先选择项目');
            }else{
                this.setState({
                    modalVisible: true,
                    type: 'ADD',
                });
            }
        }
        if(name == 'ImportFile'){
            let section = sectionId.split(",")
            if(!sectionId==''&&section.length>1){
                notificationFun("提示",'只能在一个标段下操作，请重新选择标段！');
            }else if(sectionId==''){
                notificationFun("提示",'请选择标段！');
            }else{
                this.setState({
                UploadVisible:true
              })
            }
            
        }
        if(name == "ImportCont"){
            this.setState({
                ImportContVisible:true
            })
        }
        if(name == 'DeleteTopBtn'){
            const deleteArray = [];
            selectedRows.forEach((value,item)=>{
              if(value.statusVo.code == 'INIT'){
                deleteArray.push(value.id)
              }else{
                notificationFun('非新建状态数据不能删除', '姓名为'+value.materialCode+"不能删除")
                return false;
              }
            })  
            if(deleteArray.length > 0){
              axios.deleted(delClassification, {data:deleteArray}, true).then(res => {

                this.props.delSuccess(deleteArray);
              }).catch(err => {
              });
            }
        }
        //发布审批
        if(name == 'approve'){
            if (!projectId) {
                notification.warning(
                  {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有选择项目！'
                  }
                )
                return
            }
            this.setState({
            isShowRelease: true,
            showApprovalVisible:true,
            projectName: "["+projectName+"]"
            })
        }
        //导出
        if(name == 'exportFile'){
            axios.down(dowClassification,{}).then((res)=>{
            })
        }
    }
    submit = (values, type) => {
        const data = {
          ...values,
        };
        axios.post(addClassification, data, true).then(res => {
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
    updateFlow = (projectId, data) => {
        this.props.updateFlow();
    }
    handleCancelImportFile = (v) => {
        this.setState({
            UploadVisible: false
        })
    }
    handleContract = (v) => {
        this.setState({
            ImportContVisible: false
        })
    }
    render(){
        const props = this.props
        return(
            <div className={style.main}>
                <div className={style.search}>
                    状态：
                    <Select allowClear 
                            onChange={this.props.selectStatue}
                            style={{width:'80px', marginRight: 10 }}
                            size="small">
                            {
                                this.state.optionStatus.length && this.state.optionStatus.map((item,i) => {
                                return (
                                    <Option key={item.value} value={item.value}>{item.title}</Option>
                                )
                                })
                            }
                    </Select>
                    来源：
                    <Select allowClear 
                            onChange={this.props.selectSource}
                            style={{width:'60px', marginRight: 10 }}
                            size="small">
                            <Option key={'0'} value='0'>甲供</Option>
                            <Option key={'1'} value='1'>乙供</Option>
                    </Select>
                    <Search search={this.props.search} placeholder={'物料编码/物料名称'} />
                </div>
                <div className={style.tabMenu}>
                    <SelectProBtn  openPro={this.props.openPro} />
                    <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
                    {props.permission.indexOf('SORT_MATERIEL-SORT')!==-1 && (
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                                    afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                                    res={'MENU_EDIT'}
                    />)}
                    {/* 导入 */}
                    {props.permission.indexOf('SORT_MATERIEL-SORT-UPLOAD')!==-1 && (
                    <PublicMenuButton title={"导入"} afterCallBack={this.btnClicks} icon={"icon-iconziyuan2"}
                        menus={[{ key: "ImportFile", label: "excel导入", icon: "icon-iconziyuan2",},
                        { key: "ImportCont", label: "从合同导入", icon: "icon-iconziyuan2"}]}
                    />)}
                    {/* <PublicButton name={'导入'} title={'导入'} icon={'icon-iconziyuan2'} 
                                    afterCallBack={this.btnClicks.bind(this, 'ImportFile')} /> */}
                    {props.permission.indexOf('SORT_MATERIEL-SORT-UPLOAD')!==-1 && (
                    <PublicButton name={'导出'} title={'导出模版'} icon={'icon-iconziyuan2'} 
                                    afterCallBack={this.btnClicks.bind(this, 'exportFile')} />)}
                    {props.permission.indexOf('SORT_MATERIEL-SORT-WF')!==-1 && (
                     <PublicButton name={'发布审批'} title={'发布审批'} icon={'icon-fabu'}
                                    afterCallBack={this.btnClicks.bind(this,'approve')}
                                    res={'MENU_EDIT'} />)}
                    {props.permission.indexOf('SORT_MATERIEL-SORT')!==-1 && (
                    <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                                    useModel={true} edit={true}
                                    verifyCallBack={this.hasRecord}
                                    afterCallBack={this.btnClicks.bind(this,'DeleteTopBtn')}
                                    content={'你确定要删除嘛'}
                                    res={'MENU_EDIT'}
                    />)}
                </div>
                {/* 上传文件 */}
                {this.state.UploadVisible &&
                    <UploadDoc 
                        modalVisible={this.state.UploadVisible} 
                        handleOk={this.handleOk} 
                        handleCancel={this.handleCancelImportFile}
                        getListData={this.props.updateImportFile}
                        projectId={this.props.projectId}
                        sectionId={this.props.sectionId}
                        url  = {classificationImprotFile}
                    />
                }
                {/* 合同导入 */}
                {this.state.ImportContVisible && <Contract 
                    modalVisible={this.state.ImportContVisible}
                    projectId={this.props.projectId}
                    handleCancel={this.handleContract}
                    success={this.props.success}
                />}
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
                firstList={getReleaseMeetingList} 
                handleCancel={this.handleCancelRelease} 
                projectId={this.props.projectId} 
                proc={{  "bizTypeCode": "szxm-classification-approve", "title": this.state.projectName+"物料分类发布审批" }}
                reflesh={this.updateFlow.bind(this)} />}
                {this.state.showApprovalVisible &&
                <Approval
                    visible={true}
                    width={"1200px"}
                    proc={{  "bizTypeCode": "szxm-classification-approve", "title": this.state.projectName+"物料分类发布审批" }}
                    projectId={this.props.projectId}
                    sectionId = {this.props.sectionId}
                    searcher= {this.props.searcher}
                    handleCancel={() => { this.setState({ showApprovalVisible: false }) }}
                    refreshData={this.props.updateFlow}
                    bizType={this.props.bizType}
                />}
            </div>
        )
    }
}
export default TopTags;