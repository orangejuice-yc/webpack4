import React, { Component } from 'react'
import intl from 'react-intl-universal'
import { Table, notification } from 'antd'
import style from './style.less'
import { connect } from 'react-redux'
import { changeLocaleProvider } from '../../../../../../../store/localeProvider/action'
import RightTags from '../../../../../../../components/public/RightTags/index'
import * as util from '../../../../../../../utils/util';
import * as dataUtil from '../../../../../../../utils/dataUtil';
import {meetingWfList} from '../../../../../../../api/api'
import {queryFlowDeviceForensicsList,getPermission} from '../../../../../api/suzhou-api';
import axios from '../../../../../../../api/axios';
import MyIcon from "../../../../../../../components/public/TopTags/MyIcon";
import notificationFun from '@/utils/notificationTip';
class Delivery extends Component {
    constructor(props) {
        super(props)
        this.state = {
            activeIndex: [],
            rightData: [],
            data: [],
            initData: [],
            dataMap: [],
            projectData: [],
            taskData: [],
            projectId: null,
            permission:[]
        }
    }
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
        //监听全局点击事件
        document.addEventListener('click', this.closeRight);
        // 初始化数据
        this.initDatas();
    }

    /**
     * 初始化数据
     *
     */
    initDatas = () => {
        this.getComuMeetListByBizs();
    }

    componentWillUnmount() {
        //销毁全局点击事件
        document.removeEventListener('click', this.closeRight, false);
    }

    // 获取选中的列表项
    getInfo = (record) => {
        this.setState({
            activeIndex: [record.id],
            rightData: [record],
        })
    }

    // 选中行高亮
    setClassName = (record) => {
        let activeId = this.state.activeIndex.length > 0 ? this.state.activeIndex[0] : -1;
        //判断索引相等时添加行的高亮样式
        return record.id === activeId ? "tableActivty" : "";
    }

    //获取发布列表
    getComuMeetListByBizs=()=>{
        const {formDatas} = this.props;
        let ids = dataUtil.Arr().toStringByObjectArr(formDatas,"bizId");
        if(ids && ids.length > 0){
            axios.get(queryFlowDeviceForensicsList + `?ids=${ids}`).then(res=>{
                const { data } = res.data;
                const dataMap = util.dataMap(data);
                this.setState({
                  data: data || [],
                  initData: data || [],
                  dataMap
                })
            });
        }
         else{
          this.setState({
            data: [],
            initData: [],
            dataMap: {}
          })
        }
    }
    /**
     * 查询条件
     *
     * @param value
     */
    search = (value) => {
        const { initData ,tableData} = this.state;
        let newData = dataUtil.search(initData, [{ "key": "deviceName", "value": value }], true);
        const dataMap = util.dataMap(newData);
        tableData[0].children=data
        this.setState({
            data: newData ,
            dataMap
        });
    }
    updateSuccess = data => {
        this.setState({
          data: this.state.data.map(item => (item.id === data.id ? data : item)),
          rightData: { ...data },
        });
        notificationFun('操作提醒', '修改成功', 'success');
      };
    render() {
        const columns = [
            {
                title: "序号",
                render: (text, record, index) => `${index + 1}`
            },
            {
                title: "项目名称",
                dataIndex: 'projectName',
                key: 'projectName',
            },
            {
                title: "标段名称",
                dataIndex: 'sectionName',
                key: 'sectionName',
            },
            {
                title: "设备名称",
                dataIndex: 'deviceName',
                key: 'deviceName',
            },
            {
                title: "设备编码",
                dataIndex: 'deviceCode',
                key: 'deviceCode',
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
                title: "原因",
                dataIndex: 'reason',
                key: 'reason',
            },
            {
                title: "施工单位",
                dataIndex: 'sgdw',
                key: 'sgdw',
            },
            {
                title: "监理单位",
                dataIndex: 'jldw',
                key: 'jldw',
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
                title: "附件状态",
                dataIndex: 'fileStatusVo.name',
                key: 'fileStatusVo',
            },
            {
                title: "状态",
                dataIndex: 'statusVo.name',
                key: 'statusVo',
            },
        ];
        return (
            <div className={style.main}>
                <div className={style.leftMain} style={{ height: this.props.height }}>
                    <div style={{ minWidth: 'calc(100vw - 60px)' }}>
                        <Table className={style.Infotable1}
                            columns={columns}
                            pagination={false}
                            dataSource={this.state.data}
                            rowClassName={this.setClassName}
                            rowKey={record => record.id}
                            defaultExpandAllRows={true}
                            size={"small"}
                            onRow={(record, index) => {
                                return {
                                    onClick: () => {
                                        this.getInfo(record, index)
                                    }
                                }
                            }} />
                    </div>
                </div>
                <div className={style.rightBox} style={{ height: this.props.height }}>
                    <RightTags
                        menuCode={this.props.menuInfo.menuCode}
                        rightTagList={this.state.rightTags}
                        rightData={this.state.rightData && this.state.rightData.length > 0 ? this.state.rightData[0] : null}
                        bizType={this.props.proc.formDatas[0].bizType}
                        bizId = {this.state.rightData && this.state.rightData.length > 0 ? this.state.rightData[0].id : null}
                        projectId={this.state.projectId}
                        menuId = {this.props.menuInfo.id}
                        wfeditAuth = "false"
                        wfPubliceditAuth = {false}
                        fileEditAuth ={false}
                        meetActionEditAuth ={false}
                        isShow={this.state.permission.indexOf('DEVICEFORENSICS_FILE-SPEDEVACCPET')==-1?false:true} //文件权限
                        permission={this.state.permission}
                        taskFlag={!this.props.start?false:true}
                        updateSuccess={this.updateSuccess}
                    />
                </div>
            </div>
        )
    }
}


/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
    currentLocale: state.localeProviderData
}), {changeLocaleProvider})(Delivery);

