import React, { Component } from 'react'
import style from './style.less'
import {Button, Icon,Modal ,Table} from 'antd';
import intl from 'react-intl-universal'
import Search from "../../../../../components/public/Search"
import '../../../../../asserts/antd-custom.less'

const locales = {
    "en-US": require('../../../../../api/language/en-US.json'),
    "zh-CN": require('../../../../../api/language/zh-CN.json')
}


class UploadModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            visible: true,
           
            data: [
                {
                    key: "[0]",
                    id: "1",
                    delvname: "ACM产品开发项目",
                    delvcode: "XM",
                    delvtype: "类别",
                    creator:"研发部",
                    creattime:"2018-12-23"
                }
            ]
        }
    }

    componentDidMount() {
        this.loadLocales();
        this.setState({
            width: this.props.width
        })
    }

    loadLocales() {
        intl.init({
            currentLocale: 'zh-CN',
            locales,
        })
            .then(() => {
                // After loading CLDR locale data, start to render
                this.setState({ initDone: true });
            });
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    }
    handleOk = (e) => {
        this.setState({
            visible: false,
        });
        this.props.handleCancel()
    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
        this.props.handleCancel()
    }
    

    render() {
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
            },
            onSelect: (record, selected, selectedRows) => {
            },
            onSelectAll: (selected, selectedRows, changeRows) => {

            },
        };
        const columns = [
            {
                title: intl.get("wsd.i18n.plan.delvList.delvname"),
                dataIndex: 'delvname',
                key: 'delvname',
            },
            {
                title: intl.get("wsd.i18n.plan.delvList.delvcode"),
                dataIndex: 'wsd.i18n.plan.delvList.delvcode',
                key: 'delvcode',
            },
            {
                title: intl.get("wsd.i18n.plan.delvList.delvtype"),
                dataIndex: 'wsd.i18n.plan.delvList.delvtype',
                key: 'delvtype',
            },
            {
                title: intl.get("wsd.i18n.plan.delvList.creator"),
                dataIndex: 'creator',
                key: 'creator',
            },
            {
                title: intl.get("wsd.i18n.plan.delvList.creattime"),
                dataIndex: 'creattime',
                key: 'creattime',
            }
        ]
        return (
            <div className={style.main}>
                {this.state.initDone &&
                    <Modal title="分配交付清单" visible={this.state.visible}
                        onOk={this.handleOk} onCancel={this.handleCancel}
                        width="800px"
                        footer={
                            <div className="modalbtn">
                                <Button key="1" onClick={this.handleSubmit}>保存并继续</Button>
                                <Button key="2" type="primary" onClick={this.handleSubmit}>保存</Button>
                            </div>
                        }
                    >
                        <div className={style.UploadModal}>
                            <div className={style.operate}>
                               <Search></Search>
                            </div>
                            <Table 
                            className={style.table}
                            rowSelection={rowSelection}
                            columns={columns} 
                            dataSource={this.state.data} 
                            pagination={false} 
                            name={this.props.name}
                             />
                        </div>
                    </Modal>
                }
            </div>
        )
    }
}

export default UploadModal
