import React, { Component } from 'react'
import { Table } from 'antd';
import notificationFun from '@/utils/notificationTip';
import style from './style.less';
import axios from '@/api/axios';
import TopTags from './TopTags/index';
import * as dataUtil from "@/utils/dataUtil";
import RightTags from '@/components/public/RightTags/index';
import {getsectionId, queryDeviceRecordList, delDeviceRecord, queryDeviceRecordInfo,getPermission} from '../../../api/suzhou-api'
import {firstLoad} from "@/modules/Suzhou/components/Util/firstLoad";
//布局
import ExtLayout from "@/components/public/Layout/ExtLayout";
import MainContent from "@/components/public/Layout/MainContent";
import Toolbar from "@/components/public/Layout/Toolbar";
import PublicTable from '@/components/PublicTable'
const columns = [
    {
        title: "序号",
        render: (text, record, index) => `${index + 1}`
    },
    {
        title: '设备编码',
        dataIndex: 'deviceCode',
        key: 'deviceCode',
    },
    {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName',
    },
    {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
    },
    {
        title: '标段名称',
        dataIndex: 'sectionName',
        key: 'sectionName',
    },
    {
        title: '规格型号',
        key: 'deviceType',
        dataIndex: 'deviceType',
    },
    {
        title: '数量',
        dataIndex: 'deviceNum',
        key: 'deviceNum',
    },
    {
        title: '计量单位',
        dataIndex: 'measurement',
        key: 'measurement',
    },
    {
        title: '额定容量',
        dataIndex: 'constantCapacity',
        key: 'constantCapacity',
    },
    {
        title: '额定电压',
        dataIndex: 'constantVoltage',
        key: 'constantVoltage',
    },
    {
        title: '生产商',
        dataIndex: 'deviceProducer',
        key: 'deviceProducer',
    },
    {
        title: '设备生产日期',
        dataIndex: 'deviceBirthday',
        key: 'deviceBirthday',
        render:(text,record)=>{
            return <span>{dataUtil.Dates().formatTimeString(text).substr(0,10)}</span>
        }
    },
    {
        title: '设备有效期',
        dataIndex: 'deviceValidity',
        key: 'deviceValidity',
        render:(text,record)=>{
            return <span>{dataUtil.Dates().formatTimeString(text).substr(0,10)}</span>
        }

    },
    {
        title: '设备年检时间',
        dataIndex: 'deviceCheckYear',
        key: 'deviceCheckYear',
        render:(text,record)=>{
            return <span>{dataUtil.Dates().formatTimeString(text).substr(0,10)}</span>
        }
    },
]
class EquitHoist extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            projectId: '',
            sectionIds:'',
            section: '',
            rightData: null,
            activeIndex: [],
            selectedRows: [],
            selectedRowKeys: [],
            total: 0,
            pageSize: 10, 
            currentPageNum: 1,
            loading: true,
            status: '1',
            // code: false,
            search: '',
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
    // 生命周期函数
    componentDidMount() {
        let menuCode = 'DEVICE-LEDGER'
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
    // 获取行信息
    getInfo = record => {
        const { id } = record
        const { activeIndex } = this.state;
        this.setState({
            activeIndex: id,
            record: record,
            rightData: record
        });
        // axios.get(queryDeviceRecordInfo(id)).then(res => {
        //     const {data} = res.data
        //     this.setState({
        //         activeIndex: data.id,
        //         record: data,
        //         rightData: data
        //     })
        // })
    }
    // 点击跟换样式
    // setClassName = (record, index) => {
    //     //判断索引相等时添加行的高亮样式
    //     return record.id == this.state.activeIndex ? 'tableActivty' : "";
    // }
    // 获取项目ID或标段ID下所有数据列表
    getList = (currentPageNum, pageSize, callBack)=>{
        const { projectId, sectionIds, status, search } = this.state
        let ids
        if (Array.isArray(sectionIds)) {
            ids = sectionIds.join()
        } else {
            ids = sectionIds
        }
        axios.get(queryDeviceRecordList(pageSize, currentPageNum, 'record'), {params: {projectId, sectionIds: ids, status, searcher: search}})
        .then(res => {
            if (res.data.status === 200) {
                callBack(!res.data.data ?[]: res.data.data)
                const {data, total} = res.data
                // if ( data.length === 0 && currentPageNum > 1) {
                //     this.setState({currentPageNum: currentPageNum - 1}, () => {
                //         this.getList(projectId, sectionIds, title)
                //     })
                // }
                this.setState({data, loading: false, total})
            } else {
                this.setState({loading: false})
            }
        })
        .finally(() => {
            this.setState({loading: false})
        })
    }
    // 选择项目
    openPro = (data1, data2,projectName) =>{
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
    // 搜索回调
    search = (val) => {
        this.setState({
            search:val,
            currentPageNum:1
        },()=>{
            this.table.getData()
        });
    }
    // 删除回调
    delSuccess = () => {
        const {selectedRowKeys, projectId, sectionIds, rightData, total, data, currentPageNum} = this.state
        if (selectedRowKeys.length === 0) {
            notificationFun('操作提醒', '请选择需要删除的项')
            return
        }
        axios
            .deleted(delDeviceRecord('record'), {data: selectedRowKeys || []})
            .then((res) => {
                // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
                // if (rightData && selectedRowKeys.some(item => item === rightData.id)) {
                //     this.setState({
                //         rightData: null,
                //         rowClassName: null,
                //     });
                // }
                this.setState({
                    total: total - selectedRowKeys.length,
                    data: data.filter(item => !selectedRowKeys.includes(item.id)),
                    selectedRowKeys: [],
                    selectedRows: [],
                }, () => {
                    this.table.getData()
                    // const {data} = this.state
                    // if (currentPageNum > 1 && data.length === 0) {
                    //     this.setState({
                    //         currentPageNum: currentPageNum - 1, 
                    //         loading: true,
                    //     }, () => {
                    //         this.getList(projectId, sectionIds)
                    //     })
                    // }
                    notificationFun('操作提醒', '删除成功', 'success')
                });
            })
    }
    render() {
        const { height } = this.props
        const { data, selectedRowKeys, selectedRows, loading, total, 
            currentPageNum, pageSize, projectId, sectionIds} = this.state
        // 表格行是否可选配置
        const rowSelection = {
            selectedRowKeys, selectedRows,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ selectedRowKeys, selectedRows })
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
                    this.getList( projectId, sectionIds)
                })
            },
            onChange: (page, pageSize) => {
                this.setState({
                    pageSize,
                    currentPageNum: page
                }, () => {
                    this.getList( projectId, sectionIds)
                })
            }
        }
        return (
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
            <Toolbar>
                <TopTags 
                    projectName = {this.state.projectName}
                    search={this.search}
                    delSuccess={this.delSuccess}
                    openPro={this.openPro}
                    openSection={this.openSection}
                    data1={projectId}
                    selectedRows={selectedRowKeys}
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
                                // rowSelection={rowSelection}
                                // rowKey={record => record.id}
                                // pagination={pagination}
                                // // loading={loading}
                                // rowClassName={this.setClassName}
                                // onRow={record => {
                                //     return {
                                //         onClick: this.getInfo.bind(this, record),
                                //     };
                                // }}
                            />)}
                            </MainContent>
                    {/* 右侧图标列：展示基本信息等 */}
                        <RightTags
                            menuCode={this.props.menuInfo.menuCode}
                            groupCode={1}
                            // code={this.state.code}
                            rightData={this.state.rightData}
                            permission={this.state.permission}
                        />
                    </ExtLayout>
        )
    }
}

export default EquitHoist
