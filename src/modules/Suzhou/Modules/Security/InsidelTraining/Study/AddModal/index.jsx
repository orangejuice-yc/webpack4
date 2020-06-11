import React, { Component, Fragment } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { queryOrgPeopleList, addTrainStaff } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';
import style from './index.less';
import { Modal, Input, Divider, Checkbox, InputNumber, Button,notification } from 'antd';

class AddModal extends Component {
  state = {
    visible: false,
    workerName: [],
    orgList:[],
    workerCode: '',
    name: '',
    is_tz: false,
    canClick:true
  };
  componentDidMount(){
    // rightData.trainLearnTime
    // this.handleOnChageInput()
  }
  handleSubmit = type => {
    const {
      id,
      sectionId,
      projectId,
      sponsorDep,
      sponsorDepId,
      trainTypeVo,
    } = this.props.rightData;
    const object = {
      projectId: projectId,
      sectionId: sectionId,
      trainId: id,
      intExtStaff: 0,
      // dep: sponsorDep,
      // depId: sponsorDepId,
      trainType: trainTypeVo.name,
    };
    if(this.state.workerName.filter(item => item.score).length>0){
        const items = this.state.workerName
        .filter(item => item.score)
        .map(item => ({
          ...item,
          workerName: item.name,
          workerId: item.id,
          dep:item.orgName,
          depId:item.orgNameId,
          ...object,
          isTz: type,
          trainTime: new Date(this.props.rightData.trainTime).getTime(),
        }));
      const params = {
        code: type,
        users: items,
      };
      // console.log(this.props.menu);
      if(type == 1){
        const obj = {'url':this.props.menu.url,menuCode:this.props.menu.menuCode,'id':this.props.rightData.id,name:'myTraining'}
        params['url'] = JSON.stringify(obj);
      }
      // console.log(params);
      // code 0 -> 保存 1 -> 保存并继续
      if(this.state.canClick){
        this.setState({canClick:false})
        axios.post(addTrainStaff(), params, true).then(res => {
          const { data } = res.data;
          this.setState({
            visible: false,
            canClick:true
          });
          this.props.handleAddUpdateTabel(data);
        });
      }
      
    }else{
      notification.warning({
        placement: 'bottomRight',
        bottom: 50,
        duration: 1,
        message: '提示',
        description: '请输入考试得分',
      });
    }
  };
  //   this.props.form.validateFields((err, values) => {
  //     if (!err) {

  //       const params = this.state.params.map(item => ({ ...item, ...object }));
  //       axios.post(addTrainStaff(), params, true).then(res => {
  //         const { data, status } = res.data;
  //         if (status === 200) {
  //           this.setState({
  //             visible: false,
  //           });
  //           this.props.handleAddUpdateTabel(data);
  //         }
  //       });
  //     }
  //   });
  // };

