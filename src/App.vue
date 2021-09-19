<template>
  <div id="app">
    <FileSelection
      :files="[]"
      title="图片"
      :types="['image']"
      :max="1"
      @updateList="() => {}"
      :config="{
        getApi: '',
        saveApi: '',
        deleteApi: ''
      }"
      :crop="true"
      :cropWidth="200"
      :cropHeight="250"
    >
    </FileSelection>
  </div>
</template>

<script>
import FileSelection from './components/FileSelection'

export default {
  name: 'app',
  components: {
    FileSelection
  },
  data () {
    return {
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
