import React from 'react';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import RightTags from '@/components/public/RightTags';
import TopTags from './TopTags';
import TableComponent from '@/components/PublicTable';
import axios from '@/api/axios';
import { queryQuaSuperv, deleteQuaSuperv } from '@/api/suzhou-api';
import { handleGetProjectIdAndSectionIds } from '@/utils/dataUtil';
import notificationFun from '@/utils/notificationTip';

class Index extends React.Component {
  state = {
    rightData: null, // 选中数据
    data: null, // 表格数据
    total: 0,
    selectedRowKeys: [], // 分页器选中数据
    projectId: '',
    sectionIds: '',
  };
  // 增加
  handleAdd = data => {
    this.setState(({ table }) => ({
      table: { ...table, data: [...table.data, data], total: table.total + 1 },
    }));
  };
  // 删除
  handleDelete = () => {
    const { selectedRowKeys, rightData, table, params } = this.state;
    axios.deleted(deleteQuaSuperv(), { data: selectedRowKeys }, true).then(res => {
      // 当前页全删除 判断当前的页数如果大于1 那么调用上一页的接口
      if (table.data.length === selectedRowKeys.length && table.page > 1) {
        this.handleAsyncRequest(this.state.params, table.size, table.page - 1);
      } else {
        // 调用当前页的接口刷新
        this.handleAsyncRequest(this.state.params, table.size, table.page);
      }
      // 如果删除的数据中存在选择的数据那么清空
      if (rightData) {
        this.setState({
          rightData: selectedRowKeys.some(id => rightData.id === id) ? null : rightData,
        });
      }
      this.setState({
        selectedRowKeys: [],
      });
    });
  };
  // 更新
  handleUpdate = data => {
    this.setState({
      rightData: { ...this.state.rightData, ...data },
      tableData: this.state.tableData.map(item =>
        item.id === data.id ? { ...item, ...data } : item
      ),
    });
  };
  // 搜索
  handleSearch = value => {
    if (!this.state.params.projectId) return notificationFun('请选择项目');

    this.setState(
      ({ params }) => ({ params: { ...params, ...value } }),
      () => this.handleAsyncRequest(this.state.params)
    );
  };
  render() {
    return (
      <ExtLayout
        renderWidth={({ contentWidth }) => {
          this.setState({ contentWidth });
        }}
      >
        <Toolbar>
          <TopTags
            projectId={this.state.params.projectId}
            selectedRowKeys={this.state.selectedRowKeys}
            handleAdd={this.handleAdd}
            handleDelete={this.handleDelete}
            handleGetProjectId={this.handleGetProjectId}
            handleOpenSection={this.handleOpenSection}
            handleSearch={this.handleSearch}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1500}>
          <TableComponent
            onRef={ref => (this.table = ref)}
            columns={columns}
            pagination={true}
            rowSelection={true}
            useCheckBox={true}
            getRowData={() => {}}
            getData={() => {}}
          />
        </MainContent>
        <RightTags
          menuCode={this.props.menuInfo.menuCode}
          groupCode={1}
          rightData={this.state.rightData}
          handleUpdate={this.handleUpdate}
          handleUpdateSchedule={this.handleUpdateSchedule}
          // 文件信息需要
          projectId={this.state.projectId}
          menuId={this.props.menuInfo.id}
          bizType={this.props.menuInfo.menuCode}
          bizId={this.state.rightData ? this.state.rightData.id : null}
          fileEditAuth={true}
          extInfo={{ startContent: '质量报监' }}
        />
      </ExtLayout>
    );
  }
  initData = () => {
    handleGetProjectIdAndSectionIds()
      .then(result => {
        this.setState(
          ({ params }) => ({ params: { ...params, ...result } }),
          () => this.handleAsyncRequest(this.state.params)
        );
      })
      .catch(err => {
      });
  };
  componentDidMount() {}
  // 获取表格数据
  handleAsyncRequest = (args, size = 10, page = 1) => {
    axios.get(queryQuaSuperv(size, page), { params: { ...args, type: 0 } }).then(res => {
      const { total, data } = res.data;
      this.setState({
        table: { data, total, size, page },
      });
    });
  };
  // 获取项目id
  handleGetProjectId = (...args) => {
    const [, projectId] = args;
    this.setState(
      () => ({ params: { projectId } }),
      () => this.handleAsyncRequest(this.state.params)
    );
  };
  // 获取标段
  handleOpenSection = sectionIds => {
    this.setState(
      ({ params }) => ({
        params: { projectId: params.projectId, sectionIds: sectionIds.join(',') },
      }),
      () => this.handleAsyncRequest(this.state.params)
    );
  };
  // 设置选中表格颜色
  handleSetRowClassName = record => {
    if (this.state.rightData) {
      return Object.is(record.id, this.state.rightData.id) ? 'tableActivty' : '';
    } else {
      return '';
    }
  };
}

const columns = [
  {
    title: '项目名称',
    dataIndex: 'projectName',
  },
  {
    title: '标段名称',
    dataIndex: 'sectionName',
  },
  {
    title: '施工单位',
    dataIndex: 'sgdw',
  },
  {
    title: '业主代表',
    dataIndex: 'yzdb',
  },
  {
    title: '监理单位',
    dataIndex: 'jldw',
  },
  {
    title: '确认状态',
    dataIndex: 'isConfirmVo',
    render: ({ name }) => name,
  },
  {
    title: '登记证号',
    dataIndex: 'registerNum',
  },
  {
    title: '附件状态',
    dataIndex: 'fileStatusVo',
    render: ({ name }) => name,
  },
  {
    title: '创建人',
    dataIndex: 'creater',
  },
  {
    title: '创建时间',
    dataIndex: 'creatTime',
  },
];

export default Index;
