import React, { Component } from 'react'
import style from './style.less'
import { } from 'antd';
import emitter from '../../../../api/ev';
import intl from 'react-intl-universal'
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
// 引入柱状图
import  'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

const locales = {
    "en-US": require('../../../../api/language/en-US.json'),
    "zh-CN": require('../../../../api/language/zh-CN.json')
}

class ChartAnalysis extends Component {
    constructor(props) {
        super(props)
        this.state = {
            initDone: false,
           
        }
    }

    componentDidMount() {
        this.loadLocales();
        this.setState({
            width: this.props.width
        })
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
         // 绘制图表
         myChart.setOption({
           title: { text: 'ECharts 入门示例',
          
        },
            tooltip: {},
            xAxis: {
                data: ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"]
            },
            yAxis: {
                data:[2,4,6,8,10,12,14]
            },
            
            series: [{
                name: '销量',
                type: 'bar',
                data: [5,3, 4, 7, 10, 2]
            }]
        });
    }

    loadLocales() {
        intl.init({
            currentLocale: 'zh-CN',
            locales,
        })
            .then(() => {
                // After loading CLDR locale data, start to render
                this.setState({ initDone: true });
            });
    }

    
    render() {
       
       
        return (
            <div className={style.main}>
                <h3 className={style.listTitle}>设备资源分析图</h3>
                <div id="main" style={{ width: 400, height: 400 }}></div>
            </div>
        )
    }
}

export default ChartAnalysis
