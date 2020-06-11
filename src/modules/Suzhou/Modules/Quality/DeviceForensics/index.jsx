import React, { Component } from 'react';
import { Table } from 'antd';
import notificationFun from '@/utils/notificationTip';
import * as dataUtil from "@/utils/dataUtil";
import moment from 'moment';
import style from './style.less';
import axios from '@/api/axios';
import TopTags from './TopTags/index';
import RightTags from '@/components/public/RightTags/index';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import PublicTable from '@/components/PublicTable';
import { queryParams } from '@/modules/Suzhou/components/Util/util';
import { 
    getsectionId,  // 查询标段树形信息
    queryDeviceForensicsList,  // 查询所有数据
    deleteDeviceForensics, // 删除设备报验数据
    queryDeviceForensicsById, // 查询单个设备报验基础信息
    getPermission
} from '../../../api/suzhou-api'
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";
class DeviceForensics extends Component {
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
            // status: false,
            projectName:'', //项目名称
            fileStatus:'',
            status:'',
            searcher:'',
            permission:[]
        }
    }
    // 点击获取行信息
    // getInfo = (record, index) => {
    //     const { activeIndex } = this.state;
    //     const { id } = record;
    //     this.setState({
    //         activeIndex: id,
    //         record: record,
    //         rightData: record
    //     });
    // }
     // 搜索
     handleSearch = value => {
        if (this.state.projectId) {
            this.setState({
            fileStatus:value.fileStatus,
            status:value.status,
            searcher:value.searcher
        },() => this.table.getData())
        } else {
          notificationTip('请选择项目');
        }
      };
    //获取项目ID或标段ID下所有数据列表
    getList= (currentPageNum, pageSize, callBack) =>{
        const { search ,projectId, sectionIds,fileStatus,status,searcher} = this.state
        let ids
        if (Array.isArray(sectionIds)) {
            ids = sectionIds.join()
        } else {
            ids = sectionIds
        }
        const params={
             projectId,
             sectionIds: ids, 
             status,
             fileStatus,
             searcher
        }
        axios.get(queryDeviceForensicsList(pageSize, currentPageNum),{params})
            .then(res => {
                callBack(res.data.data ? res.data.data : [])
                const {data, total} = res.data.data ? res.data.data : []
                if ( res.data.length === 0 && currentPageNum > 1) {
                    this.setState({currentPageNum: currentPageNum - 1}, () => {
                        this.getList({params})
                    })
                }
                this.setState({data, loading: false, total})
            })
            .finally(err => {
                this.setState({loading: false})
            })
    }
    // 生命周期函数
    componentDidMount() {
        let menuCode = 'QUALITY-DEVICEFORENSICS'
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
            }
            // ,()=>{
            //     this.getList(res.projectId,res.sectionId)
            // }
            )
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
    // // 新增回调
    // addSuccess = (data0)=>{
    //     const {data, total, search} = this.state
    //     const {creatTime} = data0
    //     const ct = moment(creatTime).subtract(1, 'd').format('YYYY-MM-DD')
    //     const d = {...data0, creatTime:ct}
    //     if (data0.deviceName.indexOf(search) !== -1) {
    //         this.setState({
    //             data: [...data],
    //             total: total+1
    //         })
    //     }
    //     notificationFun('操作提醒', '添加成功', 'success')
    //     this.setState({
    //         // currentPageNum:1,
    //     },()=>{
    //         this.getList(this.state.projectId,this.state.sectionIds)
    //     })
    // }
    //  //发布流程回调
    //  updateFlow = (v)=>{
    //     const {projectId,sectionId} = this.state;
    //     this.getList(projectId,sectionId);
    // }
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
                notificationFun('非新建状态数据不能删除','设备'+ ' ' + value.deviceName + ' ' +"不能删除")
                return false;
            }
        })
        if(deleteArray.length > 0){
            axios.deleted(deleteDeviceForensics(), {data: deleteArray || []}).then(() => {
                // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
                if (rightData && deleteArray.some(item => item === rightData.id)) {
                    this.setState({
                        rightData: null,
                        rowClassName: null,
                    });
                }
                this.getList(projectId,sectionIds);
                notificationFun('操作提醒', '删除成功', 'success')
                // this.setState({
                //     total: total - deleteArray.length,
                //     data: data.filter(item => !deleteArray.includes(item.id)),
                //     selectedRowKeys: [],
                //     selectedRows: [],
                // }, () => {
                //     const {data} = this.state
                //     if (currentPageNum > 1 && data.length === 0) {
                //         this.setState({
                //             currentPageNum: currentPageNum - 1, 
                //             loading: true,
                //         }, () => {
                //             this.getList(projectId, sectionIds)
                //         })
                //     }
                //     notificationFun('操作提醒', '删除成功', 'success')
                // });
            })
        }
        this.table.getData();
    }
   
    // // 选择项目
    // openPro = (data1, data2, projectName) =>{
    //     this.setState({
    //         projectId: data1[0],
    //         projectName
    //     })
    //     this.getList(data1[0],'');
    // }
    // // 选择标段
    // openSection = (sectionId,section)=>{
    //     const {projectId} = this.state;
    //     this.setState({
    //         sectionIds:sectionId,
    //         section:section
    //     })
    //     this.getList(projectId,sectionId);
    // }
    // // 更新回调
    // updateSuccess = (newData) =>{
    //     this.setState({
    //         rightData: { ...this.state.rightData, ...newData },
    //         data: this.state.data.map(item =>
    //             item.id === newData.id ? { ...item, ...newData } : item
    //         ),
    //     })
    //     notificationFun('操作提醒', '修改成功', 'success')
    // }
    // 点击跟换样式
    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id == this.state.activeIndex ? 'tableActivty' : "";
    }
    ///// -----------------
    onRef = (ref) => {
        this.table = ref
    }
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
        // //选择项目
        // openPro=(projectId,project,projectName)=>{
        //     !this.state.projectId?'':this.table.recoveryPage(1);
        //     this.setState({
        //         projectId:projectId[0],
        //         projectName,
        //         sectionIds:''
        //     },()=>{
        //         this.table.getData();
        //     })
        // }
        //增加回调
        addSuccess=(val)=>{
            this.table.recoveryPage(1);
            this.table.getData();
        }
        //更新回调
        updateSuccess=(val)=>{
            this.table.update(this.state.rightData, val);
            this.table.getData()
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
                sectionIds:''
            },()=>{
                this.table.getData();
            })
        }
        //打开标段
        openSection = (sectionId,section)=>{
            this.table.recoveryPage(1);
            const {projectId} = this.state;
            this.setState({
                sectionIds:sectionId.join(','),
                section:section
            },()=>{
                this.table.getData();
            })
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
        return (
        <ExtLayout renderWidth={({ contentWidth }) => {this.setState({ contentWidth });}}>
           <Toolbar>
                <TopTags 
                    status={this.state.status}
                    record={record}
                    selectedRows={selectedRowKeys}
                    success={this.addSuccess}
                    delSuccess={this.delSuccess}
                    search={this.search}
                    handleSearch={this.handleSearch}
                    deviceName = {this.state.search}
                    openPro={this.openPro}
                    openSection={this.openSection}
                    data1={this.state.projectId}
                    section={section}
                    sectionId={this.state.sectionIds}
                    projectName={this.state.projectName}
                    updateFlow = {this.updateFlow}
                    bizType={this.props.menuInfo.menuCode}

                    updateSuccess={this.updateSuccess}
                    permission={this.state.permission}
                />
                </Toolbar>
                {/* <div className={style.main}> */}
                <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1100}>
                    {/* 左侧主体，展示特种设备验收取证图表 */}
                    {/* <div className={style.leftMain} style={{ height }}> */}
                        {/* <div style={{ minWidth: 'calc(100vw - 60px)' }}> */}
                        {this.state.projectId &&  (<PublicTable
                                // size="small"
                                // columns={columns}
                                // dataSource={data}
                                // pagination={pagination}     // 分页配置
                                // rowSelection={rowSelection}
                                // rowKey={record => record.id}
                                // rowClassName={this.setClassName}
                                // loading={loading}
                                // onRow={(record, index) => {
                                //     return {
                                //         onClick: this.getInfo.bind(this, record),
                                //     };
                                // }}
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
                            />
                            )}
                        {/* </div> */}
                    {/* </div> */}
                    </MainContent>
                    {/* 右侧图标列：展示基本信息，设备明细 */}
                    {/* <div className={style.rightBox} style={{ height }}> */}
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
                                startContent: "特种设备验收取证"
                            }}
                            openWorkFlowMenu = {this.props.openWorkFlowMenu}
                            isShow={this.state.permission.indexOf('DEVICEFORENSICS_FILE-SPEDEVACCPET')==-1?false:true} //文件权限
                            permission={this.state.permission}
                            taskFlag = {false}
                            isCheckWf={true}  //流程查看
                        />
                    {/* </div> */}
                {/* </div> */}
            </ExtLayout>
        )
    }
}

