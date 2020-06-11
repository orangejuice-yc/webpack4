import React, { Component, Fragment } from 'react';
import PublicButton from '@/components/public/TopTags/PublicButton';
import { queryRyglPeopleList2, addTrainStaff } from '@/modules/Suzhou/api/suzhou-api';
import axios from '@/api/axios';

import style from './index.less';
import { Modal, Input, Divider, Checkbox, InputNumber, Button,notification } from 'antd';

class AddModal extends Component {
  state = {
    visible: false,
    workerName: [],
    workerCode: '',
    is_tz: false,
    canClick:true
  };
  handleSubmit = type => {
    const { id, sectionId, projectId, sponsorDep, sponsorDepId } = this.props.rightData;
    const object = {
      projectId: projectId,
      sectionId: sectionId,
      trainId: id,
      intExtStaff: 1,
      dep: sponsorDep,
      depId: sponsorDepId,
    };
    if(this.state.workerName.filter(item =>item.score).length > 0){
        const items = this.state.workerName
        .filter(item =>item.score)
        .map(item => ({
          ...item,
          workerName: item.name,
          workerId: item.id,
          ...object,
          isTz: type,
          workerDif:item.workTypeVo?item.workTypeVo.code:'',
          trainTime: new Date(this.props.rightData.trainTime).getTime(),
        }));
      const params = {
        code: type,
        users: items,
      };
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
          this.props.handleRequset();
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
  // handleOk = () => {
  //   this.props.form.validateFields((err, values) => {
  //     if (!err) {
  //       const { id, sectionId, projectId } = this.props.rightData;
  //       const object = {
  //         projectId: projectId,
  //         sectionId: sectionId,
  //         trainId: id,
  //         intExtStaff: 1,
  //       };
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
  
  handleGetNames = () => {
    axios.get(queryRyglPeopleList2(this.props.rightData.trainUnitId,this.props.rightData.id)).then(res => {
      const { data } = res.data;
      data.map((item,index)=>{
        item['learnTime'] = (!this.props.rightData ||!this.props.rightData.trainLearnTime)?0:this.props.rightData.trainLearnTime;
      });
      this.setState({
        workerName: data,
      });
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
          edit = {this.props.edit}
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
                disabled={this.state.workerName.length === 0 && this.state.canClick}
                onClick={() => this.handleSubmit(0)}
                type="primary"
              >
                保存
              </Button>
              {/* <Button
                disabled={!this.state.is_tz}
                type="primary"
                onClick={() => this.handleSubmit(1)}
              >
                保存并上报
              </Button> */}
            </div>
          }
          // onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          {this.state.workerName.length > 0 ? (
            this.state.workerName.map((item, index) => {
              return (
                <div key={index}>
                  <div className={style.item}>
                    {/* <Checkbox
                          style={{ width: 150, flexShrink: 0 }}
                          onChange={e => this.handleOnChange(index, e.target.checked)}
                        >
                        </Checkbox> */}
                    <span style={{ flexShrink: 0, width: 100 }}>{item.name}</span>
                    <div>
                      <span>学时（小时）</span>
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        onChange={e => this.handleOnChageInput(e, index, 'learnTime')}
                        max={999}
                        defaultValue={(!rightData||!rightData.trainLearnTime)?0:rightData.trainLearnTime}
                      />
                    </div>
                    <div>
                      <span>考试得分</span>
                      <InputNumber
                        style={{ width: '100%' }}
                        onChange={e => {
                          this.handleOnChageInput(e, index, 'score');
                        }}
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                  {/* <Divider /> */}
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center' }}>
              <span>没有进场人员，无法添加</span>
            </div>
          )}
        </Modal>
      </Fragment>
    );
  }
}

export default AddModal;
