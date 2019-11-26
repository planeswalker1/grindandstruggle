const Reply = require('../models/Schemas/Reply');
const Comment = require('../models/Schemas/Comment');



/**
 * save the reply made by a user into the comment schema
 * so we can populate it when we fetch it
 * 
 * @param {Object} req.body - information the user sent
 * @param {String} req.body.reply - the reply made by the user
 */


exports.createReplyToComment = (req, res, next) => {
  if (!req.body.reply) {
    return res.status(403).send('Missing Reply');
  }

  const formatData = {
    reply: req.body.reply,
    creator: req.user._id,
    creatorName: req.user.username,
    createdAt: new Date()
  }
  
  const reply = new Reply(formatData);

  reply.save()
    .then((reply) => {
      Comment.findById(req.params.commentId)
        .then((comment) => {
          comment.replies.push(reply._id);
          comment.save()
            .then(() => res.json(reply))
            .catch((err) => next(err))
        })
        .catch((err) => {
          return next(err);
        })
    })
    .catch((err) => next(err));
}

/**
 * save the reply made to a reply into the reply
 * schema to be able to fetch it later and be able 
 * to display it differently
 * 
 * @param {Object} req.body - data sent by the user
 * @param {String} req.body.reply - the reply made to the reply
 */

exports.createReplyToReply = (req, res, next) => {
  if (!req.body.reply) {
    return res.status(403).send('Missing Reply');
  }

  const formatData = {
    reply: req.body.reply,
    creator: req.user._id,
    creatorName: req.user.username,
    createdAt: new Date()
  }

  const reply = new Reply(formatData);

  reply.save()
    .then((reply) => {
      // save the reply that was made into the reply
      // to be able to populate all the replies made to a reply
      Reply.findById(req.params.replyId)
        .then((replyingTo) => {
          replyingTo.replies.push(reply._id);

          replyingTo.save()
            .then(() => res.json(reply))
            .catch((err) => next(err));
        })
        .catch((err) => next(err))
    })
    .catch((err) => next(err));
}