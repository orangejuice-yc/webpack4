/*
 * @Author: wihoo.wanghao 
 * @Date: 2019-01-17 11:43:11 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-02-23 16:02:18
 */

import React, { Component } from 'react'
import Search from '../../../../components/public/Search'
import style from './style.less'
import { Divider } from 'antd';
import ResourceBtn from "../../../../components/public/TopTags/ResourceBtn"
import AddTopBtn from "../../../../components/public/TopTags/AddTopBtn"
import DeleteTopBtn from "../../../../components/public/TopTags/DeleteTopBtn"
import AddKindBtn from "../../../../components/public/TopTags/AddKindBtn"
import AddEquipBtn from "../../../../components/public/TopTags/AddEquipBtn"
import AddMaterialBtn from "../../../../components/public/TopTags/AddMaterialBtn"
import ImportTopBtn from "../ImportTopBtn/"
import PublicButton from "../../../../components/public/TopTags/PublicButton"
import PublicMenuButton from "../../../../components/public/TopTags/PublicMenuButton"
import PublicViewButton from '../../../../components/public/TopTags/PublicViewButton';
export class PlanDefineTopTags extends Component {
    constructor(props) {
        super(props)
        this.state = {
            select: true,
            view: "user",
            roleBtnData: [
                {
                    id: 1,
                    name: 'ResourceBtn',
                    aliasName: '资源'
                },
                {
                    id: 2,
                    name: 'NewDropdownBtn',
                    aliasName: '新增(下拉)'
                },
                {
                    id: 3,
                    name: 'DeleteTopBtn',
                    aliasName: '删除'
                }

            ]
        }
    }
    // modal取消
    handleCancel = () => {
        this.setState({
            modalVisible: false
        })
    }
    onClickHandle = (name, title) => {
        if(name=="PublicViewButton"){
            this.setState({
                view: title
            }, () => {
                this.props.onClickHandle(name, title)
            })
        }
        if(name =="DeleteTopBtn"){
          this.props.onClickHandle(name);
        }

    }

    

    render() {
        return (
            <div className={style.main}>
                <div className={style.search}>
                    <Search search={this.props.search} />
                </div>
                <div className={style.tabMenu}>
                <PublicViewButton afterCallBack={ this.props.viewChange } icon={"icon-ziyuanshituxuanze"}
                                  currentIndex={this.props.selectType && this.props.selectType == 'user' ? 0 :this.props.selectType && this.props.selectType == 'equip' ? 1 : 2}
                                  menus={[{ key: "user", label: "人力资源", edit: true },
                                    { key: "equip", label: "设备资源", edit: true},
                                    { key: "material", label: "材料资源", edit: true}]}/>
                  <Divider type="vertical" />
                      {/*新增设备*/}
                    {/* {this.state.view == "user" && <AddTopBtn onClickHandle={this.props.onClickHandle}></AddTopBtn>} */}
                    {this.props.selectType== "user" && <PublicButton name={'新增'} title={'新增'} icon={'icon-add'} afterCallBack={this.props.onClickHandle.bind(this, 'AddTopBtn')} />}
                    {this.props.selectType == "user" && <ImportTopBtn onClickHandle={this.props.onClickHandle} refresh={this.props.refresh}></ImportTopBtn>}
                    {/* {this.state.view != "user" && <AddKindBtn onClickHandle={this.props.onClickHandle}></AddKindBtn>} */}
                    {/* {this.state.view == "equip" && <AddEquipBtn onClickHandle={this.props.onClickHandle}></AddEquipBtn>} */}
                      {/*新增设备*/}
                    {this.props.selectType == "equip" && <PublicButton name={'新增设备'} title={'新增设备'} icon={'icon-add'} afterCallBack={this.props.onClickHandle.bind(this, 'AddEquipBtn')} />}
                    {/* {this.state.view == "material" && <AddMaterialBtn onClickHandle={this.props.onClickHandle}></AddMaterialBtn>} */}
                      {/*新增材料*/}
                      {this.props.selectType == "material" && <PublicButton name={'新增材料'} title={'新增材料'} icon={'icon-add'} afterCallBack={this.props.onClickHandle.bind(this, 'AddMaterialBtn')} />}

                    {/* <DeleteTopBtn onClickHandle={this.props.onClickHandle}></DeleteTopBtn> */}
                        {/*删除*/}
                        <PublicButton title={"删除"} useModel={true} verifyCallBack={this.props.deleteVerifyCallBack} afterCallBack={this.props.onClickHandle.bind(this, "DeleteTopBtn")} icon={"icon-delete"} />
                </div>


            </div>

        )
    }
}

export default PlanDefineTopTags
