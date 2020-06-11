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
import {peopleBackDel,uploadPeopleBackFile} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import UploadDoc from '../../../../components/ImportFile'
const { Option } = Select;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
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
        if(name == 'ImportFile'){
            this.setState({
                UploadVisible:true
            })
        }
        if(name == 'DeleteTopBtn'){
            const deleteArray = [];
            selectedRows.forEach((value,item)=>{
                deleteArray.push(value.id)
            })  
            if(deleteArray.length >0){
                axios.deleted(peopleBackDel, {data:deleteArray}, true).then(res => {
                    this.props.delSuccess(deleteArray);
                }).catch(err => {
                });
            }
        }
    }
    handleCancelImportFile = (v) => {
        this.setState({
            UploadVisible: false
        })
    }
    render(){
        const props = this.props
        return(
            <div className={style.main}>
                <div className={style.search}>
                    <Search search={this.props.search} placeholder={'姓名'} />
                </div>
                <div className={style.tabMenu}>
                    {/* <SelectProBtn  openPro={this.props.openPro} /> */}
                    {/* <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} /> */}
                    {props.permission.indexOf('REPORT_RH-REPORT-UPLOAD')!==-1 && (
                    <PublicButton name={'导入'} title={'导入'} icon={'icon-iconziyuan2'}
                                    afterCallBack={this.btnClicks.bind(this,'ImportFile')}
                                    res={'MENU_EDIT'}
                    />)}
                    {props.permission.indexOf('REPORT_RETURNHOME-REPORT')!==-1 && (
                    <PublicButton name={'删除'} title={'删除'} icon={'icon-shanchu'}
                                    useModel={true} edit={true}
                                    verifyCallBack={this.hasRecord}
                                    afterCallBack={this.btnClicks.bind(this,'DeleteTopBtn')}
                                    content={'你确定要删除吗'}
                                    res={'MENU_EDIT'}
                    />)}
                    {/* 上传文件 */}
                    {this.state.UploadVisible &&
                        <UploadDoc 
                            modalVisible={this.state.UploadVisible} 
                            handleOk={this.handleOk} 
                            handleCancel={this.handleCancelImportFile}
                            getListData={this.props.updateImportFile}
                            projectId={''}
                            sectionId={''}
                            url  = {uploadPeopleBackFile}
                        />
                    }
                </div>
            </div>
        )
    }
}
export default TopTags;