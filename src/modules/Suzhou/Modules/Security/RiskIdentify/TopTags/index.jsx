import React, {Component} from 'react';
// import dynamic from 'next/dynamic';
import {Modal, message,Select,notification,DatePicker,Form} from 'antd';
import {connect} from 'react-redux';
import {curdCurrentData} from '../../../../../../store/curdData/action';
import Search from '@/modules/Suzhou/components/Search';
import SelectProBtn from '@/modules/Suzhou/components/SelectBtn/SelectProBtn';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import style from './style.less';
import axios from '@/api/axios';
import {addRiskIndentify,delRiskIndentify,updateInInventory,updateStorage} from '@/modules/Suzhou/api/suzhou-api';
import PublicButton from '@/components/public/TopTags/PublicButton';
import notificationFun from '@/utils/notificationTip';
import AddModal from '../AddModal'
const { Option } = Select;
export class TopTags extends Component{
    constructor(props){
        super(props);
        this.state = {
            modalVisible:false, //增加修改弹窗
            initiateTimeFrom:'',//开始时间
            initiateTimeTo:'',//结束时间
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
            if(!projectId){

            }else{
                this.setState({
                    modalVisible: true,
                    type: 'ADD',
                });
            }
        }
        if(name == 'DeleteTopBtn'){
            axios.deleted(delRiskIndentify, {data:selectedRowKeys}, true).then(res => {
                this.props.delSuccess();
            }).catch(err => {
            });
        }
    }
    submit = (values, type) => {
        const data = {
          ...values,
          projectId:this.props.projectId,
        };
        axios.post(addRiskIndentify, data, true).then(res => {
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
    selectDate = (val,dataArr)=>{
        this.setState({
            initiateTimeFrom:dataArr[0],
            initiateTimeTo:dataArr[1]
        })
    }
    click() {
        if(this.props.search){
            let data = {
                initiateTimeFrom:this.state.initiateTimeFrom,
                initiateTimeTo:this.state.initiateTimeTo
            }
            this.props.search(data);
        }
    }
    render(){
        const props = this.props
        return(
            <div className={style.main}>
                <div className={style.search}>
                    创建时间：
                    <span style={{width:"200px"}}>
                        <DatePicker.RangePicker
                            placeholder={['开始时间', '结束时间']}
                            format="YYYY-MM-DD"
                            size="small"
                            onChange={this.selectDate}
                        />
                        {/* <Form>
                            <Form.Item label="验收时间" >
                                {this.props.form.getFieldDecorator('searchTime', {
                                })(
                                    <RangePicker
                                        placeholder={['开始年份', '结束年份']}
                                        mode={['year', 'year']}
                                        format="YYYY"
                                        size="small"
                                        onChange={value => this.props.form.setFieldsValue({ searchTime: value })}
                                        onPanelChange={value => this.props.form.setFieldsValue({ searchTime: value })}
                                    />
                                )}
                            </Form.Item>
                        </Form> */}
                    </span>
                    <span onClick={this.click.bind(this)} style={{cursor:'pointer',marginLeft:'5px'}}>搜索</span>
                </div>
                <div className={style.tabMenu}>
                    <SelectProBtn  openPro={this.props.openPro} />
                    <SelectSectionBtn openSection={this.props.openSection} data1={this.props.projectId} />
                    {props.permission.indexOf('RISK_EDIT-RISK-IDENTIFY')!==-1 && ( 
                    <PublicButton name={'新增'} title={'新增'} icon={'icon-add'}
                                    afterCallBack={this.btnClicks.bind(this,'AddTopBtn')}
                                    res={'MENU_EDIT'}
                    />)}
                    {props.permission.indexOf('RISK_EDIT-RISK-IDENTIFY')!==-1 && ( 
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
                sectionId={this.props.sectionId}
                projectId={this.props.projectId}
                handleCancel={this.handleCancel.bind(this)}/>}
            </div>
        )
    }
}
export default TopTags;