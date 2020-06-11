import React, { Component } from 'react';
import { Row, Col, Table, Icon, Menu, notification } from 'antd';
import intl from 'react-intl-universal';
import style from './style.less';
import Collect from '@/modules/Doc/SzxmProDoc/Collect';
// import Manage from './Manage/index';
import TopTags from './TopTags/index';
import RightTags from '@/components/public/RightTags';
import MyIcon from '@/components/public/TopTags/MyIcon';
import { connect } from 'react-redux';
import * as util from '@/utils/util';
import axios from '@/api/axios';
import TreeTable from '@/components/PublicTable';
import PageTable from '@/components/PublicTable';
import {
  docProjectFolderTree,
  docProjectList,
  docProjectDel,
  docFileInfo,
  docFavoriteCancelCollection,
  getproInfo,
  docGivingList,
} from '@/api/api';
import { docProjectFolderTree_ } from '@/api/suzhou-api';
import { docProjectSzxm, getFolderByMenuName } from '@/modules/Suzhou/api/suzhou-api';
import * as dataUtil from '@/utils/dataUtil';
import ExtLayout from '@/components/public/Layout/ExtLayout';
import LeftContent from '@/components/public/Layout/LeftContent';
import MainContent from '@/components/public/Layout/MainContent';
import Toolbar from '@/components/public/Layout/Toolbar';
import SelectSectionBtn from '@/modules/Suzhou/components/SelectBtn/SelectSectionBtn';
import SelectProjectBtn from '@/components/public/SelectBtn/SelectProjectBtn';
import PublicMenuButton from '@/components/public/TopTags/PublicMenuButton';
class ProjectDoc extends Component {
  state = {
    collectVisible: false,
    DroVisible: false,
    // MangageDocVisible: false,
    rowKey: '',
    rightHide: true,
    rightData: null,
    LeftData: [],
    leftData: null,
    rightList: [],
    projectData: [],
    projectId: null,
    total: 0,
    pageSize: 10,
    currentPage: 1,
    selectedRowKeys: [],
    selectedRows: [],
    collectReact: null,
    selectKey: '',
    contentMenu: [
      //   { name: '管理文件夹', fun: 'folder', type: 'buttom', icon: 'folder', isPublic: false },
    ],
    sectionId: '',
    currentPageNum: 1,
  };

  /**
   @method 父组件即可调用子组件方法
   @description 父组件即可调用子组件方法
   */
  onRef = ref => {
    this.leftTable = ref;
  };
  /**
   @method 父组件即可调用子组件方法
   @description 父组件即可调用子组件方法
   */
  onRefR = ref => {
    this.rightTable = ref;
  };

  componentDidMount() {
    this.initDatas();
  }
  // 初始化数据
  initDatas = () => {
    dataUtil.CacheOpenProject().getLastOpenProjectByTask(data => {
      const { projectId, projectName } = data;
      if (projectId) {
        this.setState(
          {
            projectId,
            projectName,
          },
          () => {
            //标段
            dataUtil.Favorites().list('lastOpenSection', res => {
              if (!res.data.data) {
                //收藏  无标段
                this.setState(
                  {
                    sectionId: 0,
                  },
                  () => {
                    this.rightTable.getData();
                  }
                );
              } else {
                //收藏  有标段
                this.setState(
                  {
                    sectionId: res.data.data,
                  },
                  () => {
                    this.rightTable.getData();
                  }
                );
                sessionStorage.setItem(
                  'lastOpenSection',
                  JSON.stringify({ sectionId: res.data.data })
                );
                return;
              }
            });
          }
        );
      }
    });
  };

  //打开项目
  openProject = (projectId, projectInfo) => {
    this.setState(
      {
        projectId,
        projectName: projectInfo.projectName,
        sectionId: 0,
      },
      () => {
        this.leftTable.getData();
        sessionStorage.setItem('lastOpenSection', '');
        const addArr = [{ bizType: 'lastOpenSection', bizs: [] }];
        dataUtil.Favorites().listRest(addArr);
      }
    );
  };
  //打开标段
  openSection = sectionId => {
    const { projectId } = this.state;
    this.setState(
      {
        sectionId: sectionId.length > 0 ? sectionId : 0,
      },
      () => {
        this.rightTable.getData();
        // this.getDataList(this.state.currentPageNum, this.state.pageSize, () => {});
      }
    );
  };

