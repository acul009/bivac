<script setup lang="ts">
import bivac from '../bivac'
import Table from './Table.vue'
import Row from './Row.vue'
import Cell from './Cell.vue'
import { computed, onMounted, onUnmounted, reactive, ref, type Ref } from 'vue';
import SnapshotList from './SnapshotList.vue';

const props = defineProps<{
  id: string
}>()

const vol = computed(() => { return bivac.volumes.value[props.id] })

const selectedSnapshot: Ref<undefined | string> = ref(undefined)


</script>

<template>
  <div class="wrapper">
    <SnapshotList :id="id" @selected="(id) => { selectedSnapshot = id }"></SnapshotList>
  </div>
</template>

<style scoped>

.wrapper {
    width: 100%;
    padding: 20px;
    border: 1px solid var(--color-border);
}

</style>