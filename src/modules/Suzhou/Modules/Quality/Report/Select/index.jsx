import React, { Component, memo ,Fragment} from 'react';
import { Popover, Icon, Table } from 'antd';
import axios from '@/api/axios';
import PublicTable from '@/components/PublicTable'
export default memo(
  class extends Component {
    state = {
      rowClassName: '',
    };
    onRef = (ref) => {
      this.table = ref
    }
    handleSetRowClassName = record => {
      // if (Object.is(record.id, this.state.rowClassName)) {
        this.setState({
            rowClassName: record.id,
          },()=>{
            console.log(record);
            this.props.handleGetSystemTree(record);
          });
        if (record.typeNoVo.code === '5') {
          // 分项 改成检验批
          this.props.getSelectRecord({
            code: '5',
            name: '检验批',
            id: record.id,
          });
        } else {
          this.props.getSelectRecord({
            ...record.typeNoVo,
            id: record.id,
          });
        }
      // }
      return Object.is(record.id, this.state.rowClassName) ? 'tableActivty' : '';
    };
    componentWillReceiveProps(nextProps) {
      if (JSON.stringify(nextProps.leftTableTree) !== JSON.stringify(this.props.leftTableTree)) {
        this.setState({
          rowClassName: nextProps.leftTableTree[0].id,
        });
      }
    }
    render() {
      return (
        <Fragment>
        {this.props.projectId &&(<PublicTable
          onRef={this.onRef}
          pagination={false}
          getData={this.props.handleGetqueryQuaSystem}
          columns={columns}
          expanderLevel={"ALL"} 
          getRowData={this.handleSetRowClassName}
          scroll={{ x: 300 ,y: this.props.height - 100}}
          // loading={false}
          // indentSize={10}
          // columns={columns}
          // size="small"
          // key={this.props.leftTableTree || '1'}
          // defaultExpandAllRows={true}
          // dataSource={this.props.leftTableTree || null}
          // rowClassName={this.handleSetRowClassName} //
          // pagination={false}
          // scroll={{ x: 300 ,y: this.props.height - 100}}
          // style={{ overflow: 'auto' }}
          // onRow={record => {
          //   return {
          //     onClick: () => {
          //       // if(record.nodeType == 'project'){
          //       //   this.setState({
          //       //     rowClassName: null,
          //       //   });
          //       // }else{
                  
          //       // }
          //       this.setState({
          //           rowClassName: record.id,
          //         },()=>{
          //           console.log(record);
          //           this.props.handleGetSystemTree(record);
          //         });
          //     }, // 点击行
          //   };
          // }}
        />)}
        </Fragment>
      );
    }
  }
);
const columns = [
  {
    title: '质量管理单元',
    dataIndex: 'name',
    key: 'name',
  },
];