  /**
   * 获取表格数据
   *
   * @returns {null}
   */
  findLeftDataList = () => {
    return this.leftTable.findDataList();
  };

  // 获取项目文件夹列表
  getLeftDataList = callback => {
    dataUtil.CacheOpenProject().getLastOpenProjectByTask(data => {
      const { projectId, projectName } = data;
      if (projectId) {
        this.setState(
          {
            projectId,
            projectName,
          },
          () => {
            this.getProjectDocList(callback);
          }
        );
      } else {
        callback([]);
      }
    });
  };

  // 获取项目文件夹列表
  getProjectDocList = callBack => {
    let { projectId } = this.state;
    axios.get(getproInfo(projectId)).then(res => {
      if (res.data.data) {
        axios
          .post(
            getFolderByMenuName(projectId, this.props.menuInfo.menuName) +
              `?name=${this.state.searchValue ? this.state.searchValue : ''}&docSearchType=${
                this.state.selectKey ? this.state.selectKey : ''
              }`
          )
          .then(res => {
            const { data } = res.data;
            callBack(data ? data : []);
            if (res.data.data && res.data.data.length > 0) {
              this.rightTable.getLineInfo(data[0]);
              this.setState({
                data,
              });
            } else {
              this.setState({
                data,
              });
            }
          });
      } else {
        callBack([]);
      }
    });
  };

  //收藏
  collect(record) {
    if (record.isFavorite) {
      const { startContent } = this.state;
      let url = dataUtil.spliceUrlParams(docFavoriteCancelCollection, { startContent });
      axios.deleted(url, { data: [record.id] }).then(res => {
        this.update();
      });
    } else {
      this.setState({ collectVisible: true, collectReact: record });
    }
  }

  collectHandleCancel = () => {
    this.setState({
      collectVisible: false,
    });
  };

  manageHandleCancel = () => {
    // 刷新
    this.leftTable.getData();
    // this.setState({
    //   MangageDocVisible: false,
    // });
  };

  //右侧表格点击行事件
  getInfo = record => {
    this.setState({
      rightData: record,
    });
  };