const columns = [
    {
        title: "序号",
        render: (text, record, index) => `${index + 1}`
    },
    // {
    //     title: "项目名称",
    //     dataIndex: 'projectName',
    //     key: 'projectName',
    // },
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
        title: "取证日期",
        dataIndex: 'checkTime',
        key: 'checkTime',
    },
    {
        title: "设备编码",
        dataIndex: 'deviceCode',
        key: 'deviceCode',
    },
    {
        title: "设备名称",
        dataIndex: 'deviceName',
        key: 'deviceName',
    },
    
    {
        title: "设备数量",
        dataIndex: 'deviceNum',
        key: 'deviceNum',
    },
    {
        title: "位置",
        dataIndex: 'location',
        key: 'location',
    },
    {
        title: "是否交付",
        dataIndex: 'isPayVo.name',
        key: 'isPayVo',
    },
    {
        title: "是否验收",
        dataIndex: 'isForensicsVo.name',
        key: 'isForensicsVo',
    }, 
    {
        title: "原因",
        dataIndex: 'reason',
        key: 'reason',
    },
    // {
    //     title: "施工单位",
    //     dataIndex: 'sgdw',
    //     key: 'sgdw',
    // },
    // {
    //     title: "监理单位",
    //     dataIndex: 'jldw',
    //     key: 'jldw',
    // },
     
    {
        title: "附件状态",
        dataIndex: 'fileStatusVo.name',
        key: 'fileStatusVo',
    },
    {
        title: "状态",
        dataIndex: 'statusVo.name',
        key: 'statusVo',
    },
    {
        title: "创建人",
        dataIndex: 'creater',
        key: 'creater',
    },
    {
        title: "创建日期",
        dataIndex: 'createTime',
        key: 'createTime',        
    },
    // {
    //     title: "发起人",
    //     dataIndex: 'initiator',
    //     key: 'initiator',
    // },
    // {
    //     title: "发起时间",
    //     dataIndex: 'initTime',
    //     key: 'initTime',        
    // },

]
  
export default DeviceForensics