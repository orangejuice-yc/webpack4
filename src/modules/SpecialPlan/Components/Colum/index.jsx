import React, { Component } from 'react'
import { Modal, Table } from 'antd';
import style from './style.less'

export class PlanColum extends Component {
    constructor(props) {
        super(props)
        this.state = {
            columns: [
                {
                    title: '列名',
                    dataIndex: 'name',
                    key: 'name',
                }
            ],
            data: [
                {
                    id: 1,
                    name: '名称',
                    columName: 'name',
                    check: true
                },
                {
                    id: 2,
                    name: '代码',
                    columName: 'code',
                    check: true
                },
                {
                    id: 3,
                    name: '责任主体',
                    columName: 'org',
                    check: true
                },
                {
                    id: 4,
                    name: '责任人',
                    columName: 'user',
                    check: true
                },
                {
                    id: 5,
                    name: '计划开始时间',
                    columName: 'planStartTime',
                    check: true
                },
                {
                    id: 6,
                    name: '计划完成时间',
                    columName: 'planEndTime',
                    check: true
                }
            ],
            activeIndex: [],
            selectData: []
        }
    }

    render() {
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {},
            onSelect: (record, selected, selectedRows, nativeEvent) => { 
                this.props.columHandle(selected, record.columName)
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                this.state.data.map(record => {
                    this.props.columHandle(selected, record.columName)
                })
            },
            getCheckboxProps: record => ({
                defaultChecked: record.check
              })
        };
        return (
            <Modal className={style.main}
                title="显示/隐藏列"
                visible={true}
                width={306}
                onCancel={this.props.handleCancel}
                footer={null}
            >
                {this.state.data && <Table
                    rowKey={record => record.id}
                    pagination={false}
                    columns={this.state.columns}
                    size="small"
                    rowSelection={rowSelection}
                    dataSource={this.state.data}
                    rowClassName={this.setClassName}
                />}

            </Modal>
        )
    }
}

export default PlanColum
