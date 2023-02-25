<script setup lang="ts">
import bivac from '../bivac'
import Table from './Table.vue'
import Row from './Row.vue'
import Cell from './Cell.vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

const props = defineProps<{
  id: string
}>()

const vol = computed(() => {return bivac.volumes.value[props.id]})
const debug = computed(() => {return JSON.stringify(vol.value.Logs)})
</script>

<template>
  <Table>
    <Row v-for="(log, name) in vol.Logs">
      <Cell>{{ name }}</Cell><Cell>{{log}}</Cell>
    </Row>
    
  </Table>
</template>-

<style scoped>

.success {
  background-color: var(--color-background-success);
  color: var(--color-text-success);
}

.fail {
  background-color: var(--color-background-fail);
  color: var(--color-text-fail);
}

.status {
  width: 100%;
  text-align: center;
  padding: 0.5em;
  font-size: 1.5em;
}

</style>