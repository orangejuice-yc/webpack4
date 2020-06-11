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
      const { score, learnTime, trainId, id, workerId } = { ...record, ...values };
      handleSave({ score, learnTime, trainId, id, workerId });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title ,max} = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {form.getFieldDecorator(dataIndex, {
          rules: [
            {
              required: true,
              message: `请输入`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          <InputNumber
            ref={node => (this.input = node)}
            type="number"
            onPressEnter={this.save}
            onBlur={this.save}
            disabled={this.props.record.learnOkVo.code + '' === '1' || !this.props.auth}
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
    this.columns = [
      {
        title: '姓名',
        dataIndex: 'workerName',
      },
      {
        title: '部门',
        dataIndex: 'dep',
      },
      {
        title: '学时(小时)',
        dataIndex: 'learnTime',
        editable: true,
        max:999
      },
      {
        title: '考试得分',
        dataIndex: 'score',
        editable: true,
        max:100
      },
      {
        title: '学分确认',
        dataIndex: 'learnOkVo',
        render: ({ name }) => name,
      },
      {
        title: '操作',
        render: ({ learnOkVo, workerId, trainId, id }) => {
          const useInfo = JSON.parse(sessionStorage['userInfo']);
          if (useInfo.id === workerId && learnOkVo.code + '' === '0') {
            return (
              <Button
                onClick={() => {
                  this.handleSave({
                    workerId,
                    trainId,
                    id,
                    learnOk: 1,
                  });
                }}
              >
                确认
              </Button>
            );
          } else {
            return null;
          }
        },
      },
    ];

    this.state = {
      dataSource: [],
      selectedRowKeys: [],
      total: 0,
      is_tz: false,
    };
  }

  handleSave = row => {
    // const { score, learnTime ,learnOk} = row;
    axios
      .put(
        updateTrainStaff(),
        {
          ...row,
          intExtStaff: 0,
          trainType: this.props.rightData.trainTypeVo.name,
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
    axios.get(queryTrainStaffList(this.props.rightData.id, 0, size, page)).then(res => {
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
      dataSource: [...data,...this.state.dataSource],
      total: this.state.total + 1,
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
  handleTZ = () => {
    if (this.state.selectedRowKeys.length > 0) {
      const obj = {'url':this.props.menu.url,menuCode:this.props.menu.menuCode,'id':this.props.rightData.id}
      const params = [];
      this.state.selectedRowKeys.map(item => {
        if(this.state.dataSource.filter(i => i.id === item)[0].learnOkVo.code == 1){
          notificationTip('操作提醒', '已确认的数据不需要再次通知');
          return
        }else{
          params.push({
            id: item,
            trainId: this.props.rightData.id,
            workerId: this.state.dataSource.filter(i => i.id === item)[0].workerId,
            url:JSON.stringify(obj)
          })
        }
      });
      if(params.length > 0){
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
      }
    } else {
      notificationTip('操作提醒', '未选中数据');
    }
    //
  };
  componentDidMount() {
    this.handleRequset();
  }
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: props => <EditableCell auth={this.props.auth} {...props} />,
      },
    };
    const columns = this.columns.map(col => {
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
    const props= this.props
    return (
      <div className={style.main}>
          <div className={style.mainHeight}>
            <h3 className={style.listTitle}>学习人员</h3>
            <div className={style.rightTopTogs}>
                {((this.props.auth && props.permission.indexOf('INSIDELTRAINING_EDIT-STAFF-IN-TRAIN')!==-1)?true:false) && (
                    <AddModal
                      rightData={this.props.rightData}
                      handleAddUpdateTabel={this.handleAddUpdateTabel}
                      menu = {this.props.menu}
                    />
                  )}
                  {props.permission.indexOf('INSIDELTRAINING_EDIT-STAFF-IN-TRAIN')!==-1 && (
                  <PublicButton
                    name={'删除'}
                    title={'删除'}
                    icon={'icon-shanchu'}
                    afterCallBack={this.handleDelete}
                    verifyCallBack={this.hasRecord}
                    res={'MENU_EDIT'}
                    useModel={true}
                    edit={true}
                    show={this.props.auth}
                    content={'你确定要删除吗？'}
                  />)}
                  {props.permission.indexOf('INSIDELTRAINING_EDIT-STAFF-IN-TRAIN')!==-1 && (
                  <PublicButton
                    name={'通知'}
                    title={'通知'}
                    icon={''}
                    afterCallBack={this.handleTZ}
                    // verifyCallBack={this.hasRecord}
                    show={this.props.auth}
                    res={'MENU_EDIT'}
                    // useModel={true}
                    edit={true}
                    // content={'你确定要删除吗？'}
                  />)}
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
                      // if (target.length > 0) {
                      //   const is_tz = target.every(item => item.isTz + '' === '0');
                      //   this.setState({ is_tz });
                      // } else {
                      //   this.setState({ is_tz: false });
                      // }

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
                    this.handleRequset(pageSize,current);
                  }}
                />
            </div>
          </div>
      </div>
     
    );
  }
}
export default EditableTable;
