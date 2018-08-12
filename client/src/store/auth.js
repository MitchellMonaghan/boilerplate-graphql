import { Cookies, extend } from 'quasar'
import jwt from 'jsonwebtoken'
import gql from 'graphql-tag'

const state = extend({}, {
  user: null,
  token: null
})

const mutations = extend({}, {
  setUser (state, user) {
    if (user) {
      state.user = user
    } else {
      state.user = null
    }
  },

  setToken (state, token) {
    if (token) {
      state.token = token

      Cookies.set('token', token, {
        expire: '', // TODO: Set expiration to match token
        domain: window.location.hostname,
        secure: process.env.PROD // require https on production
      })
    } else {
      state.token = null
      Cookies.remove('token')
    }
  }
})

const actions = extend({}, {
  async getCurrentUser ({commit}) {
    // Get token
    const token = Cookies.get('token')

    if (token) {
      await commit('setToken', token)
      const decodedToken = jwt.decode(token)

      // Request user from server
      const response = await this._vm.$apollo.query({
        variables: decodedToken.user,
        query: gql`
          query($id: ID!) {
            getUser(id: $id){
              id
              username
              email
              firstName
              lastName
              permissions{
                create_user
                read_user
                update_user
              }
            }
          }
        `
      })

      commit('setUser', response.data.getUser)
    }
  },

  async register ({ commit }, form) {
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: gql`
        mutation RegisterUser($username: String!, $email: String!, $password: String!) {
          registerUser(username: $username, email: $email, password: $password)
        }
      `
    })
  },

  async verify ({ commit }, token) {
    commit('setToken', token)

    await this._vm.$apollo.mutate({
      mutation: gql`
        mutation verifyEmail {
          verifyEmail
        }
      `
    })
  },

  async login ({ commit }, form) {
    const response = await this._vm.$apollo.query({
      variables: form,
      query: gql`
        query($username: String!, $password: String!) {
          authenticateUser(username: $username, password: $password)
        }
      `
    })

    commit('setToken', response.data.authenticateUser)
  },

  async logout ({ commit }) {
    commit('setToken')
  }
})

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
