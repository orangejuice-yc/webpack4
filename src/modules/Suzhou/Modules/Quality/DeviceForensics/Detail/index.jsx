import React, { Component } from 'react'
import style from './style.less'
import { Table } from 'antd'
import notificationFun from '@/utils/notificationTip';
import PublicButton from '@/components/public/TopTags/PublicButton'
import moment from 'moment';
import * as dataUtil from "@/utils/dataUtil";
import AddDetail from '../AddDetail'
import ModifyDetail from '../ModifyDetail'
import UploadDoc from '../Upload'
import {queryDeviceDetailList, addDeviceDetail, delDeviceDetail, updateDeviceDetail, uploadDeviceDetailFile, dowDeviceDetailTemp, 
    getTsPlatList} from '../../../../api/suzhou-api'
import axios from '../../../../../../api/axios'

const columns = [
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
        title: '是否特种设备',
        dataIndex: 'typeVo.name',
        key: 'typeVo.name',
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
];

export class QualityInspectionDetail extends Component {
    constructor (props) {
        super(props)
        this.state = {
            loading: true,
            visibleModal: false,
            visibleModalDetail: false,
            UploadVisible: false,
            data: null,
            activeIndex: undefined,
            rightData: null,
            selectedRowKeys: [],
            pageSize: 10,
            currentPageNum: 1,
            status: '0',
            total: 0,
        }
    }
    componentDidMount() {
        this.getDeviceList()
    }
    // 请求设备明细数据列表
    getDeviceList = () => {
        const {sectionIds, rightData} = this.props
        const {projectId, id} = rightData
        const {status, pageSize, currentPageNum} = this.state
        let ids
        if (Array.isArray(sectionIds)) {
            ids = sectionIds.join()
        } else {
            ids = sectionIds
        }
        axios.get(queryDeviceDetailList(pageSize, currentPageNum, 'check'), {params: {deviceCheckId: id}}).then(res => {
            const {data, total} = res.data
            if ( data.length === 0 && currentPageNum > 1) {
                this.setState({currentPageNum: currentPageNum - 1}, () => {
                    this.getDeviceList()
                })
            }
            this.setState({data, total, loading: false})
        }).catch(err => {
            this.setState({loading: false})
        })
    }
    // 点击触发
    btnClicks = (type) => {
        if (type === 'AddTopBtn') {
            this.setState({visibleModal: true})
        } else if (type === 'DeleteTopBtn') {
            const {selectedRowKeys, rightData, total, data} = this.state
            axios.deleted(delDeviceDetail('check'), {
                data: selectedRowKeys || []
            }).then(() => {
                // 判断是否是删掉点击的那条 那么要清掉点击的数据和选中class
                if (rightData && selectedRowKeys.some(item => item === rightData.id)) {
                    this.setState({
                        rightData: null,
                        rowClassName: null,
                    });
                }
                this.setState({
                    total: total - selectedRowKeys.length,
                    data: data.filter(item => !selectedRowKeys.includes(item.id)),
                    selectedRowKeys: [],
                    selectedRows: [],
                });
                notificationFun('操作提醒', '删除成功', 'success')
            })
        } else if (type === 'ModifyTopBtn') {
            const {activeIndex} = this.state
            if (!Number.isInteger(activeIndex)) {
                notificationFun('操作提醒', '请选择修改项')
                return 
            }
            this.setState({visibleModalDetail: true})
        } else if (type === 'ImportFile') {
            this.setState({
                UploadVisible:true
            })
        } else if (type === 'exportFile') {
            axios.down(dowDeviceDetailTemp(),{}).then((res)=>{
            })
        }
    }
    // 获取点击行信息
    getInfo = (record, index) => {
        this.setState({
            activeIndex: record.id,
            rightData: record
        })
    }
    // 新增确认
    handleModalOk = (data0, type) => {
        const {rightData} = this.props
        const {status, data, total} = this.state
        const {projectId, sectionId, sectionCode, sectionName, id} = rightData
        const deviceCheckId = id
        const data1 = {...data0, projectId, sectionId, sectionCode, sectionName, deviceCheckId, status}
        axios.post(addDeviceDetail(), data1).then(res => {
            const newData = res.data.data
            const {deviceBirthday, deviceValidity, deviceCheckYear} = newData
            const birthday = moment(deviceBirthday).format('YYYY-MM-DD')
            const validity = moment(deviceValidity).format('YYYY-MM-DD')
            const checkYear = moment(deviceCheckYear).format('YYYY-MM-DD')
            const d = {...newData, deviceBirthday: birthday, deviceValidity: validity, deviceCheckYear: checkYear}
            if (type === 'save') {
                this.setState({visibleModal: false})
            }
            this.setState({
                data: [...data, d],
                total: total+1
            })
            notificationFun('操作提醒', '新增成功', 'success')
        })
    }
    // 修改明细确认
    handleModalOkDetail = (data0) => {
        this.setState({visibleModalDetail: false})
        const {id, deviceCode, deviceName, type, deviceType, deviceNum, deviceProducer, measurement, 
            constantCapacity, constantVoltage, deviceBirthday, deviceValidity, deviceCheckYear} = data0
        axios.put(updateDeviceDetail(), {id, deviceCode, deviceName, type, deviceType, deviceNum, deviceProducer, measurement, 
            constantCapacity, constantVoltage, deviceBirthday, deviceValidity, deviceCheckYear}).then(res => {
            // this.setState({
            //     rightData: { ...this.state.rightData, ...data0 },
            //     data: this.state.data.map(item =>
            //         item.id === data0.id ? { ...item, ...data0 } : item
            //     ),
            // })
            this.getDeviceList();
            notificationFun('操作提醒', '修改成功', 'success')
        })
    }
    // 新增取消
    handleModalCancel = () => {
        this.setState({
            visibleModal: false, 
            visibleModalDetail: false,
            UploadVisible: false,
        })
    }
    // 点击行样式
    setClassName = (record, index) => {
        //判断索引相等时添加行的高亮样式
        return record.id == this.state.activeIndex ? 'tableActivty' : "";
    }
    //判断是否有选中数据
    hasRecord=()=>{
        if (this.state.selectedRowKeys.length == 0){
            notificationFun('操作提醒', '未选中数据')
            return false
        } else {
            return true
        }
    }
    //请求接口函数
    getListData = () => {
        this.getDeviceList();
    }

