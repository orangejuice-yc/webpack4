import React, { Component } from 'react'
import intl from 'react-intl-universal'
import { Table, Progress, Spin, Modal, Input, Form, InputNumber, Popconfirm, Select } from 'antd'
import DistributionBtn from "../../../../components/public/TopTags/DistributionBtn"
import DeleteTopBtn from "../../../../components/public/TopTags/DeleteTopBtn"
import AddTopBtn from "../../../../components/public/TopTags/AddTopBtn"
// import dynamic from 'next/dynamic'
import style from "./style.less"

//api
import {
    getPlanChgdelvAllList
} from "../../../../api/api"
import * as util from '../../../../utils/util';
import axios from '../../../../api/axios';

const confirm = Modal.confirm
const Option = Select.Option

const data = [{
    id: 1,
    key: 1,
    nameChangeData: 'ACM陈汉平视觉设计文档',
    nameOldData: 'ACM产品视觉规范文档',
    typeChangeData: ['文件', '模型'],
    typeOldData: '模型',
    codeChangeData: 'A120',
    codeOldData: 'A1209',
    plandelvNum: 3,
    creator: "孙伯禹",
    creatTime: "2018-12-23",
    completeStatus: "完成",
    completeTime: "2019-4-02",
    actdelvNum: 2
}, {
    id: 2,
    key: 2,
    nameChangeData: 'ACM陈汉平视觉设计文档',
    nameOldData: 'ACM产品视觉规范文档001',
    typeChangeData: ['文件', '模型'],
    typeOldData: '模型',
    codeChangeData: 'A1201',
    codeOldData: 'A1201',
    plandelvNum: 2,
    creator: "孙伯禹",
    creatTime: "2018-12-23",
    completeStatus: "完成",
    completeTime: "2019-4-02",
    actdelvNum: 2
}]

const FormItem = Form.Item;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'select') {
            return <Select style={{ width: "100%" }} size="small">
                <Option value="文件">文件</Option>
                <Option value="模型">模型</Option>
            </Select>
        }
        return <Input size="small" />;
    };

    render() {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            ...restProps
        } = this.props;
        return (
            <EditableContext.Consumer>
                {(form) => {
                    const { getFieldDecorator } = form;
                    return (
                        <td {...restProps}>
                            {editing ? (
                                <FormItem style={{ margin: 0 }}>
                                    {getFieldDecorator(dataIndex, {
                                        rules: [{
                                            required: true,
                                            message: `请输入 ${title}!`,
                                        }],
                                        initialValue: record[dataIndex],
                                    })(this.getInput())}
                                </FormItem>
                            ) : restProps.children}
                        </td>
                    );
                }}
            </EditableContext.Consumer>
        );
    }
}

