import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {getSysScores,getPermission,dyDangerPlanWord} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import MyIcon from "@/components/public/TopTags/MyIcon";
import TopTags from './TopTags/index';
import notificationFun from '@/utils/notificationTip';
// 布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";

class Sort extends Component {
    constructor(props){
        super(props);
        this.state = {
            groupCode:1,
            selectedRowKeys:[],
            pageSize:10,
            currentPageNum:1,
            total:'',
            selectedRows:[],
            sectionId:'', //标段id
            projectName:'', //项目名称
            data:[], 
            activeIndex:null, 
            permission:[],
            year:'',
            month:''
        }
    }
    /**
    * 父组件即可调用子组件方法
    * @method
    * @description 获取用户列表、或者根据搜索值获取用户列表
    * @param {string} record  行数据
    * @return {array} 返回选中用户列表
    */
    onRef = (ref) => {
        this.table = ref
    }
    /**
     * 获取复选框 选中项、选中行数据
     * @method updateSuccess
     * @param {string} selectedRowKeys 复选框选中项
     * @param {string} selectedRows  行数据
     */
    getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRows,
            selectedRowKeys
        })
    }
    getInfo = (record)=>{
        const { activeIndex } = this.state;
        const { id } = record;
        this.setState({
            activeIndex: id,
            record: record,
            rightData: record
        });
    }
    getList= (currentPageNum, pageSize,callBack) =>{
        const {projectId,sectionId,year,month} = this.state;
        axios.get(getSysScores(pageSize,currentPageNum),{params:{projectId,sectionIds:sectionId,year,month}}).then(res=>{
            callBack(res.data.data ? res.data.data : [])
            let data = res.data.data;
            this.setState({
                data,
                total: res.data.total,
                rightData: null,
                selectedRowKeys: [],
            })
        })
    }
    componentDidMount(){
        let menuCode = 'SECURITY-SCORE'
            axios.get(getPermission(menuCode)).then((res)=>{
            let permission = []
            res.data.data.map((item,index)=>{
                permission.push(item.code)
            })
            this.setState({
                permission
            })
        })
        firstLoad().then(res=>{
            this.setState({
                projectId:res.projectId,
                projectName:res.projectName,
                sectionId:res.sectionId
            })
        })
        // var dayTime = new Date();
        // dayTime.setTime(dayTime.getTime());
        // var year = dayTime.getFullYear()
        // var month = ((dayTime.getMonth()+1)+'').length==1?('0'+(dayTime.getMonth()+1)):(dayTime.getMonth()+1);
        // var date = dayTime.getFullYear()+"-" +month + "-" + '24';
        // if(dayTime<new Date(date)){
        //     if(dayTime.getMonth() == 0){
        //         this.setState({
        //             year:year-1,
        //             month:12
        //         })
        //     }else{
        //         this.setState({
        //             year,month
        //         })
        //     }
        // }else{
        //     this.setState({
        //         year,month
        //     })
        // }
    }
    //增加回调
    addSuccess=(val)=>{
        this.table.recoveryPage(1);
        this.table.getData();
    }
    //删除回调
    delSuccess = (del)=>{
        this.table.getData();
    }
    //更新回调
    updateSuccess=(val)=>{
        this.table.update(this.state.rightData, val)
    }
    //更新流程
    updateFlow = ()=>{
        this.table.getData(); 
    }
    //打开项目
    openPro=(projectId,project,projectName)=>{
        !this.state.projectId?'':this.table.recoveryPage(1);
        this.setState({
            projectId:projectId[0],
            projectName,
            sectionId:''
        },()=>{
            this.table.getData();
        })
    }
    //打开标段
    openSection = (sectionId,section)=>{
        this.table.recoveryPage(1);
        const {projectId} = this.state;
        this.setState({
            sectionId:sectionId.join(','),
            section:section
        },()=>{
            this.table.getData();
        })
    }
    //搜索
    search =(val)=>{
        this.table.recoveryPage(1)
        this.setState({
            year:val.split('-')[0],
            month:val.split('-')[1]
        },()=>{
            this.table.getData();
        })
    }
    //设置table的选中行class样式
    setClassName = (record, index) => {
        return record.id === this.state.activeIndex ? 'tableActivty' : '';
    };
      //点击显示查看
      viewDetail = (record) => {
        axios.view(dyDangerPlanWord+`?id=${record.id}`).then(res=>{})
      }
    render(){
        const columns = [
            {
                title: '标段号',
                dataIndex: 'sectionCode',
                key:'sectionCode',
                width:'10%'
            },
            {
                title: '标段名称',
                dataIndex: 'sectionName',
                key:'sectionName',
                width:'20%'
            },
            {
                title: '施工单位',
                dataIndex: 'sgdw',
                key:'sgdw',
                width:'20%'
            },
            {
                title: '考核周期',
                dataIndex: 'year',
                key:'year',
                render:(text,record)=>{
                    return(
                        text+'-'+record.month
                    )
                },
                width:'10%'
            },
            {
                title: '客观项得分（70%)',
                dataIndex: 'objectiveScore',
                key:'objectiveScore',
                width:'12%'
            },
            {
                title: '主观项得分(30%）',
                dataIndex: 'subjectiveScore',
                key:'subjectiveScore',
                width:'12%'
            },
            {
                title: '综合得分',
                dataIndex: 'totalScore',
                key:'totalScore',
                render:(text,render)=>{
                    return(
                        <span style={{color:text<80?('red'):null}}>{text}</span>
                    )
                },
                width:'8%'
            },
            {
                title: '状态',
                dataIndex: 'statusVo.name',
                key:'statusVo.name',
                width:'8%'
            },
        ];
        return(
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags
                        projectName = {this.state.projectName}
                        projectId={this.state.projectId}
                        record={this.state.record}
                        selectedRows={this.state.selectedRows}
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        updateFlow = {this.updateFlow}
                        openPro={this.openPro}
                        openSection={this.openSection}
                        sectionId = {this.state.sectionId}
                        updateSuccess={this.updateSuccess}
                        bizType={this.props.menuInfo.menuCode}
                        permission={this.state.permission}
                        year = {this.state.year}
                        month={this.state.month}
                        search={this.search}
                    />
                </Toolbar>
                <MainContent>
                    {this.state.projectId && (
                        <PublicTable onRef={this.onRef}
                            pagination={true}
                            getData={this.getList}
                            columns={columns}
                            rowSelection={true}
                            onChangeCheckBox={this.getSelectedRowKeys}
                            useCheckBox={true} 
                            getRowData={this.getInfo}
                            pageSize={10}
                            height={this.props.height}
                            total={this.state.total}
                            />
                    )}
                </MainContent>
                <RightTags
                        rightData={this.state.rightData}
                        updateSuccess={this.updateSuccess}
                        groupCode={this.state.groupCode}
                        menuCode = {this.props.menuInfo.menuCode}
                        menuId = {this.props.menuInfo.id}
                        bizType={this.props.menuInfo.menuCode}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        extInfo={{startContent: "安全管理-信息化考核"}}
                        openWorkFlowMenu = {this.props.openWorkFlowMenu}
                        taskFlag = {false}
                        isCheckWf={true}  //流程查看
                        // isShow={this.state.permission.indexOf('SPECIALPLAN_FILE-SPECIALPLAN')==-1?false:true} //文件权限
                        permission={this.state.permission}
                    />
            </ExtLayout>
        )
    }
}
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {
        changeLocaleProvider
    })(Sort);

    