  // handleChangeWorkerName = (...args) => {
  //   const [, props] = args;
  //   const arr = props
  //     .map(item => item.props)
  //     .map(item => ({
  //       workerId: item.value,
  //       workerName: item.children,
  //     }));
  //   this.setState({
  //     params: arr,
  //   });
  // };
  handleGetNames = () => {
    const _ = this.props.rightData;
    // console.log(this.props.rightData);
    const params = {
      sponsorDepId: _.trainTypeVo.code === '0' ? '' : _.sponsorDepId,
      // sponsorDep: _.sponsorDep,
      trainType: _.trainTypeVo.code,
      trainId:_.id
    };
    axios
      .get(queryOrgPeopleList, {
        params,
      })
      .then(res => {
        const { data } = res.data;
        const children = data[0] ? data[0].children : [];
        const arr = [];
        const orgList = [];
        if(this.props.rightData && (this.props.rightData.trainTypeVo.code == '0')){
          children.map(item => {
            if(!item.children){
            }else{
              item.children.map(subitem=>{
                if(orgList.indexOf(item.orgName) == -1){
                  orgList.push(item.orgName);
                }
                arr.push({id: subitem.userId, name: subitem.userName,orgName:item.orgName,orgNameId:item.id,learnTime:!this.props.rightData.trainLearnTime?0:this.props.rightData.trainLearnTime});
              })
            }
          })
          this.setState({
            workerName: arr,
            // orgList:orgList
          });
        }else{
          this.setState({
            // workerName: children.map(item => ({ id: item.userId, name: item.userName,orgName:data.orgName,orgNameId:data.id })),
            // orgName: data[0].orgName,
            // workerName: arr,
            workerName: children.map(item => ({ id: item.userId, name: item.userName,orgName:data[0].orgName,orgNameId:data[0].id,learnTime:!this.props.rightData.trainLearnTime?0:this.props.rightData.trainLearnTime})),
            // orgList:orgList
          });
        }
      });
  };
  // handleOnChange = (index, checked) => {
  //   const data = this.state.workerName;
  //   data[index] = {
  //     ...this.state.workerName[index],
  //     checked,
  //   };
  //   const items = this.state.workerName.filter(item => item.checked);
  //   this.setState({
  //     workerName: data,
  //     is_tz: items.length > 0,
  //   });
  // };
  handleOnChageInput = (value, index, key) => {
    const data = this.state.workerName;
    data[index] = {
      ...this.state.workerName[index],
      [key]: value,
    };
    this.setState({ workerName: data });
  };
  render() {
    const {rightData} = this.props;
    return (
      <Fragment>
        <PublicButton
          name={'新增'}
          title={'新增'}
          icon={'icon-add'}
          afterCallBack={() => {
            this.handleGetNames();
            this.setState({ visible: true });
          }}
          res={'MENU_EDIT'}
        />
        <Modal
          title="新增"
          width={800}
          destroyOnClose={true}
          centered={true}
          maskClosable={false}
          mask={false}
          visible={this.state.visible}
          footer={
            <div>
              <Button onClick={() => this.setState({ visible: false })}>取消</Button>
              <Button
                onClick={() => this.handleSubmit(0)}
                disabled={this.state.workerName.length === 0 && this.state.canClick}
              >
                保存
              </Button>
              <Button
                type="primary"
                disabled={this.state.workerName.length === 0 && this.state.canClick}
                onClick={() => this.handleSubmit(1)}
              >
                保存并通知
              </Button>
            </div>
          }
          // onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          {this.state.workerName.length > 0 ? (
            this.state.workerName.map((item, index,arr) => {
{/* 
              console.log(index)
              console.log(index == 0 || (arr[index-1] && (item.orgName != arr[index-1].orgName)));
              if(index == 0 || (item.orgName != arr[index-1].orgName)){
                console.log(`<Divider>${item.orgName}</Divider>`)
              } */}
              return (
                <div className={style.main}>
                    {(arr[index-1] && item.orgName != arr[index-1].orgName)&& (
                      <Divider>{item.orgName}</Divider>
                    )}
                    {index == 0 && (
                      <Divider>{item.orgName}</Divider>
                    )}
                   
                  <div className={style.item}>
                    {/* <Checkbox
                        style={{ width: 150, flexShrink: 0 }}
                        onChange={e => this.handleOnChange(index, e.target.checked)}
                      >
                        {item.name}
                      </Checkbox> */}
                    <span style={{ flexShrink: 0, width: 100 }}>{item.name}</span>
                    <div>
                      <span>学时（小时）</span>
                      <InputNumber
                        style={{ width: '100%' }}
                        type="number"
                        onChange={e => this.handleOnChageInput(e, index, 'learnTime')}
                        min={0}
                        max={999}
                        defaultValue={(!rightData||!rightData.trainLearnTime)?0:rightData.trainLearnTime}
                      />
                    </div>
                    <div>
                      <span>考试得分</span>
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => this.handleOnChageInput(e, index, 'score')}
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                  {/* <Divider /> */}
                </div>
              );
            })
          ) : null}
        </Modal>
      </Fragment>
    );
  }
}

export default AddModal;
