import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form,InputNumber } from 'antd';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddModal from './AddModal';
import notificationTip from '@/utils/notificationTip';

import {
  updateTrainStaff,
  queryTrainStaffList,
  delTrainStaff,
  addTrainStaffReportList,
} from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

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
    const { children, dataIndex, record, title,max } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `请输入${title}`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <InputNumber
            ref={node => (this.input = node)}
            type="number"
            onPressEnter={this.save}
            onBlur={this.save}
            min={0}
            max={max}
          />
        )}
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
    const {
      editable,
      dataIndex,
      title,
      record,
      index,
      handleSave,
      children,
      max,
      ...restProps
    } = this.props;
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

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
      is_tz: false,
      editingFlag:false,
    };
    
  }

  handleSave = row => {
    axios
      .put(
        updateTrainStaff(),
        {
          ...row,
          intExtStaff: 1,
        },
        true
      )
      .then(res => {
        const { status, data } = res.data;
        if (status === 200) {
          const newData = [...this.state.dataSource];
          const index = newData.findIndex(item => row.id === item.id);
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...data,
          });
          this.setState({ dataSource: newData });
        }
      });
  };
  handleRequset = (size = 10, page = 1) => {
    axios.get(queryTrainStaffList(this.props.rightData.id, 1, size, page)).then(res => {
      const { data, status, total } = res.data;
      if (status === 200) {
        this.setState({
          dataSource: data,
          total: total,
        });
      }
    });
  };
  handleAddUpdateTabel = data => {
    this.setState({
      dataSource: [...this.state.dataSource, ...data],
    });
  };
  handleDelete = () => {
    if (this.state.selectedRowKeys.length > 0) {
      axios.deleted(delTrainStaff(), { data: this.state.selectedRowKeys }, true).then(res => {
        const { status } = res.data;
        if (status === 200) {
          this.setState(({ dataSource, selectedRowKeys, total }) => ({
            dataSource: dataSource.filter(item => !selectedRowKeys.includes(item.id)),
            selectedRowKeys: [],
            total: total - selectedRowKeys.length,
          }));
        }
      });
    }
  };
  hasRecord = () => {
    if (!this.state.selectedRowKeys.length > 0) {
      notificationTip('操作提醒', '未选中数据');
      return false;
    } else {
      return true;
    }
  };
  componentDidMount() {
    this.handleRequset();
    if(this.props.rightData.statusVo.code == 'INIT' ||this.props.rightData.statusVo.code == 'REJECT' ){
      this.setState({
        editingFlag:true
      })
    }else{
      this.setState({
        editingFlag:false
      })
    }
  }
  handleTZ = () => {
    const params = this.state.selectedRowKeys.map(item => ({
      id: item,
      trainId: this.props.rightData.id,
    }));
    axios.post(addTrainStaffReportList, params, true).then(res => {
      // this
      const data = this.state.dataSource;
      const tableTable = data.map(item => {
        if (this.state.selectedRowKeys.includes(item.id)) {
          return {
            ...item,
            isTz: '1',
          };
        } else {
          return item;
        }
      });
      this.setState({ dataSource: tableTable, selectedRowKeys: [], is_tz: false });
    });
    //
  };
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      },
    };
    const columnsList = [
      {
        title: '姓名',
        dataIndex: 'workerName',
      },
      {
        title: '工种',
        dataIndex: 'workerDifVo',
        render: type => (type ? type.name : ''),
      },
      {
        title: '学时(小时)',
        dataIndex: 'learnTime',
        width: '20%',
        editable: this.state.editingFlag,
        max:999
      },
      {
        title: '考试得分',
        dataIndex: 'score',
        width: '20%',
        editable: this.state.editingFlag,
        max:100
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
          max:col.max
        }),
      };
    });
    const props = this.props;
    return (
      <div className={style.container}>
        <h3 className={style.h3}>学习人员</h3>
        <div className={style.tools}>
        {props.permission.indexOf('EXTERNALTRAINING_EDIT-STAFF-EX-TRAIN')!==-1 && (
          <AddModal
            rightData={this.props.rightData}
            edit={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?true:false}
            handleAddUpdateTabel={this.handleAddUpdateTabel}
            handleRequset = {this.handleRequset}
          />)}
          {props.permission.indexOf('EXTERNALTRAINING_EDIT-STAFF-EX-TRAIN')!==-1 && (
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            afterCallBack={this.handleDelete}
            verifyCallBack={this.hasRecord}
            res={'MENU_EDIT'}
            useModel={true}
            edit={((this.props.rightData.statusVo &&this.props.rightData.statusVo.code == 'INIT') || (this.props.rightData.statusVo && this.props.rightData.statusVo.code == 'REJECT' && this.props.taskFlag))?true:false}
            content={'你确定要删除吗？'}
          />)}
          {/* <PublicButton
            name={'通知'}
            title={'通知'}
            icon={''}
            afterCallBack={this.handleTZ}
            // verifyCallBack={this.hasRecord}
            res={'MENU_EDIT'}
            // useModel={true}
            edit={true}
            show={this.state.is_tz}
            // content={'你确定要删除吗？'}
          /> */}
        </div>
        <div className={style.mainScorll}>
          <Table
            size="small"
            components={components}
            rowKey={record => record.id}
            rowClassName={record =>
              record.id === (this.state.record && this.state.record.id) ? 'tableActivty' : ''
            }
            rowSelection={{
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: (selectedRowKeys, target) => {
                if (target.length > 0) {
                  const is_tz = target.every(item => item.isTz + '' === '0');
                  this.setState({ is_tz });
                } else {
                  this.setState({ is_tz: false });
                }

                this.setState({ selectedRowKeys });
              },
            }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              LocaleProvider: true,
              total: this.state.total,
              showTotal: () => `总共${this.state.total}条`,
            }}
            dataSource={dataSource}
            columns={columns}
            onChange={({ current, pageSize }) => {
              this.handleRequset(pageSize, current);
            }}
          />
        </div>
      </div>
    );
  }
}
export default EditableTable;
