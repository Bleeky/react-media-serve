import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { SquareboardMediaIcon } from 'components';
import { serveFile } from 'components/medias/MediaManager/actions';
import loadingPic from 'assets/images/nopic/loadingPic.png';
import uuid from 'uuid/v1';
import 'intersection-observer';

class Serve extends Component {
  static propTypes = {
    dbPromise: PropTypes.func.isRequired,
    media: PropTypes.shape(),
    fetchMediaParams: PropTypes.shape(),
    mediaUuid: PropTypes.string,
    src: PropTypes.string,
    showContent: PropTypes.bool,
    hash: PropTypes.string,
    classNames: PropTypes.shape(),
    background: PropTypes.bool,
    onClick: PropTypes.func,
  }

  static defaultProps = {
    hash: null,
    src: null,
    onClick: null,
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

  componentWillMount() {
    if (this.props.src) {
      this.setState({ url: this.props.src });
    }
  }

  componentDidMount() {
      const element = document.getElementById(this.state.uniqueHash);
      const io = new IntersectionObserver(
        async (entry) => {
          if (this.props.mediaUuid &&
            (this.props.media.type.includes('image') || (this.props.media.extension.includes('pdf') && this.props.showContent))) {
              if (!this.state.url && entry[0].isIntersecting) {
                this.promise = serveFile(this.props.mediaUuid, this.props.fetchMedia, {...this.props.fetchMediaParams});
                const url = await this.promise.call();
                if (url && !this.unmounted) {
                  this.setState({ url });
                }
              }
            }
          else if (this.props.src) {
            this.setState({url: this.props.src})
          }
        },
        {
          threshold: [0],
        },
      );
      io.observe(element);
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.mediaUuid && nextProps.mediaUuid !== this.props.mediaUuid) {
      this.setState({ url: null });
      if (nextProps.media.type.includes('image') || (nextProps.media.extension.includes('pdf') && nextProps.showContent)) {
        this.promise = serveFile(nextProps.mediaUuid, nextProps.fetchMedia, {...nextProps.fetchMediaParams});
        const url = await this.promise.call();
        if (url && !this.unmounted) {
          this.setState({ url });
        }
      }
      else if (this.props.src) {
        this.setState({url: this.props.src})
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
    return (this.props.mediaRenderer(this.props.media));
  }
}

export default Serve;
