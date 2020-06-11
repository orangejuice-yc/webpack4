import React, { Component } from 'react';
import { Table, notification, Modal,Input, Button, Popconfirm, Form } from 'antd';
import style from './style.less';
import Search from '../../../../components/Search';
import PublicButton from '../../../../../../components/public/TopTags/PublicButton';
import axios from '../../../../../../api/axios'
import {storageRelList,updateStorageRel} from '../../../../api/suzhou-api'
import { connect } from 'react-redux';
const confirm = Modal.confirm;
import { baseURL } from '../../../../../../api/config';
import * as dataUtil from '../../../../../../utils/dataUtil';
import CheckModal from "../../../../components/CheckModal/"


const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
class EditableCell extends React.Component {
  state = {
    editing: false,
  };
  componentDidMount(){
    // if(this.props.rightData.statusVo.code == '1'){
    //   this.setState({
    //     editing:true
    //   })
    // }
  }
  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(<Input ref={node => (this.input = node)} onPressEnter={this.save} onBlur={this.save} />)}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {editable,dataIndex,title,record,index,handleSave,children,...restProps} = this.props;
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}
class Detail extends Component {
    constructor(props){
        super(props);
        this.state={
            total:'',
            pageSize:10,
            currentPageNum:1,
            data:[],
            editingFlag:false,
        }
        
    }
    getList= ()=>{
        const {pageSize,currentPageNum} = this.state;
        const {projectId,sectionId,inspectionCode,storageCode} = this.props.rightData;
        axios.get(storageRelList(pageSize,currentPageNum,storageCode)).then(res=>{
            this.setState({
                data:res.data.data,
                total:res.data.total
            })
        })
    }
    componentDidMount(){
        this.props.rightData?this.getList():null;
        if(this.props.rightData.statusVo.code == '1'){
          this.setState({
            editingFlag:false
          })
        }else{
          this.setState({
            editingFlag:true
          })
        }
    }
    handleSave = row => {
      // const newData = [...this.state.data];
      // const index = newData.findIndex(item => row.key === item.key);
      // const item = newData[index];
      // newData.splice(index, 1, {
      //   ...item,
      //   ...row,
      // });
      // this.setState({ data: newData });
      axios.put(updateStorageRel,row,true).then(res=>{
        this.getList();
      })
    };
    render(){
      const components = {
        body: {
          row: EditableFormRow,
          cell: EditableCell,
        },
      };
      const columnsList = [
        {
          title: '物料编码',
          dataIndex: 'materialCode',
        },
        {
          title: '物料名称',
          dataIndex: 'classificationVo.materialName',
        },
        {
          title: '来源',
          dataIndex: 'classificationVo.source',
        },
        {
          title: '规格型号',
          dataIndex: 'classificationVo.specification',
        },
        {
          title: '计量单位',
          dataIndex: 'classificationVo.unit',
        },
        {
          title: '入库数量',
          dataIndex: 'quantity',
          editable: this.state.editingFlag,
          width: '30%',
        },
      ];
      const columns = columnsList.map(col => {
        if (!col.editable) {
          return col;
        }
        return {
          ...col,
          onCell: record => ({
            record,
            editable: col.editable,
            dataIndex: col.dataIndex,
            title: col.title,
            handleSave: this.handleSave,
          }),
        };
      });
      let pagination = {
        total: this.state.total,
        // hideOnSinglePage: true,
        current: this.state.currentPageNum,
        pageSize: this.state.pageSize,
        showSizeChanger: true,
        size:"small",
        showQuickJumper: true,
        showTotal: total => `总共${this.state.total}条`,
        onShowSizeChange: (current, size) => {
          this.setState({
            pageSize: size,
            currentPageNum: 1
          }, () => {
            this.getList()
          })
        },
        onChange: (page, pageSize) => {
          this.setState({
            currentPageNum: page
          }, () => {
            this.getList()
          })
        }
      }
        return(
            <div className={style.main}>
                <h3 className={style.listTitle}>入库明细</h3>
                <div className={style.mainScorll}>
                    <Table className={style.table} 
                        size='small'
                        rowKey={record => record.id} 
                        columns={columns} 
                        dataSource={this.state.data} 
                        pagination={pagination}
                        name={this.props.name}
                        size='small'
                        components={components}
                        rowClassName={() => 'editable-row'}
                         />
                </div>
            </div>
        )
    }
}
export default Detail;
