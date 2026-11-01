import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <section className="page-sheet" role="alert">
      <h1>{this.props.language === 'zh' ? '这一页未能展开' : 'This page could not open.'}</h1>
      <p>{this.props.language === 'zh' ? '请刷新页面重试。已保存的阅读进度会保留。' : 'Please reload and try again. Your saved reading progress will be kept.'}</p>
      <button className="primary-button" onClick={() => window.location.reload()}>{this.props.language === 'zh' ? '重新加载' : 'Reload page'}</button>
    </section>;
    return this.props.children;
  }
}
