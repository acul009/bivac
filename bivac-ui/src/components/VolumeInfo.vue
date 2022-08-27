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

const age = ref('')

function loadAge() {

  const last = new Date(vol.value.LastBackupDate + "Z")
  const seconds = Math.floor((Date.now().valueOf() - last.valueOf())/1000)

  age.value = bivac.secondsToReadableTime(seconds)
}
const reload = bivac.autoreload(() => {loadAge();})
onUnmounted(() => {reload.cancel();})

</script>

<template>
  <Table>
    <Row>
      <Cell>ID</Cell><Cell>{{id}}</Cell>
    </Row>
    <Row>
      <Cell>Name</Cell><Cell>{{vol.Name}}</Cell>
    </Row>
    <Row>
      <Cell>Last Status</Cell>
      <Cell>
          <div class="status" :class="vol.LastBackupStatus === 'Success' ? 'success' : 'fail'">{{vol.LastBackupStatus}}</div>
      </Cell>
    </Row>
    <Row>
      <Cell>Last Backup</Cell><Cell>{{ vol.LastBackupDate }} ({{age}} old)</Cell>
    </Row>
    <Row>
      <Cell>Backup Directory</Cell><Cell>{{vol.BackupDir ? vol.BackupDir : '/'}}</Cell>
    </Row>
    <Row>
      <Cell>Mountpoint</Cell><Cell>{{vol.Mountpoint}}</Cell>
    </Row>
  </Table>
</template>

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