<script setup lang="ts">
import bivac from '../bivac'
import Table from './Table.vue'
import Row from './Row.vue'
import Cell from './Cell.vue'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';

const props = defineProps<{
  id: string
}>()

const emit = defineEmits<{
  (e: "selected", id: string | undefined): void;
}>();

</script>

<template>
</template>

<style scoped>

</style>