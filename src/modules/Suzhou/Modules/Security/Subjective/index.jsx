import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {selectSubjectTemplate,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
            data:[], 
            activeIndex:null, 
            status:'',//状态
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
    getList= (callBack) =>{
        axios.get(selectSubjectTemplate).then(res=>{
            callBack(res.data.data ? res.data.data : [])
            let data = res.data.data;
            this.setState({
                data,
                rightData: null,
                selectedRowKeys: [],
            })
        })
    }
    componentDidMount(){
        let menuCode = 'SECURITY-SUBJECTIVE'
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
        this.setState({record:val,rightData:val})
        this.table.update(this.state.rightData, val)
    }
    //更新流程
    updateFlow = ()=>{
        this.table.getData(); 
    }
    //设置table的选中行class样式
    setClassName = (record, index) => {
        return record.id === this.state.activeIndex ? 'tableActivty' : '';
    };
    render(){
        const columns = [
            {
                title: '分组名称',
                dataIndex: 'groupTitle',
                key:'groupTitle',
            },
            {
                title: '业务模块',
                dataIndex: 'moduleTitle',
                key:'moduleTitle',
            },
            {
                title: '评分人员',
                dataIndex: 'rolesVo',
                key:'rolesVo',
                render:(text,record)=>{
                    const arr = [];
                    text.map((item)=>{
                        return arr.push(item.name)
                    })
                    return arr.join();
                }
            },
        ];
        return(
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags
                        projectName = {this.state.projectName}
                        record={this.state.record}
                        selectedRows={this.state.selectedRows}
                        selectedRowKeys={this.state.selectedRowKeys}
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        updateFlow = {this.updateFlow}
                        updateSuccess={this.updateSuccess}
                        bizType={this.props.menuInfo.menuCode}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent>
                    <PublicTable onRef={this.onRef}
                            pagination={false}
                            getData={this.getList}
                            columns={columns}
                            rowSelection={true}
                            onChangeCheckBox={this.getSelectedRowKeys}
                            useCheckBox={true} 
                            getRowData={this.getInfo}
                            />
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
                        isShow={this.state.permission.indexOf('SPECIALPLAN_FILE-SPECIALPLAN')==-1?false:true} //文件权限
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

    