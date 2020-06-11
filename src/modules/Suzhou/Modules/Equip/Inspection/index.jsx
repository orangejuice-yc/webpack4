import React, { Component } from 'react';
import { Table } from 'antd';
import notificationFun from '@/utils/notificationTip';
import * as dataUtil from "@/utils/dataUtil";
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import TopTags from './TopTags/index';
import RightTags from '@/components/public/RightTags/index';
import { 
    getsectionId,  // 查询标段树形信息
    queryDeviceCheckList,  // 查询所有数据
    delDeviceCheck, // 删除设备报验数据
    queryDeviceCheckInfo, // 查询单个设备报验基础信息
    getPermission,
    dyDeviceCheck
} from '../../../api/suzhou-api'
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
class EquipInspection extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            projectId: '',
            sectionIds: [],
            section: '',
            rightData: null,
            activeIndex: [],
            selectedRows: [],
            selectedRowKeys: [],
            total: 0,
            pageSize: 10,
            currentPageNum: 1,
            loading: true,
            search: '',
            status: false,
            projectName:'', //项目名称
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
    // 点击获取行信息
    getInfo = (record, index) => {
        const { activeIndex } = this.state;
        const { id } = record;
        this.setState({
            activeIndex: id,
            record: record,
            rightData: record
        });
    }
    // 获取项目ID或标段ID下所有数据列表
    getList = (currentPageNum, pageSize, callBack)=>{
        const { search ,projectId, sectionIds} = this.state
        let ids
        if (Array.isArray(sectionIds)) {
            ids = sectionIds.join()
        } else {
            ids = sectionIds
        }
        axios.get(queryDeviceCheckList(pageSize, currentPageNum), {params: {projectId, sectionIds: ids, title: search}})
            .then(res => {
                callBack(!res.data.data ?[]: res.data.data)
                const {data, total} = res.data
                // if ( data.length === 0 && currentPageNum > 1) {
                //     this.setState({currentPageNum: currentPageNum - 1}, () => {
                //         this.getList(projectId, sectionIds, title)
                //     })
                // }
                this.setState({data, loading: false, total})
            })
            .finally(err => {
                this.setState({loading: false})
            })
    }
    // 生命周期函数
    componentDidMount() {
        let menuCode = 'DEVICE-INSPECTION'
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
                sectionIds:res.sectionId
            })
        })
    }
    // 递归获取Id
    getIds = (dats,idArr) => {
        if(dats){
            dats.forEach((item,index,arr) => {
                idArr.push(item.id);
                this.getIds(item.children,idArr)
            });
        }
    };
    // 新增回调
    addSuccess = (data0)=>{
        // const {data, total, search} = this.state
        // const {creatTime} = data0
        // const ct = moment(creatTime).subtract(1, 'd').format('YYYY-MM-DD')
        // const d = {...data0, creatTime:ct}
        // if (data0.title.indexOf(search) !== -1) {
        //     this.setState({
        //         data: [...data, d],
        //         total: total+1
        //     })
        // }
        // notificationFun('操作提醒', '添加成功', 'success')
        this.table.recoveryPage(1);
        this.table.getData();
    }
     //发布流程回调
     updateFlow = (v)=>{
        const {projectId,sectionId} = this.state;
        this.table.getData();
    }
    // 删除回调
    delSuccess = () =>{
        const {selectedRowKeys,selectedRows, rightData, total, data, projectId, currentPageNum, sectionIds} = this.state
        if (selectedRowKeys.length === 0) {
            notificationFun('操作提醒', '请选择需要删除的项')
            return
        }
        let deleteArray = [];
        selectedRows.forEach((value,item)=>{
            if(value.statusVo.code == 'INIT'){
              deleteArray.push(value.id)
            }else{
                notificationFun('非新建状态数据不能删除','标题'+value.title+"不能删除")
                return false;
            }
        })
        if(deleteArray.length > 0){
            axios.deleted(delDeviceCheck(), {data: deleteArray || []}).then(() => {
                // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
                // if (rightData && deleteArray.some(item => item === rightData.id)) {
                //     this.setState({
                //         rightData: null,
                //         rowClassName: null,
                //     });
                // }
                this.table.getData();
                notificationFun('操作提醒', '删除成功', 'success')
            })
        }
       
    }
    // 搜索
    search = (val) =>{
        this.setState({
            search:val,
            currentPageNum:1
        },()=>{
            this.table.getData()
        });
    }
    // 选择项目
    openPro = (data1, data2, projectName) =>{
        this.setState({
            projectId: data1[0],
            projectName,
            currentPageNum:1
        },()=>{
            this.table.getData();
        })
    }
    // 选择标段
    openSection = (sectionId,section)=>{
        const {projectId} = this.state;
        this.setState({
            sectionIds:sectionId,
            section:section,
            currentPageNum:1
        },()=>{
            this.table.getData();
        })
    }
    // 更新回调
    updateSuccess = (newData) =>{
        this.table.update(this.state.rightData, newData)
        this.setState({
            rightData: { ...this.state.rightData, ...newData },
            data: this.state.data.map(item =>
                item.id === newData.id ? { ...item, ...newData } : item
            ),
        })
        notificationFun('操作提醒', '修改成功', 'success')
    }
    // 点击跟换样式
    // setClassName = (record, index) => {
    //     //判断索引相等时添加行的高亮样式
    //     return record.id == this.state.activeIndex ? 'tableActivty' : "";
    // }
    //审批预览
    viewDetail = (record) => {
       axios.view(dyDeviceCheck+`?id=${record.id}`).then(res=>{})
     }
    render() {
        const { height } = this.props;
        const { data, currentPageNum, pageSize, total, selectedRowKeys, record, selectedRows, loading, section, rightData } = this.state
        // 表格行是否可选配置
        const rowSelection = {
            selectedRowKeys,
            selectedRows,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys,
                    selectedRows
                })
            }
        }
        //分页调用配置
        const pagination = {
            total, currentPageNum, pageSize,
            showSizeChanger: true,
            showQuickJumper: true,
            size: 'small',
            showTotal: total => `总共${total}条`,
            onShowSizeChange: (currentPageNum, size) => {
                this.setState({
                    pageSize: size,
                    currentPageNum: 1,
                }, () => {
                    this.getList(this.state.projectId,this.state.sectionIds)
                })
            },
            onChange: (page, pageSize) => {
                this.setState({
                    pageSize,
                    currentPageNum: page
                }, () => {
                    this.getList(this.state.projectId,this.state.sectionIds)
                })
            }
        }
        const columns = [
            {
                title: "序号",
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: "标题",
                dataIndex: 'title',
                key: 'title',
            },
            // {
            //     title: "项目名称",
            //     dataIndex: 'projectName',
            //     key: 'projectName',
            // },
            {
                title: "报验日期",
                dataIndex: 'checkTime',
                key: 'checkTime',
            },
            {
                title: "标段号",
                dataIndex: 'sectionCode',
                key: 'sectionCode',
            },
            {
                title: "标段名称",
                dataIndex: 'sectionName',
                key: 'sectionName',
            },
            {
                title: "施工单位",
                dataIndex: 'sgdw',
                key: 'sgdw',
            },
            // {
            //     title: "监理单位",
            //     dataIndex: 'jldw',
            //     key: 'jldw',
            // },
            {
                title: "状态",
                dataIndex: 'statusVo.name',
                key: 'statusVo',
            },
            {
                title: "创建人",
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: "创建日期",
                dataIndex: 'creatTime',
                key: 'creatTime',
                render:(text,record)=>{
                    // return <span>{moment(text).format('L')}</span>
                    return <span>{dataUtil.Dates().formatTimeString(text).substr(0,10)}</span>
                }
            }, 
            {
                title: "审批预览",
                width: 80,
                render: (text, record) => {
                  return <a onClick={this.viewDetail.bind(this, record)} style={{ cursor: 'pointer' }}>预览</a>
                }
              }
        ]
        return (
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
            <Toolbar>
                <TopTags 
                    status={this.state.status}
                    record={record}
                    selectedRows={selectedRowKeys}
                    success={this.addSuccess}
                    delSuccess={this.delSuccess}
                    search={this.search}
                    title = {this.state.search}
                    openPro={this.openPro}
                    openSection={this.openSection}
                    data1={this.state.projectId}
                    section={section}
                    sectionId={this.state.sectionIds}
                    projectName={this.state.projectName}
                    updateFlow = {this.updateFlow}
                    bizType={this.props.menuInfo.menuCode}
                    permission={this.state.permission}
                />
                </Toolbar>
                    {/* 左侧主体，展示设备报验图表 */}
                    <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
                            {this.state.projectId && (
                            <PublicTable
                                onRef={this.onRef}
                                pagination={true}
                                getData={this.getList}
                                columns={columns}
                                rowSelection={true}
                                onChangeCheckBox={this.getSelectedRowKeys}
                                useCheckBox={true} 
                                getRowData={this.getInfo}
                                total={this.state.total}
                                pageSize={10}
                                // size="small"
                                // columns={columns}
                                // dataSource={data}
                                // pagination={pagination}     // 分页配置
                                // rowSelection={rowSelection}
                                // rowKey={record => record.id}
                                // rowClassName={this.setClassName}
                                // // loading={loading}
                                // onRow={(record, index) => {
                                //     return {
                                //         onClick: this.getInfo.bind(this, record),
                                //     };
                                // }}
                            />)}
                            </MainContent>
                    {/* 右侧图标列：展示基本信息，设备明细 */}
                        <RightTags
                            menuCode={this.props.menuInfo.menuCode}
                            rightData={rightData}
                            updateSuccess={this.updateSuccess}
                            groupCode={1}
                            record={record}
                            status={this.state.status}
                            sectionIds={this.state.sectionIds}
                            projectId={this.state.projectId}
                            menuId = {this.props.menuInfo.id}
                            bizType={this.props.menuInfo.menuCode}
                            bizId = {this.state.rightData ? this.state.rightData.id : null}
                            fileEditAuth={true}
                            extInfo={{
                                startContent: "设备报验"
                            }}
                            taskFlag ={false}
                            isCheckWf={true}  //流程查看
                            openWorkFlowMenu = {this.props.openWorkFlowMenu}
                            isShow={this.state.permission.indexOf('INSPECTION_FILE-DEVICEDETAIL')==-1?false:true} //文件权限
                            permission={this.state.permission}
                        />
                    </ExtLayout>
        )
    }
}

  
export default EquipInspection