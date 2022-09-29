import * as React from 'react';
import './index.css';
import { widget } from '../../charting_library';

// https://aitrade.ga/books/tradingview/  文档1
//https://aitrade.ga/books/proficient-tradingview/  文档2
function getLanguageFromURL() {
  const regex = new RegExp('[\\?&]lang=([^&#]*)');
  const results = regex.exec(window.location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

export class TVChartContainer extends React.PureComponent {
  static defaultProps = {
    symbol: 'AAPL',
    interval: 'D',
    datafeedUrl: 'https://demo_feed.tradingview.com',
    libraryPath: '/charting_library/',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    chartsStorageApiVersion: '1.1',
    clientId: 'tradingview.com',
    userId: 'public_user_id',  //后台给，没有就默认
    fullscreen: false,
    autosize: true,
    studiesOverrides:{
      "volume.volume.color.0": "#00FFFF"
    }
  };

  tvWidget = null;

  constructor(props) {
    super(props);

    this.ref = React.createRef();
  }
  // datafeed  定义图表控件
  //   {
  //   supports_search: true,
  //     supports_group_request: false,
  //       supports_marks: true,
  //         exchanges: [
  //           { value: "", name: "All Exchanges", desc: "" },
  //           { value: "XETRA", name: "XETRA", desc: "XETRA" },
  //           { value: "NSE", name: "NSE", desc: "NSE" }
  //         ],
  //           symbolsTypes: [
  //             { name: "All types", value: "" },
  //             { name: "Stock", value: "stock" },
  //             { name: "Index", value: "index" }
  //           ],
  //             supportedResolutions: ["1", "15", "30", "60", "D", "2D", "3D", "W", "3W", "M", '6M']
  // };
  componentDidMount() {
    // https://aitrade.ga/books/tradingview/book/Widget-Constructor.html  配置参考
    const widgetOptions = {
      symbol: this.props.symbol, //交易对
      // BEWARE: no trailing slash is expected in feed URL
      datafeed: new window.Datafeeds.UDFCompatibleDatafeed(this.props.datafeedUrl), //定义图表控件
      interval: this.props.interval, //时间范围 1m 15m等
      container: this.ref.current,
      library_path: this.props.libraryPath, //包地址

      locale: getLanguageFromURL() || 'en',  //各个国家语言支持
      disabled_features: ['use_localstorage_for_settings', 'header_widget', 'header_screenshot'], //禁止的图标功能，看https://tradingview.gitee.io/featuresets/
      enabled_features: ['study_templates'], //启用的图标功能，看https://tradingview.gitee.io/featuresets/
      // charts_storage_url: this.props.chartsStorageUrl,  //保存/加载等高级api（用不到）
      // charts_storage_api_version: this.props.chartsStorageApiVersion,  //后台版本（用不到）
      client_id: 'tradingview.com',  //保存/加载等高级api（固定）
      user_id: this.props.userId, //保存/加载等高级api
      fullscreen: this.props.fullscreen,  //布尔值显示图表是否占用窗口中所有可用的空间，全屏方法可用
      autosize: this.props.autosize, //并在调整窗格本身大小时自动调整大小
      studies_overrides: this.props.studiesOverrides, //用此选项自定义默认指标的样式及输入值
      // overrides //样式 Candles ，Bar ，Area //对Widget对象的默认属性进行覆盖,动态改变样式，换肤
      //'paneProperties.background'
      //'mainSeriesProperties.candleStyle.upColor'
      //'mainSeriesProperties.barStyle.upColor'
      //'mainSeriesProperties.hollowCandleStyle.upColor'
      //'mainSeriesProperties.areaStyle.linecolor'
    };

    const tvWidget = new widget(widgetOptions);
    this.tvWidget = tvWidget;

    tvWidget.onChartReady(() => {
      tvWidget.headerReady().then(() => {
        const button = tvWidget.createButton();
        button.setAttribute('title', 'Click to show a notification popup');
        button.classList.add('apply-common-tooltip');
        button.addEventListener('click', () => tvWidget.showNoticeDialog({
          title: 'Notification',
          body: 'TradingView Charting Library API works correctly',
          callback: () => {
            console.log('Noticed!');
          },
        }));

        button.innerHTML = 'Check API';
      });
    });
  }

  componentWillUnmount() {
    if (this.tvWidget !== null) {
      this.tvWidget.remove();
      this.tvWidget = null;
    }
  }

  render() {
    return (
      <div
        ref={this.ref}
        className={'TVChartContainer'}
      />
    );
  }
}
