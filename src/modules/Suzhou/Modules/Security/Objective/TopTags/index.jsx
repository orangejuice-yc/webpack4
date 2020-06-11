import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification,DatePicker} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
// import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
// import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {addDangerPlan,deleteObjectTemplate} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal';
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
        const {record,section,selectedRows,selectedRowKeys,projectName,projectId} = this.props;
        if(name == 'AddTopBtn'){
            this.setState({
                modalVisible: true,
                type: 'ADD',
            });
        }
        if(name == 'DeleteTopBtn'){
            if(selectedRowKeys.length >0){
                axios.deleted(deleteObjectTemplate, {data:selectedRowKeys}, true).then(res => {
                    this.props.delSuccess();
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
    render(){
        const props = this.props
        return(
            <div className={style.main}>
                <div className={style.tabMenu}>
                    {/* <SelectProBtn  openPro={this.props.openPro} /> */}
                    {/* <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} /> */}
                   
                    {/* <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                                    afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                                    res={'MENU_EDIT'}
                    />
                    {props.permission.indexOf('SPECIALPLAN_RELEASE-SPECIALPLAN')!==-1 && ( 
                    <PublicButton name={'发布审批'} title={'发布审批'} icon={'icon-fabu'}
                        afterCallBack={this.btnClicks.bind(this,'approve')}
                        res={'MENU_EDIT'} />)} */}
                    {props.permission.indexOf('OBJECTIVE_EDIT_OBJECTTEMPLATE')!==-1 && ( 
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
            </div>
        )
    }
}
export default TopTags;