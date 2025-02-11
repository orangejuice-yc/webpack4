import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {queryRcReport,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
            projectId:'', //项目id
            sectionId:'', //标段id
            projectName:'', //项目名称
            data:[], 
            activeIndex:null, 
            status:'',//状态
            xfSjStart:'',//时间
            xfSjEnd:'',//时间
            viewType:0,//部门传0
            permission:[]
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
    getList= (currentPageNum, pageSize, callBack) =>{
        const {projectId,sectionId,status,xfSjStart,xfSjEnd,viewType} = this.state;
        axios.get(queryRcReport(pageSize,currentPageNum),{params:{viewType,status,xfSjStart,xfSjEnd}}).then(res=>{
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
        let menuCode = 'SECURITY-DAYREPORTIN'
            axios.get(getPermission(menuCode)).then((res)=>{
            let permission = []
            res.data.data.map((item,index)=>{
                permission.push(item.code)
            })
            this.setState({
                permission
            })
        })
        // firstLoad().then(res=>{
        //     this.setState({
        //         projectId:res.projectId,
        //         projectName:res.projectName,
        //         sectionId:res.sectionId
        //     })
        // })
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
        this.state.projectId?this.table.recoveryPage(1):'';
        this.setState({
            status:!val.status?'':val.status,
            xfSjStart:!val.xfSjStart?'':val.xfSjStart,
            xfSjEnd:!val.xfSjEnd?'':val.xfSjEnd,
        },()=>{
            this.table.getData();
        })
    }
    //设置table的选中行class样式
    setClassName = (record, index) => {
        return record.id === this.state.activeIndex ? 'tableActivty' : '';
    };
    render(){
        return(
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags
                        projectName = {this.state.projectName}
                        record={this.state.record}
                        selectedRows={this.state.selectedRows}
                        selectedRowKeys = {this.state.selectedRowKeys}
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        updateFlow = {this.updateFlow}
                        search={this.search}
                        searcher={this.state.searcher}
                        status = {this.state.status}
                        companyId = {this.state.companyId}
                        year = {this.state.year}
                        month = {this.state.month}
                        viewType = {this.state.viewType}
                        openPro={this.openPro}
                        openSection={this.openSection}
                        projectId={''}
                        updateSuccess={this.updateSuccess}
                        menuCode = {this.props.menuInfo.menuCode}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent>
                    
                        <PublicTable onRef={this.onRef}
                            pagination={true}
                            getData={this.getList}
                            columns={columns}
                            rowSelection={true}
                            onChangeCheckBox={this.getSelectedRowKeys}
                            useCheckBox={true} 
                            getRowData={this.getInfo}
                            total={this.state.total}
                            pageSize={10}
                            />
                </MainContent>
                <RightTags
                        fileRelease={true}
                        rightData={this.state.rightData}
                        updateSuccess={this.updateSuccess}
                        projectId ={''}
                        groupCode={this.state.groupCode}
                        viewType = {this.state.viewType}
                        menuCode = {this.props.menuInfo.menuCode}
                        menuId = {this.props.menuInfo.id}
                        bizType={this.props.menuInfo.menuCode}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        extInfo={{startContent: "安全管理-风险登记"}}
                        openWorkFlowMenu = {this.props.openWorkFlowMenu}
                        isShow={this.state.permission.indexOf('DAYREPORTIN_RC-REPORT-IN-FILES-I')==-1?false:true} //文件权限
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

    const columns = [
        {
            title: '编号',
            dataIndex: 'code',
            key:"code",
            width:'230px'
        },
        {
            title: '工作事项',
            dataIndex: 'title',
            key: 'title',
            width:'200px'
        },
        {
            title: '状态',
            dataIndex: 'statusVo.name',
            key: 'statusVo.name',
        },
        {
            title: '下发时间',
            dataIndex: 'xfSj',
            key: 'xfSj',
        },
        {
            title: '上报周期',
            dataIndex: 'typeVo',
            key: 'typeVo',
            render:(text,record)=>{
                if(text.code == 'D'){
                    return <span>{text.name}</span>
                }else{
                    return <span>{text.name+'-'+record.rate}</span>
                }
                
            }
        },
        {
            title: '责任单位',
            dataIndex: 'zrDwInfo',
            key: 'zrDwInfo',
            render:(text,record)=>{
                const arr = [];
                text.map((item)=>{
                    return arr.push(item.name)
                })
                return arr.join();
            }
        },
        {
            title: '责任岗位',
            dataIndex: 'zrRoleInfo',
            key: 'zrRoleInfo',
            render:(text,record)=>{
                const arr = [];
                text.map((item)=>{
                    return arr.push(item.name)
                })
                return arr.join();
            }
        },
    ];