  //左侧表格点击事件
  getLeftInfo = record => {
    const { projectName } = this.state;
    this.setState(
      {
        leftRecord: record,
        startContent: '项目【' + projectName + '】,文件夹【' + record.name + '】',
        selectedRowKeys: [],
        rightList: [],
        rightData: null,
      },
      () => {
        this.rightTable.getData();
      }
    );
  };
  /**
   * 获取复选框 选中项、选中行数据
   * @method
   * @param {string} selectedRowKeys 复选框选中项
   * @param {string} selectedRows  行数据
   */
  getSelectedRowKeys = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  };
  //右键操作 管理文件夹
  //   rightClick = e => {
  //     this.setState({ MangageDocVisible: true });
  //   };

  RightHide = v => {
    this.setState({ rightHide: false });
  };
  rightIconBtn = () => {
    this.setState({ rightHide: true });
  };

  //   queryDocSearchType = key => {

  //     this.setState(
  //       {
  //         selectKey: key,
  //       },
  //       () => {
  //         this.leftTable.getData();
  //       }
  //     );
  //   };

  //文件夹数据修改
  forceNameUpdate = newdata => {
    this.setState(
      {
        newdata,
        isStaticRefresh: true,
      },
      () => {
        this.leftTable.getData();
      }
    );
  };
  //删除文件夹
  deleteFile = data => {
    this.setState({
      data,
      leftRecord: null,
      rightList: [],
      rightData: null,
      selectedRowKeys: [],
    });
  };
  //获取项目文档列表
  getDataList = (currentPageNum, pageSize, callBack) => {
    let { leftRecord, searchValue, selectKey, projectId } = this.state;
    let flag = 'false';
    let folderId = 0;
    if (leftRecord && leftRecord.type == 'project') {
      flag = 'true';
    } else if (leftRecord) {
      folderId = leftRecord.id;
    }
    if (leftRecord) {
      axios
        .post(
          docProjectSzxm(
            projectId,
            folderId,
            leftRecord.type,
            flag,
            pageSize,
            currentPageNum,
            this.state.sectionId
          ) + `?name=${searchValue ? searchValue : ''}&docSearchType=${selectKey ? selectKey : ''}`
        )
        .then(res => {
          callBack(res.data.data);
          this.setState({
            rightList: res.data.data,
            total: res.data.total,
            selectedRowKeys: [],
            rightData: null,
            tableData: res.data.data,
          });
        });
    } else {
      callBack([]);
    }
  };

  //刷新项目文档列表列表
  update = () => {
    if (this.state.rightList.length || this.state.leftRecord) {
      this.rightTable.getData();
    }
  };

  //修改文档列表
  updateData = newData => {
    let { rightList, rightData } = this.state;
    this.rightTable.update(rightData, newData);
  };

  //获取分发列表
  //  getDocGivingList=(callBack)=>{
  //   let { leftRecord, searchValue, selectKey,projectId } = this.state;
  //   let url = dataUtil.spliceUrlParams(docGivingList(leftRecord.id, leftRecord.type, leftRecord.type == "project" ? true : false,projectId),{name:searchValue || "",docSearchType : selectKey || "" })
  //   axios.post(url).then(res=>{
  //     callBack(res.data.data)
  //   })
  // }
  //删除校验
  deleteVerifyCallBack = () => {
    let { selectedRowKeys, rightData } = this.state;
    const { intl } = this.props.currentLocale;
    if (selectedRowKeys.length == 0) {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: intl.get('wsd.global.tip.title2'),
        description: intl.get('wsd.global.tip.content2'),
      });
      return false;
    } else {
      return true;
    }
  };
  //删除文档
  deleteData = () => {
    let { selectedRowKeys, rightList } = this.state;
    const { intl } = this.props.currentLocale;
    if (selectedRowKeys.length) {
      const { startContent } = this.state;
      let url = dataUtil.spliceUrlParams(docProjectDel, { startContent });
      axios.deleted(url, { data: selectedRowKeys }, true, '删除成功', true).then(res => {
        this.rightTable.getData();
      });
    } else {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: intl.get('wsd.global.tip.title2'),
        description: intl.get('wsd.global.tip.content1'),
      });
    }
  };

  //下载
  download = () => {
    let { rightData } = this.state;
    const { intl } = this.props.currentLocale;
    if (rightData) {
      const { startContent } = this.state;
      let url = dataUtil.spliceUrlParams(docFileInfo(rightData.fileId), { startContent });
      axios.get(url).then(res => {
        if (res.data.data) {
          util.download(res.data.data.fileUrl, res.data.data.fileName, res.data.data.id);
        }
      });
    } else {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: intl.get('wsd.global.tip.title2'),
        description: intl.get('wsd.global.tip.content1'),
      });
    }
  };

  distribute = () => {
    this.rightTable.getData();
  };

  //  //分发回调
  updateSelectedRows = newData => {
    this.rightTable.getData();
  };

  //上传之后回调
  folderUpdate = newData => {
    this.rightTable.getData();
    this.leftTable.update(this.state.leftRecord, newData.docProjectFolderTreeVo);
  };

  /**
   * 修改数据
   *
   **/
  rightUpdateData = newData => {
    this.rightTable.updateData(newData);
  };
  /**
   * 刷新
   *
   */
  refreshRight = () => {
    this.rightTable.getData();
  };

  /**
   *  新增数据
   *
   **/
  rightAddData = newData => {
    this.rightTable.addData(newData, 'first');
    let { leftRecord } = this.state;
    let docNum = leftRecord.docNum || 0;
    this.leftTable.updateData({ ...leftRecord, docNum: docNum + 1 });
  };

  search = val => {
    if (this.state.projectId) {
      this.setState(
        {
          searchValue: val,
        },
        () => {
          this.findLeftDataList(this.state.projectId);
          this.rightTable.getData();
        }
      );
    } else {
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 2,
        message: '未选中数据',
        description: '请选择项目进行操作',
      });
    }
  };
  eyeClick = record => {
    const { intl } = this.props.currentLocale;

    let arr = [
      'html',
      'txt',
      'jpg',
      'jpeg',
      'gif',
      'png',
      'art',
      'au',
      'aiff',
      'xbm',
      'pdf',
      'doc',
      'docx',
      'rtf',
      'xls',
      'xlsx',
      'csv',
    ];
    if (record.fileId) {
      const { startContent } = this.state;
      let url = dataUtil.spliceUrlParams(docFileInfo(record.fileId), { startContent });
      axios.get(url).then(res => {
        if (res.data.data && res.data.data.fileUrl) {
          let type = res.data.data.fileName ? res.data.data.fileName.substring(res.data.data.fileName.lastIndexOf(".")+1) : '';
          if (type) {
            type = type.toLowerCase();
          }
          let index = arr.findIndex(item => item == type);
          if (index != -1) {
            if (
              res.data.data.fileViewUrl &&
              (type == 'doc' ||
                type == 'docx' ||
                type == 'rtf' ||
                type == 'xls' ||
                type == 'xlsx' ||
                type == 'csv')
            ) {
              window.open(res.data.data.fileViewUrl);
            } else {
              window.open(res.data.data.fileUrl);
            }
          } else {
            dataUtil.message(intl.get('wsd.global.hint.docwarning'));
          }
        }
      });
    } else {
      dataUtil.message(intl.get('wsd.i18n.doc.compdoc.hinttext'));
    }
  };
  wordType = () => {
  };
  //===========================================================================================

  render() {
    const { intl } = this.props.currentLocale;
    const LeftColumns = [
      {
        title: intl.get('wsd.i18n.doc.compdoc.foldername'), //文件夹名称
        dataIndex: 'name',
        key: 'name',
        width: '80%',
        render: (text, record) => (
          <span title={text}>
            <MyIcon
              type={record.type != 'project' ? 'icon-wenjianjia' : 'icon-xiangmu'}
              className={style.leftTableIcon}
            />
            {text}
          </span>
        ),
      },
      {
        title: ' ', //文档数量
        dataIndex: 'docNum',
        key: 'docNum',
      },
    ];

    const RightColumns = [
      {
        title: intl.get('wsd.i18n.doc.temp.title'), //文档标题
        dataIndex: 'docTitle',
        key: 'docTitle',
        width: '15%',
        render: (text, record) => (
          <span title={text}>
            {' '}
            <MyIcon
              type={record.isFavorite ? 'icon-shoucang1' : 'icon-shoucang2'}
              onClick={this.collect.bind(this, record)}
              className={style.icon}
            />{' '}
            <MyIcon
              type="icon-chakan"
              className={style.icon}
              onClick={this.eyeClick.bind(this, record)}
            />
            {text}
          </span>
        ),
      },
      {
        title: '标段名称', //标段名称
        dataIndex: 'section',
        key: 'section',
        width: '200px',
        render: text => (text ? text.name : ''),
      },
      {
        title: intl.get('wsd.i18n.doc.compdoc.docserial'), //文档编号
        dataIndex: 'docNum',
        key: 'docNum',
        width: '10%',
      },
      {
        title: intl.get('wsd.i18n.doc.compdoc.docclassify'), //文档类别
        dataIndex: 'docClassify',
        key: 'docClassify',
        width: '10%',
        render: text => (text ? text.name : ''),
      },
      {
        title: intl.get('wsd.i18n.doc.temp.author'), //作者
        dataIndex: 'author',
        key: 'author',
        width: '10%',
      },
      {
        title: intl.get('wsd.i18n.doc.temp.versions'), //版本
        dataIndex: 'version',
        key: 'version',
        width: '10%',
      },
      {
        title: intl.get('wsd.i18n.plan.feedback.creattime'), //创建时间
        dataIndex: 'creatTime',
        key: 'creatTime',
        width: '15%',
        render: text => dataUtil.Dates().formatDateString(text),
      },
      {
        title: intl.get('wsd.i18n.doc.compdoc.babelte'), //上传人
        dataIndex: 'creator',
        key: 'creator',
        width: '10%',
        render: text => (text ? text.name : ''),
      },
      {
        title: intl.get('wsd.i18n.doc.compdoc.docstate'), //文档状态
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: text => (text ? text.name : ''),
      },
    ];

    const startContent =
      '项目【' +
      this.state.projectName +
      '】,文件夹【' +
      (this.state.leftRecord ? this.state.leftRecord.name : null) +
      ',文档【' +
      (this.state.rightData ? this.state.rightData.docTitle : null) +
      '】';
    return (
      <ExtLayout
        renderWidth={({ contentWidth }) => {
          this.setState({ contentWidth });
        }}
      >
        <LeftContent width={300}>
          <Toolbar>
            {/*选择项目*/}
            <SelectProjectBtn haveTaskAuth={true} openProject={this.openProject} />
            {/* 选择标段 */}
            <SelectSectionBtn openSection={this.openSection} data1={this.state.projectId} />
            {/*全部文档*/}
            {/* <PublicMenuButton title={"全部文档"} afterCallBack={this.queryDocSearchType} icon={"icon-wendangleixingshitu"} currentIndex={this.state.selectKey == "" ? 0 : this.state.selectKey == "mine" ? 1 : 2}
              menus={[
              { key: "mine", label: "我的文档", edit: true },
              { key: "docAuth", label: "传递文档", edit: true }]}
              iconSize={16} iconVerticalAlign={"text-bottom"}
            /> */}
          </Toolbar>
          <TreeTable
            onRef={this.onRef}
            getData={this.getLeftDataList}
            columns={LeftColumns}
            contentMenu={this.state.contentMenu}
            scroll={{ x: '100%', y: this.props.height - 100 }}
            getRowData={this.getLeftInfo}
            // rightClick={this.rightClick}
          />
        </LeftContent>
        <MainContent contentWidth={this.state.contentWidth} contentMinWidth={600}>
          <PageTable
            onRef={this.onRefR}
            rowSelection={true}
            pagination={true}
            useCheckBox={true}
            dataSource={this.state.rightList}
            onChangeCheckBox={this.getSelectedRowKeys}
            checkboxStatus={item => {
              return item.auth != 1;
            }}
            getData={this.getDataList}
            columns={RightColumns}
            scroll={{ x: '1500px', y: this.props.height - 100 }}
            getRowData={this.getInfo}
            total={this.state.total}
          />
        </MainContent>
        <Toolbar>
          {' '}
          <TopTags
            projectData={this.state.projectData}
            projectId={this.state.projectId}
            openProject={this.openProject}
            openSection={this.openSection}
            rightUpdateData={this.rightUpdateData}
            rightAddData={this.rightAddData}
            leftData={this.state.leftRecord}
            rightData={this.state.rightData}
            deleteData={this.deleteData}
            download={this.download}
            distribute={this.distribute}
            selectedRows={this.state.selectedRows}
            updateSelectedRows={this.updateSelectedRows}
            folderUpdate={this.folderUpdate}
            bizType="task"
            wordType={this.wordType}
            search={this.search}
            initDatas={this.initDatas}
            startContent={this.state.startContent}
            openWorkFlowMenu={this.props.openWorkFlowMenu}
            selectProjectName={this.state.projectName}
            deleteVerifyCallBack={this.deleteVerifyCallBack}
            refreshRight={this.refreshRight}
            getDocGivingList={this.getDocGivingList}
          />
        </Toolbar>
        <RightTags
          rightTagList={this.state.rightTags}
          rightData={this.state.rightData}
          rightHide={this.RightHide}
          rightIconBtn={this.rightIconBtn}
          projectId={this.state.projectId}
          updateData={this.updateData}
          editAuth={this.state.rightData && this.state.rightData.auth == 1 ? true : false}
          classifyEditAuth={this.state.rightData && this.state.rightData.auth == 1 ? true : false}
          bizType="projectdoc"
          openWorkFlowMenu={this.props.openWorkFlowMenu}
          callBackBanner={this.props.callBackBanner}
          menuCode={this.props.menuInfo.menuCode}
          menuInfo={this.props.menuInfo}
          startContent={this.state.startContent}
          extInfo={{ startContent }}
        />
        {/* 收藏 */}

        {this.state.collectVisible && (
          <Collect
            modalVisible={this.state.collectVisible}
            handleCancel={this.collectHandleCancel}
            record={this.state.collectReact}
            update={this.update}
            startContent={this.state.startContent}
          />
        )}
        {/* 管理文件夹 */}
        {/* {this.state.MangageDocVisible && (
          <Manage
            modalVisible={this.state.MangageDocVisible}
            data={this.state.data}
            deleteFile={this.deleteFile}
            findLeftDataList={this.findLeftDataList}
            handleCancel={this.manageHandleCancel}
            upDate={this.forceNameUpdate}
            projectId={this.state.projectId}
            projectName={this.state.projectName}
          />
        )} */}
      </ExtLayout>
    );
  }
}

/* *********** connect链接state及方法 start ************* */
export default connect(state => ({
  currentLocale: state.localeProviderData,
}))(ProjectDoc);
/* *********** connect链接state及方法 end ************* */
