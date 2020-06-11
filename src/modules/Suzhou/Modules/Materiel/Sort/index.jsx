import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '@/store/localeProvider/action'
import RightTags from '@/components/public/RightTags/index'
import * as util from '@/utils/util';
import * as dataUtil from '@/utils/dataUtil';
import {classificationList,getSpecialWorkerList,getsectionId,getPermission} from '@/modules/Suzhou/api/suzhou-api';
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
import {isChina,columnsCommon,columnsCreat,permissionFun} from "@/modules/Suzhou/components/Util/util.js";

class Sort extends Component {
    constructor(props){
        super(props);
        this.state = {
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
            selectSource:'' ,//来源select
            source:'', //来源
            searcher:'', //搜索
            selectStatus:'', //状态select
            status:'', //状态
            firstSection:"", //导入默认第一个标段
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
        const {projectId,source,searcher,sectionId,status} = this.state;
        axios.get(classificationList(pageSize,currentPageNum),{params: {projectId,sectionIds:sectionId,source,searcher,status}}).then(res=>{
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
    getSectionId = ()=>{
        axios.get(getsectionId(this.state.projectId)).then(res=>{
            if(res.data.data.length>0){
                this.setState({
                    firstSection:res.data.data[0].id,
                  })
            }
        })
    }
    componentDidMount(){
        // let menuCode = 'MATERIEL-SORT'
        //     axios.get(getPermission(menuCode)).then((res)=>{
        //     let permission = []
        //     res.data.data.map((item,index)=>{
        //         permission.push(item.code)
        //     })
        //     this.setState({
        //         permission
        //     })
        // })
        permissionFun(this.props.menuInfo.menuCode).then(res=>{
            this.setState({
                permission:!res.permission?[]:res.permission
            })
          });
        firstLoad().then(res=>{
            this.setState({
                projectId:res.projectId,
                projectName:res.projectName,
                sectionId:res.sectionId
            },()=>{
                this.getSectionId();
            })
        })
    }
    //增加回调
    addSuccess=(val)=>{
        this.table.recoveryPage(1)
        this.table.getData();
    }
    //流程审批回调
    updateFlow = ()=>{
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
    //导入更新
    updateImportFile = ()=>{
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
            this.getSectionId();
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
     //状态
     selectStatue = (val)=>{
        this.setState({
            selectStatus:!val?'':val
        })
    }
    //选择涞源
    selectSource = (val)=>{
        this.setState({
            selectSource:!val?'':val
        })
    }
    //搜索
    search =(val)=>{
        this.state.projectId?this.table.recoveryPage(1):'';
        const {selectSource,selectStatus} =  this.state;
        this.setState({
            searcher:val,
            source:selectSource,
            status:selectStatus
        },()=>{
            if(!this.state.projectId){
                notificationFun('警告','请选择项目')
            }else{
                this.table.getData();
            }
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
                        success={this.addSuccess}
                        delSuccess={this.delSuccess}
                        search={this.search}
                        openPro={this.openPro}
                        openSection={this.openSection}
                        projectId={this.state.projectId}
                        sectionId = {this.state.sectionId}
                        selectSource = {this.selectSource}
                        selectStatue = {this.selectStatue}
                        searcher = {this.state.search}
                        updateFlow = {this.updateFlow}
                        bizType={this.props.menuInfo.menuCode}
                        firstSection = {this.state.firstSection}
                        updateImportFile={this.updateImportFile}
                        permission={this.state.permission}
                    />
                </Toolbar>
                <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
                    {this.state.projectId && (
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
                    )}
                    {/* <Table
                        size="small"
                        pagination={pagination}
                        columns={columns}
                        rowKey={record => record.id}
                        name={this.props.name}
                        loading={loading}
                        dataSource={data}
                        rowSelection={rowSelection}
                        rowClassName={this.setClassName}
                        onRow={(record, index) => {
                        return {
                            onClick: (event) => {
                                this.getInfo(record, event);
                            },
                            };
                        }
                        }
                    /> */}
                </MainContent>
                <RightTags
                        rightData={this.state.rightData}
                        updateSuccess={this.updateSuccess}
                        projectId ={this.state.projectId}
                        groupCode={1}
                        menuCode = {this.props.menuInfo.menuCode}
                        menuId = {this.props.menuInfo.id}
                        bizType={this.props.menuInfo.menuCode}
                        bizId = {this.state.rightData ? this.state.rightData.id : null}
                        fileEditAuth={true}
                        extInfo={{startContent: "物料分类"}}
                        taskFlag = {false}
                        isCheckWf={true}  //流程查看
                        openWorkFlowMenu = {this.props.openWorkFlowMenu}
                        isShow={this.state.permission.indexOf('SORT_FILE-MATERIEL-SORT')==-1?false:true} //文件权限
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
        ...columnsCommon,
        {
            title: '物料编码',
            dataIndex: 'materialCode',
            key: 'materialCode',
            width:'10%'
        },
        {
            title: '物料名称',
            dataIndex: 'materialName',
            key: 'materialName',
            width:'10%'
        },
        {
            title: '来源',
            dataIndex: 'source',
            key: 'source',
            width:'5%'
        },
        {
            title: '规格型号',
            dataIndex: 'specification',
            key: 'specification',
            width:'10%'
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            key: 'unit',
            width:'6%'
        },
        {
            title: '设计数量',
            dataIndex: 'contractAmount',
            key: 'contractAmount',
            width:'6%'
        },
        {
            title: '供货商',
            dataIndex: 'supplier',
            key: 'supplier',
            width:'9%'
        },
        {
            title: '品牌',
            dataIndex: 'brand',
            key: 'brand',
            width:'10%'
        },
        {
            title: '需第三方检测',
            dataIndex: 'needThirdInspectionVo.name',
            key: 'needThirdInspectionVo.name',
            width:'9%'
        },
        {
            title: '状态',
            dataIndex: 'statusVo.name',
            key: 'statusVo.name',
            width:'5%'
        },
    ];