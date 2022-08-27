<script setup lang="ts">
import bivac from '../bivac'
import Table from './Table.vue'
import Row from './Row.vue'
import Cell from './Cell.vue'
import { computed, onMounted, onUnmounted, reactive, ref, type Ref } from 'vue';

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "selected", id: string | undefined): void;
}>();

const snapshots: Ref<{[key: string]: string}[]> = ref([])

let autoreload;
onMounted(() => {
  autoreload = bivac.autoreload(async () => {
  snapshots.value = await bivac.restic.snapshots(props.id)
})
})
onUnmounted(() => {
  autoreload.cancel()
})



</script>

<template>
  <Table>
    <Row class="headerRow">
      <Cell>ID</Cell>
      <Cell>Time</Cell>
      <Cell>Host</Cell>
      <Cell>Tags</Cell>
      <Cell>Paths</Cell>
    </Row>
    <Row v-for="snap of snapshots">
      <Cell>{{snap.ID}}</Cell>
      <Cell>{{snap.Time}}</Cell>
      <Cell>{{snap.Host}}</Cell>
      <Cell>{{snap.Tags}}</Cell>
      <Cell>{{snap.Paths}}</Cell>
    </Row>
  </Table>
</template>

<style scoped>

</style>