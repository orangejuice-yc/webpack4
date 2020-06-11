import React, { Component } from 'react';
import { Table, Input, Button, Popconfirm, Form } from 'antd';
import style from './style.less';
import PublicButton from '@/components/public/TopTags/PublicButton';
import AddModal from './AddModal';
import notificationTip from '@/utils/notificationTip';

import {
  updateTrainStaff,
  queryTrainStaffList,
  delTrainStaff,
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
    const { children, dataIndex, record, title } = this.props;
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
          <Input
            ref={node => (this.input = node)}
            type="number"
            onPressEnter={this.save}
            onBlur={this.save}
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
      },
      {
        title: '考试得分',
        dataIndex: 'score',
        editable: true,
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
      dataSource: [...this.state.dataSource, data],
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
  componentDidMount() {
    this.handleRequset();
  }
  render() {
    const { dataSource } = this.state;
    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
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
        }),
      };
    });

    return (
      <div className={style.container}>
        <h3 className={style.h3}>学习人员</h3>
        <div className={style.tools}>
          <AddModal
            rightData={this.props.rightData}
            handleAddUpdateTabel={this.handleAddUpdateTabel}
          />
          <PublicButton
            name={'删除'}
            title={'删除'}
            icon={'icon-shanchu'}
            afterCallBack={this.handleDelete}
            verifyCallBack={this.hasRecord}
            res={'MENU_EDIT'}
            useModel={true}
            edit={true}
            content={'你确定要删除吗？'}
          />
        </div>
        <Table
          size="small"
          components={components}
          rowKey={record => record.id}
          rowClassName={record =>
            record.id === (this.state.record && this.state.record.id) ? 'tableActivty' : ''
          }
          rowSelection={{ onChange: selectedRowKeys => this.setState({ selectedRowKeys }) }}
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
            this.handleRequset(current, pageSize);
          }}
        />
      </div>
    );
  }
}
export default EditableTable;