class DeliveryList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
            selectStatus: 0,//选中状态 0 , 1, 2 no,单选，多选
            seletData: [], //选中数据
            addModal: false,//显示新增
            upfileModal: false,//显示上传
            modifyFile: false,//显示修改
            showDistribute: false,//显示分配
            data,
            columns: [
                {
                    title: intl.get('wsd.i18n.plan.delvList.delvname'),
                    width: 280,
                    children: [{
                        title: '变更数据',
                        dataIndex: 'nameChangeData',
                        className: 'spsColumns',
                        key: 'nameChangeData',
                        editable: true,
                        render: (text, record) => <div className="editable-row-text">{text}</div>
                    }, {
                        title: '原数据',
                        dataIndex: 'nameOldData',
                        key: 'nameOldData',
                    }]
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.delvtype'),
                    children: [{
                        title: '变更数据',
                        dataIndex: 'typeChangeData',
                        className: 'spsColumns',
                        key: 'typeChangeData',
                        editable: true,
                        render: (text, record) => <div className="editable-row-text">{text}</div>
                    }, {
                        title: '原数据',
                        dataIndex: 'typeOldData',
                        key: 'typeOldData',
                    }]
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.delvcode'),
                    children: [{
                        title: '变更数据',
                        dataIndex: 'codeChangeData',
                        className: 'spsColumns',
                        key: 'codeChangeData',
                        editable: true,
                        render: (text, record) => <div className="editable-row-text">{text}</div>
                    }, {
                        title: '原数据',
                        dataIndex: 'codeOldData',
                        key: 'codeOldData',
                    }]
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.plandelvnum'),
                    dataIndex: 'plandelvNum',
                    key: 'plandelvNum',
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.creator'),
                    dataIndex: 'creator',
                    key: 'creator',
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.creattime'),
                    dataIndex: 'creatTime',
                    key: 'creatTime',
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.completestatus'),
                    dataIndex: 'completeStatus',
                    key: 'completeStatus',
                },
                {
                    title: intl.get('wsd.i18n.plan.delvList.completetime'),
                    dataIndex: 'completeTime',
                    key: 'completeTime',
                },
                {
                    title: "操作",
                    key: 'action',
                    render: (text, record) => {
                        const editable = this.isEditing(record);
                        return (
                            <div className="editable-row-operations">
                                {editable ? (
                                    <span>
                                        <EditableContext.Consumer>
                                            {form => (
                                                <a
                                                    href="javascript:;"
                                                    onClick={() => this.save(form, record.key)}
                                                    style={{ marginRight: 8 }}
                                                >
                                                    保存
                                                </a>
                                            )}
                                        </EditableContext.Consumer>
                                        <Popconfirm
                                            title="确定取消?"
                                            onConfirm={() => this.cancel(record.key)}
                                            okText="确认"
                                            cancelText="取消"
                                        >
                                            <a>取消</a>
                                        </Popconfirm>
                                    </span>
                                ) : (
                                        <a onClick={() => this.edit(record.key)}>编辑</a>
                                    )}
                            </div>
                        );
                    },
                },
            ],
            editingKey: ''
        }
    }

    onClickHandle = (name) => {
        if (name == "AddTopBtn") {
            this.setState({
                addModal: true,
            })
            return
        }
        if (name == "ModifyTopBtn") {
            this.setState({
                modifyFile: true,
            })
        }
        if (name == "DistributionBtn") {
            this.setState({
                showDistribute: true,
            })

            return
        }
        if (name == "UploadTopBtn") {

            this.setState({
                upfileModal: true,
            })

            return
        }
        if (name == "DeleteTopBtn") {

            confirm({
                title: '您确定要删除文件？',
                cancelText: '取消',
                okText: '确定',
                onOk() {

                }
            });

            return
        }
    }

    closeDistributionModal = () => {
        this.setState({
            showDistribute: false
        })
    }

    closeAddModal = () => {
        this.setState({
            addModal: false
        })
    }

    closeUpFileModal = () => {
        this.setState({
            upfileModal: false
        })
    }

    closeModifyFileModal = () => {
        this.setState({
            modifyFile: false
        })
    }

    openCkeck = (text) => {
        this.setState({
            isShowCheckModal: true,
            filenum: text
        })
    }

    closeCheckModal = () => {
        this.setState({
            isShowCheckModal: false
        })
    }

    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ data: newData, editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' });
            }
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    componentDidMount () {
        //this.getPlanChgdelvAllList() 暂时不做
    }

    // 获取交付清单列表
    getPlanChgdelvAllList = () => {
        const { rightData } = this.props
        axios.get(getPlanChgdelvAllList(rightData[0]['nodeType'], rightData[0]['id'])).then(res => {
            const { data } = res.data
        })
    }

    render() {
        // const AddModal = dynamic(import('./AddModal/index'), {
        //     loading: () => <Spin size="small" />
        // })
        // const DistributionModal = dynamic(import('./DistributionModal/index.jsx'), {
        //     loading: () => <Spin size="small" />
        // })
        // const CheckModal = dynamic(import('./CheckModal/index.jsx'), {
        //     loading: () => <Spin size="small" />
        // })
        const AddModal = import('./AddModal/index')
        const DistributionModal = import('./DistributionModal/index.jsx')
        const CheckModal = import('./CheckModal/index.jsx')
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {

                if (selectedRowKeys.length > 0) {
                    if (selectedRowKeys.length == 1) {
                        this.setState({
                            selectStatus: 1,
                            seletData: selectedRows
                        })
                    } else {
                        this.setState({
                            selectStatus: 2,
                            seletData: selectedRows
                        })
                    }

                } else {
                    this.setState({
                        selectStatus: 0
                    })
                }
            },
            onSelect: (record, selected, selectedRows) => {

            },
            onSelectAll: (selected, selectedRows, changeRows) => {

            },
        };

        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };

        const childColumns = (cols) => {
            return cols.map(col => {
                if (!col.editable) {
                    return col;
                }
                return {
                    ...col,
                    onCell: record => ({
                        record,
                        inputType: col.dataIndex === 'typeChangeData' ? 'select' : 'text',
                        dataIndex: col.dataIndex,
                        title: col.title,
                        editing: this.isEditing(record),
                    }),
                };
            })
        }

        const columns = this.state.columns.map((cols, index) => {
            if (cols.children) {
                return {
                    ...cols,
                    children: childColumns(cols.children)
                }
            } else {
                return cols;
            }

        });
        return (
            <div className={style.main}>
                <div className={style.mainHeight}>
                    <h3 className={style.listTitle}>交付清单</h3>
                    <div className={style.rightTopTogs}>
                        <DistributionBtn onClickHandle={this.onClickHandle.bind(this)} />
                        <AddTopBtn onClickHandle={this.onClickHandle.bind(this)} />
                        <DeleteTopBtn onClickHandle={this.onClickHandle.bind(this)} />
                        {this.state.showDistribute && <DistributionModal handleCancel={this.closeDistributionModal.bind(this)}></DistributionModal>}
                        {this.state.addModal && <AddModal handleCancel={this.closeAddModal.bind(this)}></AddModal>}
                        {this.state.upfileModal && <UploadModal handleCancel={this.closeUpFileModal.bind(this)}></UploadModal>}
                        {this.state.modifyFile && <ModifyFileModal handleCancel={this.closeModifyFileModal.bind(this)}></ModifyFileModal>}
                    </div>
                    <div className={style.mainScorll}>
                        <Table columns={columns} components={components} size="small" bordered={true} dataSource={this.state.data} pagination={false} name={this.props.name} rowSelection={rowSelection} />
                        {this.state.isShowCheckModal && <CheckModal text={this.state.filenum} handleCancel={this.closeCheckModal.bind(this)}></CheckModal>}
                    </div>

                </div>
            </div>
        )
    }
}

export default DeliveryList