    render() {
        const {loading, data, selectedRowKeys, total, currentPageNum, pageSize,} = this.state
        // 表格行是否可选配置
        const rowSelection = {
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys
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
                    this.getDeviceList()
                })
            },
            onChange: (page, pageSize) => {
                this.setState({
                    pageSize,
                    currentPageNum: page
                }, () => {
                    this.getDeviceList()
                })
            }
        }
        return (
            <div className={style.main}>
                <div className={style.mainHeight}>
                    <h3 className={style.listTitle}>设备明细</h3>
                    <div className={style.rightTopTogs}>
                        <PublicButton 
                            edit={this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT'?true:false}
                            name={'新增'} 
                            title={'新增'} 
                            icon={'icon-add'}
                            edit={!this.props.status}
                            afterCallBack={this.btnClicks.bind(this, 'AddTopBtn')}
                            res={'MENU_EDIT'}
                        />
                        <PublicButton 
                            edit={this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT'?true:false}
                            name={'修改'} 
                            title={'修改'}
                            edit={!this.props.status}
                            icon={'icon-xiugaibianji'}
                            afterCallBack={this.btnClicks.bind(this, 'ModifyTopBtn')}
                            res={'MENU_EDIT'}
                        />
                        <PublicButton 
                            edit={this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT'?true:false}
                            name={'导入'} 
                            title={'导入'} 
                            edit={!this.props.status}
                            icon={'icon-iconziyuan2'} 
                            afterCallBack={this.btnClicks.bind(this, 'ImportFile')} 
                        />
                        <PublicButton 
                            edit={this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT'?true:false}
                            name={'导出'} 
                            title={'导出模版'} 
                            edit={!this.props.status}
                            icon={'icon-iconziyuan2'} 
                            afterCallBack={this.btnClicks.bind(this, 'exportFile')} 
                        />
                        <PublicButton 
                            edit={this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'INIT'?true:false}
                            name={'删除'} 
                            title={'删除'} 
                            icon={'icon-shanchu'}
                            verifyCallBack={this.hasRecord}
                            useModel={true} 
                            edit={!this.props.status}
                            afterCallBack={this.btnClicks.bind(this, 'DeleteTopBtn')}
                            content={'你确定要删除吗？'}
                            res={'MENU_EDIT'}
                        />
                        <AddDetail 
                            handleModalOk={this.handleModalOk} 
                            visibleModal={this.state.visibleModal}
                            handleModalCancel={this.handleModalCancel}
                        />
                        <ModifyDetail 
                            handleModalOkDetail={this.handleModalOkDetail} 
                            visibleModalDetail={this.state.visibleModalDetail}
                            handleModalCancel={this.handleModalCancel}
                            rightData={this.state.rightData}
                        />
                        {this.state.UploadVisible &&
                            <UploadDoc 
                                modalVisible={this.state.UploadVisible} 
                                handleCancel={this.handleModalCancel}
                                getListData={this.getListData}
                                projectId={this.props.rightData.projectId}
                                sectionId={this.props.rightData.sectionId}
                                deviceCheckId ={this.props.rightData.id}
                                url  = {uploadDeviceDetailFile()}
                            />
                        }
                    </div>
                    <div className={style.mainScorll} style={{overflow: 'auto'}}>
                        <Table className={style.table}
                            columns={columns} 
                            dataSource={data} 
                            pagination={pagination}
                            rowSelection={rowSelection}
                            rowKey={_r => _r.id}
                            rowClassName={this.setClassName}
                            loading={loading}
                            onRow={(_r) => {
                                return {
                                    onClick: this.getInfo.bind(this, _r),
                                };
                            }}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default QualityInspectionDetail
