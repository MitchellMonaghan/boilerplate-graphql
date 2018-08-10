import { Cookies, extend } from 'quasar'
import jwt from 'jsonwebtoken'
import gql from 'graphql-tag'

const state = extend({}, {
  user: null,
  token: null
})

const mutations = extend({}, {
  setToken (state, token) {
    if (token) {
      const decodedToken = jwt.decode(token)

      state.token = token
      state.user = decodedToken.user

      Cookies.set('token', token, {
        expire: '', // TODO: Set expiration to match token
        domain: window.location.hostname,
        secure: process.env.PROD // require https on production
      })
    } else {
      state.token = null
      state.user = null
      Cookies.remove('token')
    }
  }
})

const actions = extend({}, {
  async register ({ commit }, form) {
    console.log(this._vm.$apollo)
    await this._vm.$apollo.mutate({
      variables: form,
      mutation: gql`
        mutation RegisterUser($username: String!, $email: String!, $password: String!) {
          registerUser(username: $username, email: $email, password: $password)
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
