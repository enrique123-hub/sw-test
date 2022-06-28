import Vue from 'vue'
import Vuex from 'vuex'

import idbs from './indexDB/indexDBservice'
import ls from './indexDB/localStorageSercice'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    todos: [],
    completed: [],
    dataFields: ['todos', 'completed']
  },
  mutations: {
    setState (state, { field, data }) {
      Vue.set(state, field, data)
    },
    addTodo (state, newTodo) {
      state.todos.push(newTodo)
    },
    deleteTodo (state, { todoIndex, isCompleted }) {
      if (isCompleted) {
        state.completed.splice(todoIndex, 1)
      } else {
        state.todos.splice(todoIndex, 1)
      }
    },
    completeTodo (state, todoIndex) {
      state.completed.push(state.todos.splice(todoIndex, 1)[0])
    }
  },
  actions: {
    addTodo ({ commit, dispatch }, newTodo) {
      commit('addTodo', newTodo)
      dispatch('saveTodos')
    },
    deleteTodo ({ commit, dispatch }, todoInfo) {
      commit('deleteTodo', todoInfo)
      dispatch('saveTodos')
    },
    completeTodo ({ commit, dispatch }, todoIndex) {
      commit('completeTodo', todoIndex)
      dispatch('saveTodos')
    },
    checkStorage ({ state, commit }) {
      state.dataFields.forEach(async field => {
        try {
          let data = await idbs.checkStorage(field)

          // LocalStorage did not find the data, reset it
          if (data === null) data = []

          commit('setState', { field, data })
        } catch (e) {
          // The value in storage was invalid or corrupt so just set it to blank
          commit('setState', { field, data: [] })
        }
      })
    },
    async saveTodos ({ state }) {
      try {
        await Promise.all(state.dataFields.map(field => idbs.saveToStorage(field, state[field])))
      } catch (e) {
        state.dataFields.forEach(field => ls.saveToStorage(field, state[field]))
      }
    }
  }
})
