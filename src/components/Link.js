import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { GC_USER_ID } from '../constants'
import { timeDifferenceForDate } from '../utils'

class Link extends Component {

  render() {
    const userId = localStorage.getItem(GC_USER_ID)
    return (
      <div className='flex mt2 items-start'>
        <div className='flex items-center'>
          <span className='gray'>{this.props.index + 1}.</span>
          {
            userId &&
            <div
              className={'ml1 pointer f11 ' + (this._userAlreadyVoted() ? 'moon-gray' : 'gray') }
              onClick={() => this._voteForLink()}
            >
              ▲
            </div>
          }
        </div>
        <div className='ml1'>
          <div>
            <span className='link-description'>{this.props.link.description} </span>
            (<a href={this.props.link.url}>{this.props.link.url}</a>)
          </div>
          <div className='f6 lh-copy gray'>
            {this.props.link.votes.length} votes | by {this.props.link.postedBy ? this.props.link.postedBy.name : 'Unknown'} {timeDifferenceForDate(this.props.link.createdAt)}</div>
        </div>
      </div>
    )
  }

  _userAlreadyVoted = () => {
    const userId = localStorage.getItem(GC_USER_ID)
    const voterIds = this.props.link.votes.map(vote => vote.user.id)
    return voterIds.includes(userId)
  }

  _voteForLink = async () => {
    const userId = localStorage.getItem(GC_USER_ID)
    if (this._userAlreadyVoted()) {
      console.log(`User (${userId}) already voted for this link`)
      return
    }
    const linkId = this.props.link.id
    await this.props.createVoteMutation({
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.props.updateStoreAfterVote(store, createVote, linkId)
      }
    })
  }

}

const CREATE_VOTE_MUTATION = gql`
  mutation CreateVoteMutation($userId: ID!, $linkId: ID!) {
    createVote (userId: $userId, linkId: $linkId) {
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`

export default graphql(CREATE_VOTE_MUTATION, {
  name: 'createVoteMutation'
})(Link)
