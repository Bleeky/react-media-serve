import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { SquareboardMediaIcon } from 'components';
import { serveFile } from 'components/medias/MediaManager/actions';
import loadingPic from 'assets/images/nopic/loadingPic.png';
import uuid from 'uuid/v1';
import 'intersection-observer';

class Serve extends Component {
  static propTypes = {
    media: PropTypes.shape().isRequired,
    showContent: PropTypes.bool,
    hash: PropTypes.string,
    publicHash: PropTypes.string,
    size: PropTypes.number,
    src: PropTypes.string,
    classNames: PropTypes.shape(),
    background: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    hash: null,
    size: null,
    src: null,
    onClick: null,
    publicHash: null,
    background: false,
    showContent: false,
    classNames: {},
  };

  constructor(props) {
    super(props);
    this.state = {
      url: null,
      uniqueHash: uuid(),
    };

    this.unmounted = false;
  }

  async componentWillMount() {
    if (this.props.src) {
      this.setState({ url: this.props.src });
    }
  }

  componentDidMount() {
    if (this.props.hash &&
      (this.props.media.type.includes('image') || (this.props.media.extension.includes('pdf') && this.props.showContent))) {
      const element = document.getElementById(this.state.uniqueHash);
      const io = new IntersectionObserver(
        async (entry) => {
          if (!this.state.url && entry[0].isIntersecting) {
            this.promise = serveFile(this.props.hash, this.props.size, true, this.props.publicHash);
            const url = await this.promise.call();
            if (url && !this.unmounted) {
              this.setState({ url });
            }
          }
        },
        {
          threshold: [0],
        },
      );
      io.observe(element);
    }
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.hash && nextProps.hash !== this.props.hash) {
      this.setState({ url: null });
      if (nextProps.media.type.includes('image') || (nextProps.media.extension.includes('pdf') && nextProps.showContent)) {
        this.promise = serveFile(nextProps.hash, nextProps.size, true, nextProps.publicHash);
        const url = await this.promise.call();
        if (url && !this.unmounted) {
          this.setState({ url });
        }
      }
    }
  }

  componentWillUnmount() {
    if (this.promise) {
      this.unmounted = true;
      this.promise.cancel();
    }
  }

  render() {
    if (this.props.media.type.includes('image')) {
      if (this.props.background) {
        return (
          <div
            id={this.state.uniqueHash}
            onClick={this.props.onClick}
            className={`${this.props.classNames.image}${this.state.url ? ' is-loaded' : ''}`}
            style={{ backgroundImage: `url('${this.state.url ? this.state.url : loadingPic}')` }}
          />);
      }
      return (
        <img
          id={this.state.uniqueHash}
          onClick={this.props.onClick}
          className={`${this.props.classNames.image}${this.state.url ? ' is-loaded' : ''}`}
          alt=""
          src={this.state.url ? this.state.url : loadingPic}
        />
      );
    }
    if (this.props.showContent && this.props.media.extension.includes('pdf')) {
      return (
        <div
          id={this.state.uniqueHash}
          style={{ width: '100%', height: '100%' }}
        >
          <object type="application/pdf" width="100%" height="100%" data={this.state.url ? this.state.url : loadingPic} />
        </div>
      );
    }
    return (
      <SquareboardMediaIcon
        onClick={this.props.onClick}
        media={this.props.media}
        className={this.props.classNames.icon}
      />
    );
  }
}

export default Serve;
