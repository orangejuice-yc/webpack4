import React, { Component } from 'react';
import {Table} from 'antd';
import TopTags from './TopTags/index';
import style from './style.less';
// import '../../../../static/css/react-contextmenu.global.css';
import { connect } from 'react-redux';
import axios from '../../../../api/axios';
import {
  getGroupPlanColumns,
  getGroupPlanList,
} from '../../../../api/api';

import * as dataUtil from '../../../../utils/dataUtil';
import PublicTable from '../../../../components/PublicTable';
import ExtLayout from '../../../../components/public/Layout/ExtLayout';
import MainContent from '../../../../components/public/Layout/MainContent';
import Toolbar from '../../../../components/public/Layout/Toolbar';


export class GroupPlanExportExcel extends Component {
  constructor(props) {

    super(props);
    this.state = {
      year: (new Date().getFullYear()),
      currentPage: 1,
      pageSize: 10,
      data: [],
      width: '',
      groupCode: -1,
      activeIndex: null,
      rightData: null,
      selectArray: [],//选择计划
      commUnitMap: null,//计量单位
      precision: 2,
      colspan: 1,//专业名称跨列数
      columns:[]
    };
  }

  componentDidMount() {
    this.setState({
      columns : [
        {
          title: '标段号',
          dataIndex: 'sectionName',
          key: 'sectionName',
          width: 150,
          render: (text) => {
            if (text) {
              return <span title={text}>{text}</span>;
            } else {
              return '';
            }
          },
        },
        {
          title: '车站或区域',
          dataIndex: 'stationName',
          key: 'stationName',
          width: 150,
          render: (text) => {
            if (text) {
              return <span title={text}>{text}</span>;
            } else {
              return '';
            }
          },
        },
        {
          title: '项目',
          dataIndex: 'task',
          key: 'task',
          width: 200,
          render: (text) => {
            if (text) {
              return <span title={text}>{text}</span>;
            } else {
              return '';
            }
          },
        },
        {
          title: '设计总量',
          dataIndex: 'designTotal',
          key: 'designTotal',
          width: 120,
          render: (text) => {
            if (text) {
              return <span>{text}</span>;
            } else {
              return '0';
            }
          },
        },
        {
          title: this.state.year-1+'年累计已完成量',
          dataIndex: 'lastActTotal',
          key: 'lastActTotal',
          width: 200,
          render: (text) => {
            if (text) {
              return <span>{text}</span>;
            } else {
              return '0';
            }
          },
        },
        {
          title: this.state.year+'年开累计划完成量',
          dataIndex: 'XTotal',
          key: 'XTotal',
          width: 200,
          render: (text) => {
            if (text) {
              return <span>{text}</span>;
            } else {
              return '0';
            }
          },
        },
        {
          title: this.state.year+'年分月累计完成量',
          width: 960,
          dataIndex: 'monthTotal',
          key: 'monthTotal',
          children: [
            {
              title: '1月累计',
              dataIndex: 'm1',
              key: 'm1',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },
            {
              title: '2月累计',
              dataIndex: 'm2',
              key: 'm2',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '3月累计',
              dataIndex: 'm3',
              key: 'm3',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '4月累计',
              dataIndex: 'm4',
              key: 'm4',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '5月累计',
              dataIndex: 'm5',
              key: 'm5',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '6月累计',
              dataIndex: 'm6',
              key: 'm6',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '7月累计',
              dataIndex: 'm7',
              key: 'm7',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '8月累计',
              dataIndex: 'm8',
              key: 'm8',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '9月累计',
              dataIndex: 'm9',
              key: 'm9',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '10月累计',
              dataIndex: 'm10',
              key: 'm10',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '11月累计',
              dataIndex: 'm11',
              key: 'm11',
              width: 80,
              editable: true,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },          {
              title: '12月累计',
              dataIndex: 'm12',
              key: 'm12',
              editable: true,
              width: 80,
              render: (text) => {
                if (text) {
                  return <span>{text}</span>;
                } else {
                  return '0';
                }
              },
            },
          ],
        },
      ]
    })
    this.initDatas();
  }

  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref;
  };

  initDatas = () => {
    dataUtil.CacheOpenProjectByType("planExportExcel").getLastOpenProjectByTask((data) => {
      const { projectId, projectName } = data;
      this.getGroupPlanColumns(projectId,projectName);
    },"planExportExcel");
  }

  //加载数据
  openProject = (projectId, projectName) => {
    this.setState({
      selectProjectId: projectId,
      projectName: projectName,
    }, () => {
      this.table.getData()
    })
  }

  //获取专业名称列数
  getGroupPlanColumns = (projectId,projectName) =>{
    debugger;
    let year = this.state.year;
    let url = dataUtil.spliceUrlParams(getGroupPlanColumns(projectId || 0,year));
    axios.get(url).then(res => {
      let { data} = res.data;
      let colSpan = null;
      let srcColumns = this.state.columns;
      //要删除的值
      let delColumns = 0;
      //剔除原专业名称列
      srcColumns.map((item) =>{
        if (item.key.indexOf('wbs') != -1) {
          delColumns++;
        }
      })
      srcColumns.splice(2,delColumns);
      if (data) {
        data.map((item,index) => {
          //第一列赋值，用于跨列
          if (colSpan) {
            colSpan = 0;
          } else {
            colSpan = data.length;
          }
          let obj = {
            title: '专业名称',
            width: 100,
            dataIndex: item,
            key: item,
            editable: true,
            colSpan:colSpan,
            render: (text) => {
              if (text) {
                return <span title={text}>{text}</span>;
              } else {
                return '';
              }
            },
          }
          srcColumns.splice(2 + index, 0, obj);
        });
      }
      srcColumns.map((item, index) => {
        let title = srcColumns[index];
        if (item.key.indexOf('lastActTotal') != -1) {
          title['title'] = this.state.year - 1 + '年累计已经完成量';
        }
        if (item.key.indexOf('XTotal') != -1) {
          title['title'] = this.state.year + '年计划开累完成量';
        }
        if (item.key.indexOf('monthTotal') != -1) {
          title['title'] = this.state.year + '年分月累计完成量';
        }
      });
      this.openProject(projectId, projectName);
    });
  }


  //获取列表
  getPlanExcelList = (callBack) => {
    let year = this.state.year;
    let url = dataUtil.spliceUrlParams(getGroupPlanList(this.state.selectProjectId || 0,year));
    axios.get(url).then(res => {
      callBack(res.data.data ? res.data.data : []);
      this.setState({
        data: res.data.data,
        initData: res.data.data,
      });
    });
  };

  getRowData = (record) => {
    this.setState({
      record
    });
  };

  /**
   * 选择年
   */
  yearOnChange = (value) => {
    this.setState({
      year: value,
    });
  };

  search = () =>{
    this.initDatas();
  }

  render() {

    return (

      <ExtLayout renderWidth={({ contentWidth }) => {
        this.setState({ contentWidth });
      }}>
        <Toolbar>
          <TopTags yearOnChange={this.yearOnChange}
                   year={this.state.year}
                   refreshData={this.initDatas}
                   selectProjectId={this.state.selectProjectId}
                   table={this.table}
                   search={this.search}
          />
        </Toolbar>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={1500}>
          {(
            <PublicTable onRef={this.onRef} getData={this.getPlanExcelList}
                   columns={this.state.columns}
                   scroll={{ x: 1300, y: this.props.height - 500 }}
                   initLoadData={false}
                   getRowData={this.getRowData}
            />
          )}
        </MainContent>
      </ExtLayout>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  };
};


export default connect(mapStateToProps, null)(GroupPlanExportExcel);
