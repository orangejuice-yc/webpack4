import React, { Component } from 'react'
import { Table, notification } from 'antd'
import style from './style.less'
import ExtLayout from "../../../components/public/Layout/ExtLayout";
import MainContent from "../../../components/public/Layout/MainContent";
import Toolbar from "../../../components/public/Layout/Toolbar";
import { connect } from 'react-redux'
import axios from "../../../api/axios"
import { getRsrcrole, deletersrcrole } from "../../../api/api"
import * as dataUtil from "../../../utils/dataUtil"
import TopTags from './TopTags/index'
import RightTags from '../../../components/public/RightTags/index'
import TreeTable from '../../../components/PublicTable'
import AddRoleModal from "./AddRoleModal"
class ResourceResourole extends Component {
    constructor(props) {
        super(props)
        this.state = {

            activeIndex: "",
            rightData: null,
            rightTags: [
                { icon: 'iconjibenxinxi', title: '基本信息', fielUrl: 'Resource/Resourole/BasicInfo' },
            ],
            data: [],
            initData: []
        }

    }

    //注册 父组件即可调用子组件方法
    onRef = (ref) => {
        this.table = ref
    }
    //删除检验
    deleteVerifyCallBack = () => {
        const { data, dataMap, rightData } = this.state;
        if (!rightData) {
            notification.warning(
                {
                    placement: 'bottomRight',
                    bottom: 50,
                    duration: 1,
                    message: '警告',
                    description: '没有选择数据！'
                }
            )
            return false
        } else {
            return true
        }
    }
    TopTagsonClickHandle = (name, menu) => {

        // 新增同级
        if (name === 'AddSameBtn') {

            this.setState({
                addlevel: true,
                type: "same"
            })
            return
        }
        // 新增下级
        if (name === 'AddNextBtn') {

            if (!this.state.rightData) {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 1,
                        message: '警告',
                        description: '没有选择数据！'
                    }
                )
                return
            }
            this.setState({
                addlevel: true,
                type: "down",

            })

            return
        }
        if (name == "DeleteTopBtn") {
            const { data, rightData } = this.state;
            if (!rightData) {
                notification.warning(
                    {
                        placement: 'bottomRight',
                        bottom: 50,
                        duration: 1,
                        message: '警告',
                        description: '没有选择数据！'
                    }
                )
                return
            }
            axios.deleted(deletersrcrole(rightData.id), null, true).then(res => {
                this.table.deleted(rightData)
                this.setState({
                    data,
                    rightData: null,
                });
            })


        }


    }
    //获取列表
    getData = (callBack) => {
        axios.get(getRsrcrole).then(res => {
            callBack(res.data.data ? res.data.data : []);
            this.setState({
                data: res.data.data,
                initData: res.data.data,
            })

        })
    }

    //table 点击行事件
    getInfo = (record, index) => {
        this.setState({
            rightData: record
        })
    }
    //搜索
    search = (v) => {
        this.setState({
            keyWrods: v,
        }, () => {
            const { initData } = this.state;
            var newData = dataUtil.search(initData, [{ "key": "roleCode|roleName", "value": v }], true);
            this.table.state.dataSource = newData

            this.setState({ data: newData });
        })


    }

    //新增
    addData = (value) => {

        const { data, rightData, type } = this.state;
        if (type == "same") {
            if (rightData) {
                this.table.add(rightData, value, 'same')
            } else {
                this.table.add(null, value)
            }
        }
        if (type == "down") {
            this.table.add(rightData, value)
        }

    }
    //更新数据
    updateSuccess = (v) => {
        const { rightData } = this.state;

        this.table.update(rightData, v)
    };
    //关闭弹框
    closeMadal = () => {
        this.setState({
            addlevel: false
        })
    }
    render() {
        const { intl } = this.props.currentLocale
        const columns = [
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.rolename'),
                dataIndex: 'roleName',
                key: 'roleName',
                width: '200px',
            },
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.rolecode'),
                dataIndex: 'roleCode',
                key: 'roleCode',
                width: '200px',
            },
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.roletype'),
                dataIndex: 'roleType',
                key: 'roleType',
                width: '200px',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.unit'),
                dataIndex: 'unit',
                key: 'unit',
                width: '200px',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.calendarid'),
                dataIndex: 'calendar',
                key: 'calendar',
                width: '200px',
                render: (text) => {
                    if (text) {
                        return <span>{text.name}</span>
                    } else {
                        return null
                    }
                }
            },
            {
                title: intl.get('wsd.i18n.rsrc.rsrcrole.remark'),
                dataIndex: 'remark',
                key: 'remark',
            },
        ];

        return (
            <ExtLayout renderWidth={({ contentWidth }) => { this.setState({ contentWidth }) }}>
                <Toolbar>
                    <TopTags search={this.search.bind(this)} onClickHandle={this.TopTagsonClickHandle.bind(this)} deleteVerifyCallBack={this.deleteVerifyCallBack} />
                </Toolbar>
                <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1500}>
                    <TreeTable onRef={this.onRef} getData={this.getData}
                        pagination={false} columns={columns}
                        scroll={{ x: 1200, y: this.props.height - 50 }}
                        getRowData={this.getInfo}
                    />
                </MainContent>
                
                <RightTags rightTagList={this.state.rightTags} rightData={this.state.rightData} menuCode={this.props.menuInfo.menuCode} updateSuccess={this.updateSuccess} search={this.search} />
                {this.state.addlevel && <AddRoleModal
                    handleCancel={this.closeMadal.bind(this)} type={this.state.type}
                    addData={this.addData}
                    data={this.state.rightData}
                />}
            </ExtLayout>


        )
    }
}



const mapStateToProps = state => {
    return {
        currentLocale: state.localeProviderData,
    }
};


export default connect(mapStateToProps, null)(ResourceResourole);

