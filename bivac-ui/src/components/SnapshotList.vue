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

bivac.autoreload(async () => {
  snapshots.value = await bivac.restic.snapshots(props.id)
  console.log(snapshots.value)
})

</script>

<template>
</template>

<style scoped>

</style>