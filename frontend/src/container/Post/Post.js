import React, {Component} from 'react';

import { getSinglePost } from '../../store/actions/postAction';

import {createCommentAction, createReplyAction} from '../../store/actions/commentAction';
import { connect } from 'react-redux';

import { formatDate } from '../../helpers/';

import { Link } from 'react-router-dom';

import classes from './Post.module.css';

class Post extends Component {
  state = {
    reply: '',
    commentId: '',
    prevAction: null,
    action: ''
  }

  componentDidMount = () => {
    this.props.getSinglePost(this.props.match.params.id);
  }

  // submit the form to create a reply

  handleFormSubmit = (ev) => {
    ev.preventDefault();

    // create a reply
    if (this.state.action === 'create-reply') {
      let formatData = {
        reply: this.state.reply
      };

      this.props.createReply(formatData, 
          this.state.commentId,
          this.props.match.params.id);

      let form = document.querySelector('#' + this.state.commentId);
      form.classList.toggle(classes.hidden);

      this.setState({
        reply: '',
        commentId: ''
      });

    }
  }

  handleReplyInputChange = (ev) => {
    this.setState({
      reply: ev.target.value
    })
  }
  

  showReplyBox = (ev) => {
    let commentId = ev.target.getAttribute('data-commentid');
    let form = document.querySelector('#' + commentId);
    // handles functionality for when the 
    // same box can be used to create a reply, edit a reply or edit a comment
    this.setState({
      prevAction: this.state.action,
      action: 'create-reply'
    }, () => {
      if (this.state.commentId === commentId) {
        // for the future when i implement the edit 
        // a  comment and edit a reply
        // if the user tries to edit a reply to a comment
        // or a comment right after each other use the same box
        if (this.state.prevAction !== this.state.action) {
          return;
        } else {
          // close the reply box and reset state if
          // the same button was pressed again
          form.classList.toggle(classes.hidden);
          return this.setState({
            commentId: '',
            action: '',
            prevAction: '',
            reply: ''
          })
        }
      } 
    
      // if a different reply box is open while
      // another is open close the previous one

      if (this.state.commentId !== commentId && this.state.commentId) {
        let previousForm = document.querySelector('#' + this.state.commentId);
        previousForm.classList.toggle(classes.hidden);
        this.setState({
          commentId: '',
          reply: ''
        });
      }


      // show the textbox when none have been pressed initially 
      // or one has been closed
      form.classList.toggle(classes.hidden);
      this.setState({
        commentId: commentId
      });

    });
  }

  render () {
    const { post } = this.props;
    let commentsElements = (null);

    if (post && post.comments) {
      commentsElements = post.comments.map((comment, index) => {
        let commentDate = formatDate(comment.createdAt)
        let replies = comment.replies.map((reply, index) => {
          let replyDate = formatDate(reply.createdAt);

          return (
            <div key={index}>
              <p>
                {reply.creatorName} - {replyDate}
              </p>

              <p>
                {reply.reply}
              </p>
            </div>
          )
        });

        return (
          <div key={index}>
            <div>
              <p>
                {comment.creatorUsername} - {commentDate}
              </p>

              <p>
                {comment.comment}
              </p>

              <p 
                onClick={this.showReplyBox}
                data-commentid={'a' + comment._id}>
                reply
              </p>
            </div>
            {/*
              give it the id of the comment it is replying too.
            */}
            <form
              className={classes.hidden} 
              // the comment id sometimes starts with a number
              // I have to add something in front to make
              // it a valid css selector
              id={'a' + comment._id}
              onSubmit={this.handleFormSubmit}>
              <div>
                <label htmlFor="reply">
                  reply
                </label>
                <input
                  type="text"
                  id="reply"
                  name="reply"
                  value={this.state.reply}
                  onChange={this.handleReplyInputChange}
                />
              </div>
              <button>
                submit
              </button>
            </form>
            <div>
              {replies}
            </div>
          </div>
        )
      })
    }

    let displayPost = (null);

    if (post) {
      let postDate = formatDate(post.createdAt)

      displayPost = (
        <div>
          <div>
            <p>
              {postDate} - {post.creatorName}
            </p>
          </div>
          <h1>
            {post.title}
          </h1>
          <p>
            {post.content}
          </p>
        </div>
      )
    }

    let allowToCreateComment = localStorage.token ? (
      <form onSubmit={this.handleSubmit}>
        <div>
          <label htmlFor="comment"></label>
          <input
            type="text"
            id="comment"
            name="comment"
            onChange={this.handleChange} />
        </div>
        <div>
          <button>
            create
            </button>
        </div>
      </form>
    ) : (
      <div>
        <p>
          <Link to='/login'>
            login
          </Link> or   
           <Link to='/register'>
             register
            </Link> to create a comment
        </p>
      </div>
    )

    return (
      <div>
        { displayPost }
        { allowToCreateComment }
        { commentsElements }
      </div>
    )
  }

  handleChange = (ev) => {
    this.setState({
      comment: ev.target.value
    });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();

    let formatData = {
      comment: this.state.comment
    };

    this.props.createComment(formatData, this.props.match.params.id)
  }
}

const mapStateToProps = (state) => {
  return {
    post: state.posts.post
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    getSinglePost: (id) => {
      dispatch(getSinglePost(id));
    },

    createComment: (comment, id) => {
      dispatch(createCommentAction(comment, id));
    },

    createReply: (reply, commentId, postId) => {
      dispatch(createReplyAction(reply, commentId, postId));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);