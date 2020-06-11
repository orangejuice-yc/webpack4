import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { Table, Calendar, Row, Col } from 'antd';

import TreeTable from '../../../components/PublicTable'
import PublicTable from '../../../components/PublicTable'

import style from './style.less';
import moment from 'moment';
/* *********** 引入redux及redux方法 start ************* */
import { connect } from 'react-redux';
import axios from '../../../api/axios';
import { getUserRsrc, geteuipRsrc, getAnalysisList, getAnalysisStatus } from '../../../api/api';
import TopTags from './TopTags/index';
import RightTags from '../../Components/RightDragAndDrop';
import MyIcon from '../../../components/public/TopTags/MyIcon';
import * as dataUtil from '../../.../../../utils/dataUtil';
class TableComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '人力资源',
      initDone: false,
      listData: [],
      selectedValue: moment('2017-01-25'),
      data1: [],
      view: 'user',
      initData: [],
    };

  }

  //注册 父组件即可调用子组件方法
  onRef = (ref) => {
    this.table = ref
  }

  //注册 父组件即可调用子组件方法
  onRefR = (ref) => {
    this.tableR = ref
  }

  //获取人力资源列表
  getUserRsrc = (callBack) => {
    const { initData,keywords } = this.state;
    if(keywords){
      let newData = initData;
      newData = dataUtil.search(initData, [{ 'key': 'rsrcUserName|rsrcUserCode', 'value': keywords }], true);
      callBack(newData)
      return;
    }
    axios.get(getUserRsrc).then(res => {
      callBack(res.data.data ? res.data.data : [])
      this.setState({
        data1: res.data.data,
        data2: res.data.data,
        initData: res.data.data,
      }, () => {
        const { data1 } = this.state;
        let flag = true;
        let findPeoRes = (array) => {
          if (flag) {
            array.forEach(item => {
              if (item.rsrcUserType == 'user' && flag) {
                this.setState({
                  rightData: item,
                }, () => {
              
                  this.getAnalysisStatus();
                });
                flag = false;
                return;
              } else {
                if (item.children) {
                  findPeoRes(item.children);
                }
              }

            });
            return;
          } else {
            return;
          }

        };
        findPeoRes(data1);
      });
    });
  };
  //搜索
  search = (value) => {
    this.setState(
      { keywords : value},() => {
        this.table.getData();
      });
  };
  //获取设备资源列表
  getEquip = (callBack) => {
    const { initData,keywords } = this.state;
    if(keywords){
      let newData = initData;
      newData = dataUtil.search(initData, [{ 'key': 'equipName|equipCode', 'value': keywords }], true);
      callBack(newData)
      return;
    }
    axios.get(geteuipRsrc).then(res => {
      callBack(res.data.data ? res.data.data : [])
      this.setState({
        data1: res.data.data,
        data2: res.data.data,
        initData: res.data.data,
      }, () => {
        const { data1 } = this.state;
        if (data1.length > 0) {
          this.setState({
            rightData: data1[0],
            activeIndex: data1[0].id,
          }, () => {
            this.getAnalysisStatus();
          });
        }
      });
    });
  };
  //切换资源
  switchRes = (menu) => {
    this.setState({
      view: menu
    });

  };
  //
  getAnalysisStatus = () => {
    const { selectedValue, rightData, view } = this.state;
    if (this.state.view == 'user') {
      if (this.state.rightData.rsrcUserType != 'user') {
        return;
      }
    }
    let year = selectedValue.year();
    let month = selectedValue.month() + 1;
    axios.get(getAnalysisStatus(rightData.id, view, year, month)).then(res => {
      this.setState({
        listData: res.data.data,
      });
    });
  };

  componentDidMount() {
    this.setState({
      selectedValue: moment(new Date()),
    });
  }

  getInfo = (record, index) => {

    this.setState({
      activeIndex: id,
      rightData: record,
    }, () => {
      this.tableR.getData();
      this.getAnalysisStatus();
    });

  };
  getListData = (value) => {

    const { selectedValue, listData } = this.state;
    let month = selectedValue.month();
    if (value.month() == month) {
      let index = listData.findIndex(item => item.day == value.date());
      if (index > -1) {
        if (listData[index].status == 'used') {
          return <div className={style.usedlDate}>{value.date()}</div>;
        }
        if (listData[index].status == 'conflict') {
          return <div className={style.conflictDate}>{value.date()}</div>;
        }
      }
      return <div className={style.normalDate}>{value.date()}</div>;
    } else {
      return <div className={style.normalDate}>{value.date()}</div>;
    }
  };
  dateFullCellRender = (value) => {
    const listData = this.getListData(value);
    return listData;
  };

  //获取分析列表
  getAnalysisList = (callBack) => {
    
    const { rightData, view, selectedValue } = this.state;
    if (this.state.view == 'user') {
      callBack([])
      if (this.state.rightData.rsrcUserType != 'user') {

        return;
      }
    }
    axios.get(getAnalysisList(rightData.id, view, selectedValue.format('YYYY-MM-DD'))).then(res => {
      callBack(res.data.data ? res.data.data : [])
      this.setState({
        data: res.data.data,
      });
    });
  };
  onSelect = (value) => {
    if (value.format('YYYY-MM-DD') == this.state.selectedValue.format('YYYY-MM-DD')) {
      return;
    }
    this.setState({
      selectedValue: value,
    }, () => {

    });
  };

  onPanelChange = (selectedValue) => {
    this.setState({ selectedValue }, () => {
      this.getAnalysisStatus();
    });
  };

  getNullMethod = ()=>{
    
  }

  render() {
    const { intl } = this.props.currentLocale;
    const columns1 = [
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
        dataIndex: 'rsrcUserName',
        key: 'rsrcUserName',
        width:'50%',
        render: (text, record) => dataUtil.getIconCell("user", text, record.rsrcUserType)
      },
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
        dataIndex: 'rsrcUserCode',
        key: 'rsrcUserCode',
      },
    ];
    const columns2 = [
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrcname'),
        dataIndex: 'equipName',
        key: 'equipName',
        render: (text, record) => dataUtil.getIconCell("equip", text)
      },
      {
        title: intl.get('wsd.i18n.rsrc.rsrclist.rsrccode'),
        dataIndex: 'equipCode',
        key: 'equipCode',
      },
    ];
    const columns = [
      {
        title: intl.get('wsd.i18n.rsrc.analysis.projectname'),
        dataIndex: 'projectName',
        key: 'projectName',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.wbsname'),
        dataIndex: 'wbsName',
        key: 'wbsName',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.taskname'),
        dataIndex: 'taskName',
        key: 'taskName',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.planstarttime'),
        dataIndex: 'planStartDate',
        key: 'planStartDate',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.planendtime'),
        dataIndex: 'planEndDate',
        key: 'planEndDate',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.rsrcrole'),
        dataIndex: 'rsrcRole',
        key: 'rsrcRole',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.unit'),
        dataIndex: 'unit',
        key: 'unit',
        render: (text, record) => {
          if (text == "hour") {
            return "小时";
          } else if (text == "tower") {
            return "台";
          }
        }
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.maxunitnum'),
        dataIndex: 'maxUnit',
        key: 'maxUnit',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.plannum'),
        dataIndex: 'planQty',
        key: 'planQty',
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.actstarttime'),
        dataIndex: 'actStartDate',
        key: 'actStartDate',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.actendtime'),
        dataIndex: 'actEndDate',
        key: 'actEndDate',
        render: (text) => dataUtil.Dates().formatDateString(text)
      },
      {
        title: intl.get('wsd.i18n.rsrc.analysis.actnum'),
        dataIndex: 'actQty',
        key: 'actQty',
      },
    ];

    return (
      <div>
        <TopTags switchRes={this.switchRes} search={this.search} view={this.state.view} />
        <div className={style.main}>
          <div className={style.leftMain} style={{ height: this.props.height }}>
            {
              this.state.view == 'user' && (
                <TreeTable onRef={this.onRef} getData={this.getUserRsrc}
                  pagination={false} columns={columns1}
                  scroll={{ x: '100%', y: this.props.height - 50 }}
                  getRowData={this.getInfo}
                />
              )
            }
            {this.state.view !== 'user' &&
              (
                <PublicTable istile = {true} onRef={this.onRef} getData={this.getEquip}
                  pagination={false} columns={columns2}
                  scroll={{ x: 1200, y: this.props.height - 50 }}
                  getRowData={this.getInfo}
                />
              )}
          </div>
          <div className={style.rightBox}>
            <RightTags>
              <section style={{ height: this.props.height }}>
                <span
                  className={style.time}>{`当前日期：${this.state.selectedValue && this.state.selectedValue.format('YYYY-MM-DD')}`}</span>
                <Calendar value={this.state.selectedValue} onSelect={this.onSelect} onPanelChange={this.onPanelChange}
                  dateFullCellRender={this.dateFullCellRender} />

                <div className={style.tableStyle}>
                  <div style={{ minWidth: 'calc(1100px)' }}>
                  {this.state.rightData  && (
                      <PublicTable  onRef={this.onRefR} getData={this.getAnalysisList}
                        pagination={false} columns={columns}
                        getRowData={this.getNullMethod}
                        scroll={{ x: 1200, y: this.props.height - 50 }}
                      />
                    )}
                  </div>
                </div>
              </section>
            </RightTags>
          </div>
        </div>

      </div>
    );
  }
}


const mapStateToProps = state => {
  return {
    currentLocale: state.localeProviderData,
  };
};


export default connect(mapStateToProps, null)(TableComponent);
